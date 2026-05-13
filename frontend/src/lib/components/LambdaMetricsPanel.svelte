<script lang="ts">
  import { t } from '$lib/i18n';
  import {
    formatCost,
    calculateCost,
    type InvocationRecord,
  } from '$lib/services/lambda';

  interface Props {
    invocations: InvocationRecord[];
  }

  let { invocations }: Props = $props();

  let total = $derived(invocations.length);
  let successful = $derived(invocations.filter((i) => i.status === 'success'));
  let throttled = $derived(invocations.filter((i) => i.status === 'throttled').length);
  let coldStarts = $derived(successful.filter((i) => i.coldStart).length);
  let warmStarts = $derived(successful.length - coldStarts);
  let coldRatio = $derived(
    successful.length > 0
      ? ((coldStarts / successful.length) * 100).toFixed(1)
      : '0.0',
  );

  let totalBilledMs = $derived(
    successful.reduce((sum, i) => sum + i.billedDurationMs, 0),
  );
  let totalGbSec = $derived(
    successful.reduce((sum, i) => sum + i.gbSeconds, 0),
  );
  let totalCost = $derived(calculateCost(totalGbSec));

  let recent = $derived([...invocations].slice(-10).reverse());

  function fmtMs(ms: number): string {
    if (ms < 1000) return `${ms.toFixed(0)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  }
</script>

<section class="metrics">
  <header class="metrics-header">
    <span class="metrics-icon">📊</span>
    <h3 class="metrics-title">{t('awsLambda.metricsTitle')}</h3>
  </header>

  <div class="metrics-grid">
    <div class="metric-card">
      <span class="metric-value">{successful.length}</span>
      <span class="metric-label">{t('awsLambda.totalInvokes')}</span>
    </div>
    <div class="metric-card">
      <span class="metric-value cold">{coldStarts}</span>
      <span class="metric-label">{t('awsLambda.coldStarts')}</span>
    </div>
    <div class="metric-card">
      <span class="metric-value warm">{warmStarts}</span>
      <span class="metric-label">{t('awsLambda.warmStarts')}</span>
    </div>
    <div class="metric-card">
      <span class="metric-value ratio">{coldRatio}%</span>
      <span class="metric-label">{t('awsLambda.coldRatio')}</span>
    </div>
    <div class="metric-card">
      <span class="metric-value">{fmtMs(totalBilledMs)}</span>
      <span class="metric-label">{t('awsLambda.billedDuration')}</span>
    </div>
    <div class="metric-card">
      <span class="metric-value">{totalGbSec.toFixed(4)}</span>
      <span class="metric-label">{t('awsLambda.gbSeconds')}</span>
    </div>
    <div class="metric-card">
      <span class="metric-value cost">{formatCost(totalCost)}</span>
      <span class="metric-label">{t('awsLambda.estCost')}</span>
    </div>
    <div class="metric-card">
      <span class="metric-value throttle">{throttled}</span>
      <span class="metric-label">{t('awsLambda.throttled')}</span>
    </div>
  </div>

  {#if total > 0}
    <div class="log">
      <div class="log-header">
        <span class="log-title">{t('awsLambda.recentInvocations')}</span>
        <span class="log-meta">{t('awsLambda.lastTen')}</span>
      </div>
      <div class="log-list">
        {#each recent as inv (inv.requestId)}
          <div class="log-row" data-cold={inv.coldStart} data-status={inv.status}>
            <span class="log-id">{inv.requestId.slice(0, 8)}</span>
            {#if inv.status === 'throttled'}
              <span class="log-badge throttled">{t('awsLambda.throttledBadge')}</span>
            {:else if inv.coldStart}
              <span class="log-badge cold">{t('awsLambda.coldBadge')}</span>
            {:else}
              <span class="log-badge warm">{t('awsLambda.warmBadge')}</span>
            {/if}
            {#if inv.status === 'success'}
              <span class="log-detail">
                {#if inv.coldStart}
                  <span class="log-init">init {fmtMs(inv.initDurationMs)}</span>
                  <span class="log-sep">+</span>
                {/if}
                <span class="log-duration">exec {fmtMs(inv.durationMs)}</span>
                <span class="log-sep">·</span>
                <span class="log-billed">billed {fmtMs(inv.billedDurationMs)}</span>
                <span class="log-sep">·</span>
                <span class="log-mem">{inv.memoryMb} MB</span>
              </span>
            {:else}
              <span class="log-detail throttled-msg">
                {t('awsLambda.throttledReason')}
              </span>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</section>

<style>
  .metrics {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    margin: 1.5rem 0;
  }

  .metrics-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .metrics-icon {
    font-size: 1rem;
  }

  .metrics-title {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
    gap: 0.625rem;
    margin-bottom: 1.25rem;
  }

  .metric-card {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.75rem 0.875rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .metric-value {
    font-family: var(--font-mono);
    font-size: 1.0625rem;
    font-weight: 700;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-variant-numeric: tabular-nums;
  }

  .metric-value.cold { color: var(--accent); }
  .metric-value.warm { color: var(--green); }
  .metric-value.ratio { color: var(--purple); }
  .metric-value.cost { color: var(--yellow); }
  .metric-value.throttle { color: var(--red); }

  .metric-label {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .log {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.875rem;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border);
  }

  .log-title {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .log-meta {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    color: var(--text-muted);
  }

  .log-list {
    max-height: 260px;
    overflow-y: auto;
  }

  .log-row {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem 0.875rem;
    border-bottom: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }

  .log-row:last-child {
    border-bottom: none;
  }

  .log-id {
    color: var(--text-muted);
    font-weight: 500;
    min-width: 70px;
  }

  .log-badge {
    font-size: 0.625rem;
    font-weight: 700;
    padding: 0.125rem 0.5rem;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    flex-shrink: 0;
  }

  .log-badge.cold {
    color: var(--accent);
    background: rgba(88, 166, 255, 0.12);
    border: 1px solid rgba(88, 166, 255, 0.3);
  }

  .log-badge.warm {
    color: var(--green);
    background: rgba(63, 185, 80, 0.12);
    border: 1px solid rgba(63, 185, 80, 0.3);
  }

  .log-badge.throttled {
    color: var(--red);
    background: rgba(248, 81, 73, 0.12);
    border: 1px solid rgba(248, 81, 73, 0.3);
  }

  .log-detail {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-wrap: wrap;
    color: var(--text-secondary);
    font-size: 0.6875rem;
  }

  .log-init { color: var(--yellow); }
  .log-duration { color: var(--text-primary); }
  .log-billed { color: var(--accent); }
  .log-mem { color: var(--text-muted); }
  .log-sep { color: var(--text-muted); }

  .throttled-msg {
    color: var(--red);
  }

  @media (max-width: 640px) {
    .metrics-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .log-row {
      flex-wrap: wrap;
    }
  }
</style>
