<script lang="ts">
  import { t } from '$lib/i18n';
  import { formatCost, type ScalingTotals } from '$lib/services/lambda-scaling';

  interface Props {
    totals: ScalingTotals;
    computeCostUsd: number;
    provisionedMonthly: number;
    elapsedSeconds: number;
  }

  let { totals, computeCostUsd, provisionedMonthly, elapsedSeconds }: Props = $props();

  let throttleRate = $derived(
    totals.totalRequests > 0
      ? ((totals.throttledBurst + totals.throttledAccount) / totals.totalRequests) * 100
      : 0,
  );

  let coldRate = $derived(
    totals.successful > 0 ? (totals.coldStarts / totals.successful) * 100 : 0,
  );

  let avgRps = $derived(
    elapsedSeconds > 0 ? totals.totalRequests / elapsedSeconds : 0,
  );
</script>

<section class="panel">
  <header class="panel-header">
    <span class="header-icon">📊</span>
    <h3 class="panel-title">{t('lambdaScaling.metricsTitle')}</h3>
  </header>

  <div class="metric-grid">
    <div class="metric">
      <span class="metric-label">{t('lambdaScaling.totalRequests')}</span>
      <span class="metric-value">{totals.totalRequests.toLocaleString()}</span>
      <span class="metric-sub">{avgRps.toFixed(1)} req/s avg</span>
    </div>

    <div class="metric">
      <span class="metric-label">{t('lambdaScaling.successful')}</span>
      <span class="metric-value success">{totals.successful.toLocaleString()}</span>
      <span class="metric-sub">{coldRate.toFixed(1)}% cold</span>
    </div>

    <div class="metric">
      <span class="metric-label">{t('lambdaScaling.throttled')}</span>
      <span class="metric-value danger">{(totals.throttledBurst + totals.throttledAccount).toLocaleString()}</span>
      <span class="metric-sub">{throttleRate.toFixed(1)}% rate</span>
    </div>

    <div class="metric">
      <span class="metric-label">{t('lambdaScaling.cost')}</span>
      <span class="metric-value">{formatCost(computeCostUsd)}</span>
      <span class="metric-sub">{t('lambdaScaling.computeOnly')}</span>
    </div>
  </div>

  <div class="breakdown">
    <h4 class="breakdown-title">{t('lambdaScaling.throttleBreakdown')}</h4>
    <div class="breakdown-rows">
      <div class="breakdown-row">
        <span class="bd-dot burst-dot"></span>
        <span class="bd-label">{t('lambdaScaling.burstThrottled')}</span>
        <span class="bd-value">{totals.throttledBurst}</span>
      </div>
      <div class="breakdown-row">
        <span class="bd-dot account-dot"></span>
        <span class="bd-label">{t('lambdaScaling.accountThrottled')}</span>
        <span class="bd-value">{totals.throttledAccount}</span>
      </div>
    </div>
  </div>

  {#if provisionedMonthly > 0}
    <div class="provisioned-cost">
      <span class="pc-icon">💰</span>
      <div class="pc-text">
        <span class="pc-label">{t('lambdaScaling.provisionedBaseline')}</span>
        <span class="pc-value">{formatCost(provisionedMonthly)}/mo</span>
      </div>
      <span class="pc-hint">{t('lambdaScaling.provisionedBaselineHint')}</span>
    </div>
  {/if}
</section>

<style>
  .panel {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    margin: 1.5rem 0;
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .header-icon {
    font-size: 1rem;
  }

  .panel-title {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .metric {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .metric-label {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .metric-value {
    font-family: var(--font-mono);
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .metric-value.success {
    color: var(--green);
  }

  .metric-value.danger {
    color: var(--red);
  }

  .metric-sub {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
  }

  .breakdown {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.75rem;
  }

  .breakdown-title {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .breakdown-rows {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .breakdown-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
  }

  .bd-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .burst-dot {
    background: var(--yellow);
  }

  .account-dot {
    background: var(--red);
  }

  .bd-label {
    flex: 1;
    color: var(--text-secondary);
  }

  .bd-value {
    color: var(--text-primary);
    font-weight: 600;
  }

  .provisioned-cost {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(188, 140, 255, 0.08);
    border: 1px solid rgba(188, 140, 255, 0.35);
    border-radius: var(--radius);
    padding: 0.75rem;
    margin-top: 1rem;
  }

  .pc-icon {
    font-size: 1rem;
  }

  .pc-text {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .pc-label {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .pc-value {
    font-family: var(--font-mono);
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--purple);
  }

  .pc-hint {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
    line-height: 1.4;
    text-align: right;
  }

  @media (max-width: 640px) {
    .metric-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .provisioned-cost {
      flex-direction: column;
      align-items: flex-start;
    }

    .pc-hint {
      text-align: left;
    }
  }
</style>
