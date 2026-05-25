<script lang="ts">
  import { t } from '$lib/i18n';

  interface Props {
    burstBudget: number;
    maxBudget: number;
    rechargeRatePerMin: number;
  }

  let { burstBudget, maxBudget, rechargeRatePerMin }: Props = $props();

  let pct = $derived(Math.max(0, Math.min(100, (burstBudget / maxBudget) * 100)));
  let isLow = $derived(burstBudget < maxBudget * 0.2);
</script>

<section class="meter">
  <header class="meter-header">
    <span class="header-icon">🔋</span>
    <h3 class="meter-title">{t('lambdaScaling.burstBudget')}</h3>
    <span class="recharge">+{rechargeRatePerMin}/min</span>
  </header>

  <div class="meter-body">
    <div class="bar-track">
      <div
        class="bar-fill"
        class:low={isLow}
        style:width="{pct}%"
      ></div>
      <div class="bar-label">
        <span class="current">{Math.floor(burstBudget)}</span>
        <span class="sep">/</span>
        <span class="max">{maxBudget}</span>
      </div>
    </div>
    <p class="meter-hint">{t('lambdaScaling.burstBudgetHint')}</p>
  </div>
</section>

<style>
  .meter {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    margin: 1.5rem 0;
  }

  .meter-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .header-icon {
    font-size: 1rem;
  }

  .meter-title {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    flex: 1;
  }

  .recharge {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--green);
  }

  .meter-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .bar-track {
    position: relative;
    width: 100%;
    height: 28px;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--green), var(--accent));
    transition: width 0.2s linear;
  }

  .bar-fill.low {
    background: linear-gradient(90deg, var(--yellow), var(--red));
  }

  .bar-label {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--text-primary);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
    gap: 0.25rem;
  }

  .sep {
    color: var(--text-muted);
  }

  .max {
    color: var(--text-secondary);
    font-weight: 400;
  }

  .meter-hint {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
    line-height: 1.5;
  }
</style>
