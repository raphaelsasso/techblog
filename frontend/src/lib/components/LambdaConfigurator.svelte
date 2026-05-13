<script lang="ts">
  import { t } from '$lib/i18n';
  import { MEMORY_OPTIONS, type LambdaConfig } from '$lib/services/lambda';

  interface Props {
    config: LambdaConfig;
    onchange: (next: LambdaConfig) => void;
  }

  let { config, onchange }: Props = $props();

  function updateMemory(memoryMb: number) {
    onchange({ ...config, memoryMb });
  }

  function updateExec(value: number) {
    onchange({ ...config, executionDurationMs: value });
  }
</script>

<section class="configurator">
  <header class="configurator-header">
    <span class="config-icon">⚙️</span>
    <h3 class="configurator-title">{t('awsLambda.configurator')}</h3>
  </header>

  <div class="config-rows">
    <div class="config-row">
      <div class="config-label">
        <span class="label-text">{t('awsLambda.memory')}</span>
        <span class="label-value">{config.memoryMb} MB</span>
      </div>
      <div class="memory-options">
        {#each MEMORY_OPTIONS as opt}
          <button
            class="memory-btn"
            class:active={config.memoryMb === opt}
            onclick={() => updateMemory(opt)}
          >
            {opt < 1024 ? `${opt}` : `${opt / 1024}GB`}
          </button>
        {/each}
      </div>
      <p class="config-hint">{t('awsLambda.memoryHint')}</p>
    </div>

    <div class="config-row">
      <div class="config-label">
        <span class="label-text">{t('awsLambda.execTime')}</span>
        <span class="label-value">{config.executionDurationMs} ms</span>
      </div>
      <input
        type="range"
        min="100"
        max="2000"
        step="100"
        value={config.executionDurationMs}
        oninput={(e) => updateExec(+e.currentTarget.value)}
        class="range-input"
      />
      <p class="config-hint">{t('awsLambda.execTimeHint')}</p>
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

  .config-rows {
    display: flex;
    flex-direction: column;
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

  .memory-options {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.375rem;
  }

  .memory-btn {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    padding: 0.5rem 0.25rem;
    border-radius: var(--radius);
    transition: all var(--transition);
  }

  .memory-btn:hover {
    border-color: var(--accent);
    color: var(--text-primary);
  }

  .memory-btn.active {
    background: rgba(88, 166, 255, 0.12);
    border-color: var(--accent);
    color: var(--accent);
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
    .memory-options {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
