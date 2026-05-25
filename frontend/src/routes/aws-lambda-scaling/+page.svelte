<script lang="ts">
  import { onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { t } from '$lib/i18n';
  import {
    DEFAULT_INITIAL_BURST,
    DEFAULT_SCALING_CONFIG,
    MAX_TICKS,
    SCALING_RATE_PER_TICK,
    TICK_MS,
    TICKS_PER_SECOND,
    arrivalsAtTick,
    computeCost,
    executionTicks,
    functionTotalCeiling,
    provisionedMonthlyCost,
    type ScalingConfig,
    type ScalingEnvironment,
    type ScalingSample,
    type ScalingTotals,
  } from '$lib/services/lambda-scaling';
  import ScalingConfigurator from '$lib/components/ScalingConfigurator.svelte';
  import TrafficGenerator from '$lib/components/TrafficGenerator.svelte';
  import BurstBudgetMeter from '$lib/components/BurstBudgetMeter.svelte';
  import ConcurrencyTimeline from '$lib/components/ConcurrencyTimeline.svelte';
  import ScalingMetricsPanel from '$lib/components/ScalingMetricsPanel.svelte';
  import ExplanationBlock from '$lib/components/ExplanationBlock.svelte';

  let config: ScalingConfig = $state({ ...DEFAULT_SCALING_CONFIG });
  let environments: ScalingEnvironment[] = $state([]);
  let samples: ScalingSample[] = $state([]);
  let totals: ScalingTotals = $state({
    totalRequests: 0,
    successful: 0,
    throttledBurst: 0,
    throttledAccount: 0,
    coldStarts: 0,
    warmStarts: 0,
  });
  let burstBudget = $state(DEFAULT_INITIAL_BURST);
  let running = $state(false);
  let tick = $state(0);
  let nextEnvId = 1;
  let nextInvocationId = 1;
  let intervalId: ReturnType<typeof setInterval> | undefined;

  $effect(() => {
    const provisioned = config.provisionedConcurrency;
    const currentProvisioned = environments.filter((e) => e.provisioned).length;
    if (provisioned > currentProvisioned) {
      const toAdd = provisioned - currentProvisioned;
      for (let i = 0; i < toAdd; i++) {
        environments.push({
          id: nextEnvId++,
          state: 'idle',
          provisioned: true,
          bornAtTick: tick,
          invocationsServed: 0,
        });
      }
      environments = [...environments];
    } else if (provisioned < currentProvisioned) {
      let toRemove = currentProvisioned - provisioned;
      environments = environments.filter((env) => {
        if (env.provisioned && toRemove > 0 && env.state === 'idle') {
          toRemove--;
          return false;
        }
        return true;
      });
    }
  });

  function stepSimulation() {
    if (!running) return;
    if (tick >= MAX_TICKS) {
      stop();
      return;
    }

    burstBudget = Math.min(
      DEFAULT_INITIAL_BURST,
      burstBudget + SCALING_RATE_PER_TICK,
    );

    for (const env of environments) {
      if (env.state === 'init') {
        const initTicks = Math.max(1, Math.round(600 / TICK_MS));
        if (tick - env.bornAtTick >= initTicks) {
          env.state = 'idle';
        }
      } else if (env.state === 'busy') {
        const execEnd = (env as ScalingEnvironment & { execEnd?: number }).execEnd;
        if (execEnd !== undefined && tick >= execEnd) {
          env.state = 'idle';
          (env as ScalingEnvironment & { execEnd?: number }).execEnd = undefined;
        }
      }
    }

    const arrivals = arrivalsAtTick(config, tick);
    let throttled = 0;

    for (let i = 0; i < arrivals; i++) {
      totals.totalRequests++;
      const ceiling = functionTotalCeiling(config);
      const liveCount = environments.filter((e) => e.state !== 'shutdown').length;

      let target = environments.find((e) => e.state === 'idle');

      if (!target) {
        if (liveCount >= ceiling) {
          totals.throttledAccount++;
          throttled++;
          continue;
        }
        if (burstBudget < 1) {
          totals.throttledBurst++;
          throttled++;
          continue;
        }
        burstBudget -= 1;
        const newEnv: ScalingEnvironment = {
          id: nextEnvId++,
          state: 'init',
          provisioned: false,
          bornAtTick: tick,
          invocationsServed: 0,
        };
        environments.push(newEnv);
        totals.coldStarts++;
        totals.successful++;
        const initTicks = Math.max(1, Math.round(600 / TICK_MS));
        const execTicks = executionTicks(config);
        (newEnv as ScalingEnvironment & { execEnd?: number }).execEnd =
          tick + initTicks + execTicks;
        newEnv.invocationsServed = 1;
        continue;
      }

      target.state = 'busy';
      target.invocationsServed++;
      totals.warmStarts++;
      totals.successful++;
      const execTicks = executionTicks(config);
      (target as ScalingEnvironment & { execEnd?: number }).execEnd =
        tick + execTicks;
    }

    const active = environments.filter(
      (e) => e.state === 'busy' || e.state === 'init',
    ).length;

    samples.push({
      tick,
      active,
      burstBudget: Math.floor(burstBudget),
      arrivals,
      throttled,
    });
    if (samples.length > MAX_TICKS) samples.shift();
    samples = [...samples];
    environments = [...environments];
    tick++;
  }

  function start() {
    if (running) return;
    running = true;
    intervalId = setInterval(stepSimulation, TICK_MS);
  }

  function stop() {
    running = false;
    if (intervalId) clearInterval(intervalId);
    intervalId = undefined;
  }

  function reset() {
    stop();
    tick = 0;
    nextEnvId = 1;
    nextInvocationId = 1;
    samples = [];
    burstBudget = DEFAULT_INITIAL_BURST;
    totals = {
      totalRequests: 0,
      successful: 0,
      throttledBurst: 0,
      throttledAccount: 0,
      coldStarts: 0,
      warmStarts: 0,
    };
    environments = config.provisionedConcurrency > 0
      ? Array.from({ length: config.provisionedConcurrency }, () => ({
          id: nextEnvId++,
          state: 'idle' as const,
          provisioned: true,
          bornAtTick: 0,
          invocationsServed: 0,
        }))
      : [];
  }

  function handleConfigChange(next: ScalingConfig) {
    config = next;
  }

  let computeCostUsd = $derived(
    computeCost(totals.successful, config.executionDurationMs, config.memoryMb),
  );

  let provisionedMonthly = $derived(
    provisionedMonthlyCost(config.provisionedConcurrency, config.memoryMb),
  );

  let elapsedSeconds = $derived(tick / TICKS_PER_SECOND);

  onDestroy(() => {
    if (browser) stop();
  });
</script>

<svelte:head>
  <title>{t('lambdaScaling.title')} — Raphael Sasso</title>
</svelte:head>

<div class="page container">
  <header class="page-header">
    <div class="series-badge">
      <span class="series-dot">●</span>
      <span class="series-text">{t('lambdaScaling.seriesBadge')}</span>
    </div>
    <h1 class="page-title">
      <span class="title-accent">&gt;</span> {t('lambdaScaling.title')}
    </h1>
    <p class="page-subtitle">{t('lambdaScaling.subtitle')}</p>
  </header>

  <ExplanationBlock
    title={t('explanations.scalingConcurrencyBasics.title')}
    content={t('explanations.scalingConcurrencyBasics.content')}
    defaultOpen={true}
  />

  <ScalingConfigurator {config} onchange={handleConfigChange} />

  <TrafficGenerator
    {config}
    {running}
    elapsedSeconds={elapsedSeconds}
    onstart={start}
    onstop={stop}
    onreset={reset}
    onchange={handleConfigChange}
  />

  <ExplanationBlock
    title={t('explanations.scalingBurstQuota.title')}
    content={t('explanations.scalingBurstQuota.content')}
  />

  <BurstBudgetMeter
    {burstBudget}
    maxBudget={DEFAULT_INITIAL_BURST}
    rechargeRatePerMin={500}
  />

  <ConcurrencyTimeline
    {samples}
    accountLimit={config.accountLimit}
    reservedCeiling={config.reservedConcurrency}
    provisioned={config.provisionedConcurrency}
  />

  <ExplanationBlock
    title={t('explanations.scalingReservedVsProvisioned.title')}
    content={t('explanations.scalingReservedVsProvisioned.content')}
  />

  <ScalingMetricsPanel
    {totals}
    computeCostUsd={computeCostUsd}
    provisionedMonthly={provisionedMonthly}
    elapsedSeconds={elapsedSeconds}
  />

  <ExplanationBlock
    title={t('explanations.scalingThrottling.title')}
    content={t('explanations.scalingThrottling.content')}
  />

  <ExplanationBlock
    title={t('explanations.scalingNoisyNeighbor.title')}
    content={t('explanations.scalingNoisyNeighbor.content')}
  />

  <ExplanationBlock
    title={t('explanations.scalingCost.title')}
    content={t('explanations.scalingCost.content')}
  />

  <ExplanationBlock
    title={t('explanations.scalingSystemDesign.title')}
    content={t('explanations.scalingSystemDesign.content')}
  />

  <ExplanationBlock
    title={t('explanations.scalingReferences.title')}
    content={t('explanations.scalingReferences.content')}
  />
</div>

<style>
  .page {
    padding: 3rem 1.5rem 6rem;
    max-width: 800px;
  }

  .page-header {
    margin-bottom: 2.5rem;
  }

  .series-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3125rem 0.75rem;
    background: rgba(188, 140, 255, 0.08);
    border: 1px solid rgba(188, 140, 255, 0.35);
    border-radius: var(--radius);
    margin-bottom: 1rem;
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--purple);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .series-dot {
    font-size: 0.5rem;
    animation: pulse-dot 1.6s ease-in-out infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .page-title {
    font-family: var(--font-mono);
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  .title-accent {
    color: var(--green);
  }

  .page-subtitle {
    font-size: 0.9375rem;
    color: var(--text-secondary);
  }
</style>
