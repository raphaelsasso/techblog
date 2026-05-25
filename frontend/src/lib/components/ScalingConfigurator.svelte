<script lang="ts">
  import { t } from '$lib/i18n';
  import {
    MAX_ACCOUNT_LIMIT,
    MAX_PROVISIONED,
    MAX_RESERVED,
    type ScalingConfig,
  } from '$lib/services/lambda-scaling';

  interface Props {
    config: ScalingConfig;
    onchange: (next: ScalingConfig) => void;
  }

  let { config, onchange }: Props = $props();

  function update<K extends keyof ScalingConfig>(key: K, value: ScalingConfig[K]) {
    onchange({ ...config, [key]: value });
  }
</script>

<section class="configurator">
  <header class="configurator-header">
    <span class="config-icon">⚡</span>
    <h3 class="configurator-title">{t('lambdaScaling.functionConfig')}</h3>
  </header>

  <div class="config-grid">
    <div class="config-row">
      <div class="config-label">
        <span class="label-text">{t('lambdaScaling.reserved')}</span>
        <span class="label-value">{config.reservedConcurrency || t('lambdaScaling.unset')}</span>
      </div>
      <input
        type="range"
        min="0"
        max={MAX_RESERVED}
        step="10"
        value={config.reservedConcurrency}
        oninput={(e) => update('reservedConcurrency', +e.currentTarget.value)}
        class="range-input"
      />
      <p class="config-hint">{t('lambdaScaling.reservedHint')}</p>
    </div>

    <div class="config-row">
      <div class="config-label">
        <span class="label-text">{t('lambdaScaling.provisioned')}</span>
        <span class="label-value provisioned-color">{config.provisionedConcurrency}</span>
      </div>
      <input
        type="range"
        min="0"
        max={MAX_PROVISIONED}
        step="5"
        value={config.provisionedConcurrency}
        oninput={(e) => update('provisionedConcurrency', +e.currentTarget.value)}
        class="range-input"
      />
      <p class="config-hint">{t('lambdaScaling.provisionedHint')}</p>
    </div>

    <div class="config-row">
      <div class="config-label">
        <span class="label-text">{t('lambdaScaling.accountLimit')}</span>
        <span class="label-value">{config.accountLimit}</span>
      </div>
      <input
        type="range"
        min="100"
        max={MAX_ACCOUNT_LIMIT}
        step="100"
        value={config.accountLimit}
        oninput={(e) => update('accountLimit', +e.currentTarget.value)}
        class="range-input"
      />
      <p class="config-hint">{t('lambdaScaling.accountLimitHint')}</p>
    </div>

    <div class="config-row">
      <div class="config-label">
        <span class="label-text">{t('lambdaScaling.execDuration')}</span>
        <span class="label-value">{config.executionDurationMs} ms</span>
      </div>
      <input
        type="range"
        min="100"
        max="2000"
        step="50"
        value={config.executionDurationMs}
        oninput={(e) => update('executionDurationMs', +e.currentTarget.value)}
        class="range-input"
      />
      <p class="config-hint">{t('lambdaScaling.execDurationHint')}</p>
    </div>
  </div>
</section>

<style>
  .configurator {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    margin: 1.5rem 0;
  }

  .configurator-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }

  .config-icon {
    font-size: 1rem;
  }

  .configurator-title {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .config-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .config-label {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.625rem;
  }

  .label-text {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .label-value {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--accent);
  }

  .provisioned-color {
    color: var(--purple);
  }

  .range-input {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--bg-tertiary);
    border-radius: 2px;
    outline: none;
  }

  .range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: 2px solid var(--bg-secondary);
  }

  .range-input::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: 2px solid var(--bg-secondary);
  }

  .config-hint {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
    margin-top: 0.5rem;
    line-height: 1.5;
  }

  @media (max-width: 640px) {
    .config-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
