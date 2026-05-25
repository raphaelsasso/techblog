<script lang="ts">
  import { t } from '$lib/i18n';
  import {
    SIM_WINDOW_SECONDS,
    type ScalingConfig,
    type TrafficPattern,
  } from '$lib/services/lambda-scaling';

  interface Props {
    config: ScalingConfig;
    running: boolean;
    elapsedSeconds: number;
    onstart: () => void;
    onstop: () => void;
    onreset: () => void;
    onchange: (next: ScalingConfig) => void;
  }

  let { config, running, elapsedSeconds, onstart, onstop, onreset, onchange }: Props = $props();

  const PATTERNS: { id: TrafficPattern; emoji: string; key: string }[] = [
    { id: 'steady', emoji: '▬', key: 'patternSteady' },
    { id: 'spike', emoji: '▲', key: 'patternSpike' },
    { id: 'ramp', emoji: '◢', key: 'patternRamp' },
  ];

  function setPattern(pattern: TrafficPattern) {
    onchange({ ...config, pattern });
  }

  function setRps(targetRps: number) {
    onchange({ ...config, targetRps });
  }

  let progress = $derived(Math.min(100, (elapsedSeconds / SIM_WINDOW_SECONDS) * 100));
</script>

<section class="generator">
  <header class="generator-header">
    <span class="header-icon">🚀</span>
    <h3 class="generator-title">{t('lambdaScaling.trafficGenerator')}</h3>
    <span class="elapsed">
      {elapsedSeconds.toFixed(1)}s / {SIM_WINDOW_SECONDS}s
    </span>
  </header>

  <div class="rows">
    <div class="row">
      <span class="row-label">{t('lambdaScaling.pattern')}</span>
      <div class="pattern-group">
        {#each PATTERNS as p}
          <button
            class="pattern-btn"
            class:active={config.pattern === p.id}
            onclick={() => setPattern(p.id)}
            disabled={running}
          >
            <span class="pattern-glyph">{p.emoji}</span>
            <span>{t(`lambdaScaling.${p.key}`)}</span>
          </button>
        {/each}
      </div>
    </div>

    <div class="row">
      <div class="rps-label">
        <span class="row-label">{t('lambdaScaling.targetRps')}</span>
        <span class="rps-value">{config.targetRps} req/s</span>
      </div>
      <input
        type="range"
        min="10"
        max="2000"
        step="10"
        value={config.targetRps}
        oninput={(e) => setRps(+e.currentTarget.value)}
        class="range-input"
      />
    </div>

    <div class="progress-bar">
      <div class="progress-fill" style:width="{progress}%"></div>
    </div>

    <div class="controls">
      {#if !running}
        <button class="btn btn-primary" onclick={onstart}>
          ▶ {t('lambdaScaling.start')}
        </button>
      {:else}
        <button class="btn btn-warning" onclick={onstop}>
          ⏸ {t('lambdaScaling.pause')}
        </button>
      {/if}
      <button class="btn btn-secondary" onclick={onreset}>
        ↻ {t('lambdaScaling.reset')}
      </button>
    </div>

    <p class="hint">{t('lambdaScaling.generatorHint')}</p>
  </div>
</section>

<style>
  .generator {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    margin: 1.5rem 0;
  }

  .generator-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }

  .header-icon {
    font-size: 1rem;
  }

  .generator-title {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    flex: 1;
  }

  .elapsed {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .rows {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .row-label {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: block;
    margin-bottom: 0.5rem;
  }

  .pattern-group {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .pattern-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    padding: 0.625rem 0.5rem;
    border-radius: var(--radius);
    transition: all var(--transition);
  }

  .pattern-btn:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--text-primary);
  }

  .pattern-btn.active {
    background: rgba(88, 166, 255, 0.12);
    border-color: var(--accent);
    color: var(--accent);
  }

  .pattern-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pattern-glyph {
    font-size: 1rem;
    color: var(--green);
  }

  .pattern-btn.active .pattern-glyph {
    color: var(--accent);
  }

  .rps-label {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .rps-value {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
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

  .progress-bar {
    width: 100%;
    height: 4px;
    background: var(--bg-tertiary);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--green), var(--accent));
    transition: width 0.2s linear;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
  }

  .btn {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: var(--radius);
    border: 1px solid transparent;
    cursor: pointer;
    transition: all var(--transition);
  }

  .btn-primary {
    background: rgba(63, 185, 80, 0.12);
    border-color: var(--green);
    color: var(--green);
  }

  .btn-primary:hover {
    background: rgba(63, 185, 80, 0.2);
  }

  .btn-warning {
    background: rgba(210, 153, 34, 0.12);
    border-color: var(--yellow);
    color: var(--yellow);
  }

  .btn-warning:hover {
    background: rgba(210, 153, 34, 0.2);
  }

  .btn-secondary {
    background: var(--bg-primary);
    border-color: var(--border);
    color: var(--text-secondary);
  }

  .btn-secondary:hover {
    border-color: var(--text-muted);
    color: var(--text-primary);
  }

  .hint {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
    line-height: 1.5;
  }
</style>
