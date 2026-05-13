<script lang="ts">
  import { onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { t } from '$lib/i18n';
  import {
    DEFAULT_CONFIG,
    CONCURRENCY_LIMIT,
    IDLE_TIMEOUT_MS,
    calculateBilledDuration,
    calculateGbSeconds,
    generateRequestId,
    type ExecutionEnvironment,
    type InvocationRecord,
    type LambdaConfig,
  } from '$lib/services/lambda';
  import LambdaConfigurator from '$lib/components/LambdaConfigurator.svelte';
  import LambdaInvoker from '$lib/components/LambdaInvoker.svelte';
  import LambdaEnvironmentVisualizer from '$lib/components/LambdaEnvironmentVisualizer.svelte';
  import LambdaMetricsPanel from '$lib/components/LambdaMetricsPanel.svelte';
  import ExplanationBlock from '$lib/components/ExplanationBlock.svelte';

  let config: LambdaConfig = $state({ ...DEFAULT_CONFIG });
  let environments: ExecutionEnvironment[] = $state([]);
  let invocations: InvocationRecord[] = $state([]);
  let nextEnvId = 1;
  let timers = new Set<ReturnType<typeof setTimeout>>();

  let activeCount = $derived(
    environments.filter((e) => e.status === 'busy' || e.status === 'init').length,
  );

  function schedule(fn: () => void, delay: number) {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, delay);
    timers.add(id);
  }

  function clearAllTimers() {
    for (const id of timers) clearTimeout(id);
    timers.clear();
  }

  function findIdleEnv(): ExecutionEnvironment | undefined {
    return environments.find((e) => e.status === 'idle');
  }

  function totalLiveEnvs(): number {
    return environments.filter((e) => e.status !== 'shutdown').length;
  }

  function invokeOnce() {
    const requestId = generateRequestId();
    const idle = findIdleEnv();

    if (idle) {
      runOnEnv(idle, requestId, false);
      return;
    }

    if (totalLiveEnvs() >= CONCURRENCY_LIMIT) {
      invocations = [
        ...invocations,
        {
          requestId,
          envId: -1,
          coldStart: false,
          startedAt: Date.now(),
          durationMs: 0,
          billedDurationMs: 0,
          initDurationMs: 0,
          memoryMb: config.memoryMb,
          gbSeconds: 0,
          status: 'throttled',
        },
      ];
      return;
    }

    const env: ExecutionEnvironment = {
      id: nextEnvId++,
      status: 'init',
      createdAt: Date.now(),
      invocationCount: 0,
      currentRequestId: requestId,
    };
    environments = [...environments, env];

    schedule(() => {
      const target = environments.find((e) => e.id === env.id);
      if (!target) return;
      target.status = 'idle';
      environments = [...environments];
      runOnEnv(target, requestId, true);
    }, config.initDurationMs);
  }

  function runOnEnv(env: ExecutionEnvironment, requestId: string, coldStart: boolean) {
    env.status = 'busy';
    env.currentRequestId = requestId;
    env.invocationCount += 1;
    environments = [...environments];

    const startedAt = Date.now();
    const execMs = config.executionDurationMs;
    const initMs = coldStart ? config.initDurationMs : 0;

    schedule(() => {
      const target = environments.find((e) => e.id === env.id);
      if (!target) return;
      target.status = 'idle';
      target.currentRequestId = undefined;
      environments = [...environments];

      const billed = calculateBilledDuration(execMs);
      const gbSec = calculateGbSeconds(billed, config.memoryMb);

      invocations = [
        ...invocations,
        {
          requestId,
          envId: env.id,
          coldStart,
          startedAt,
          durationMs: execMs,
          billedDurationMs: billed,
          initDurationMs: initMs,
          memoryMb: config.memoryMb,
          gbSeconds: gbSec,
          status: 'success',
        },
      ];

      scheduleShutdown(env.id);
    }, execMs);
  }

  function scheduleShutdown(envId: number) {
    schedule(() => {
      const target = environments.find((e) => e.id === envId);
      if (!target || target.status !== 'idle') return;
      target.status = 'shutdown';
      environments = [...environments];

      schedule(() => {
        environments = environments.filter((e) => e.id !== envId);
      }, 600);
    }, IDLE_TIMEOUT_MS);
  }

  function invokeMany(count: number) {
    for (let i = 0; i < count; i++) {
      schedule(invokeOnce, i * 50);
    }
  }

  function reset() {
    clearAllTimers();
    environments = [];
    invocations = [];
    nextEnvId = 1;
  }

  function handleConfigChange(next: LambdaConfig) {
    config = next;
  }

  onDestroy(() => {
    if (browser) clearAllTimers();
  });
</script>

<svelte:head>
  <title>{t('awsLambda.title')} — Raphael Sasso</title>
</svelte:head>

<div class="page container">
  <header class="page-header">
    <div class="series-badge">
      <span class="series-dot">●</span>
      <span class="series-text">{t('awsLambda.seriesBadge')}</span>
    </div>
    <h1 class="page-title">
      <span class="title-accent">&gt;</span> {t('awsLambda.title')}
    </h1>
    <p class="page-subtitle">{t('awsLambda.subtitle')}</p>
  </header>

  <LambdaConfigurator {config} onchange={handleConfigChange} />

  <ExplanationBlock
    title={t('explanations.lambdaWhatIs.title')}
    content={t('explanations.lambdaWhatIs.content')}
    defaultOpen={true}
  />

  <LambdaInvoker
    onInvoke={invokeMany}
    onReset={reset}
    {activeCount}
    concurrencyLimit={CONCURRENCY_LIMIT}
  />

  <ExplanationBlock
    title={t('explanations.lambdaHowFaas.title')}
    content={t('explanations.lambdaHowFaas.content')}
  />

  <LambdaEnvironmentVisualizer {environments} concurrencyLimit={CONCURRENCY_LIMIT} />

  <ExplanationBlock
    title={t('explanations.lambdaColdWarm.title')}
    content={t('explanations.lambdaColdWarm.content')}
  />

  <LambdaMetricsPanel {invocations} />

  <ExplanationBlock
    title={t('explanations.lambdaLifecycle.title')}
    content={t('explanations.lambdaLifecycle.content')}
  />

  <ExplanationBlock
    title={t('explanations.lambdaFirecracker.title')}
    content={t('explanations.lambdaFirecracker.content')}
  />

  <ExplanationBlock
    title={t('explanations.lambdaAdvantages.title')}
    content={t('explanations.lambdaAdvantages.content')}
  />

  <ExplanationBlock
    title={t('explanations.lambdaDisadvantages.title')}
    content={t('explanations.lambdaDisadvantages.content')}
  />

  <ExplanationBlock
    title={t('explanations.lambdaSystemDesign.title')}
    content={t('explanations.lambdaSystemDesign.content')}
  />

  <ExplanationBlock
    title={t('explanations.lambdaReferences.title')}
    content={t('explanations.lambdaReferences.content')}
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
