<script lang="ts">
  import { t } from '$lib/i18n';
  import type { ExecutionEnvironment } from '$lib/services/lambda';

  interface Props {
    environments: ExecutionEnvironment[];
    concurrencyLimit: number;
  }

  let { environments, concurrencyLimit }: Props = $props();

  function statusLabel(status: ExecutionEnvironment['status']): string {
    return t(`awsLambda.env.${status}`);
  }

  function statusSymbol(status: ExecutionEnvironment['status']): string {
    switch (status) {
      case 'init': return '◌';
      case 'idle': return '○';
      case 'busy': return '●';
      case 'shutdown': return '✕';
    }
  }

  let visibleEnvs = $derived(environments.filter((e) => e.status !== 'shutdown'));
  let slotPlaceholders = $derived(
    Math.max(0, concurrencyLimit - visibleEnvs.length),
  );
</script>

<section class="env-viz">
  <header class="env-header">
    <h3 class="env-title">
      <span class="env-icon">🔥</span>
      {t('awsLambda.envTitle')}
    </h3>
    <span class="env-sublabel">{t('awsLambda.envSublabel')}</span>
  </header>

  <div class="env-grid">
    {#each visibleEnvs as env (env.id)}
      <div class="env-cell" data-status={env.status}>
        <div class="env-cell-header">
          <span class="env-status-dot">{statusSymbol(env.status)}</span>
          <span class="env-id">μVM-{String(env.id).padStart(3, '0')}</span>
        </div>
        <div class="env-cell-body">
          <span class="env-status-label">{statusLabel(env.status)}</span>
          <span class="env-invokes">{env.invocationCount} {t('awsLambda.invokes')}</span>
        </div>
        {#if env.status === 'busy' || env.status === 'init'}
          <div class="env-progress">
            <div class="env-progress-bar"></div>
          </div>
        {/if}
      </div>
    {/each}

    {#each Array(slotPlaceholders) as _, i}
      <div class="env-cell empty">
        <div class="env-cell-header">
          <span class="env-status-dot empty-dot">◯</span>
          <span class="env-id empty-id">{t('awsLambda.emptySlot')}</span>
        </div>
        <div class="env-cell-body">
          <span class="env-status-label empty-label">{t('awsLambda.available')}</span>
        </div>
      </div>
    {/each}
  </div>

  <div class="env-legend">
    <div class="legend-item">
      <span class="legend-dot init">◌</span>
      <span class="legend-text">{t('awsLambda.env.init')}</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot idle">○</span>
      <span class="legend-text">{t('awsLambda.env.idle')}</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot busy">●</span>
      <span class="legend-text">{t('awsLambda.env.busy')}</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot empty-legend">◯</span>
      <span class="legend-text">{t('awsLambda.available')}</span>
    </div>
  </div>
</section>

<style>
  .env-viz {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    margin: 1.5rem 0;
  }

  .env-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .env-icon {
    font-size: 1rem;
  }

  .env-title {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .env-sublabel {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .env-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.625rem;
    margin-bottom: 1rem;
  }

  .env-cell {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.625rem 0.75rem;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
  }

  .env-cell[data-status='init'] {
    border-color: var(--yellow);
    background: rgba(210, 153, 34, 0.06);
  }

  .env-cell[data-status='idle'] {
    border-color: rgba(63, 185, 80, 0.45);
    background: rgba(63, 185, 80, 0.04);
  }

  .env-cell[data-status='busy'] {
    border-color: var(--green);
    background: rgba(63, 185, 80, 0.1);
    animation: pulse 1.4s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(63, 185, 80, 0); }
    50% { box-shadow: 0 0 0 3px rgba(63, 185, 80, 0.18); }
  }

  .env-cell.empty {
    background: transparent;
    border-style: dashed;
    border-color: rgba(48, 54, 61, 0.5);
    opacity: 0.6;
  }

  .env-cell-header {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-bottom: 0.375rem;
  }

  .env-status-dot {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    line-height: 1;
  }

  .env-cell[data-status='init'] .env-status-dot { color: var(--yellow); }
  .env-cell[data-status='idle'] .env-status-dot { color: var(--green); }
  .env-cell[data-status='busy'] .env-status-dot { color: var(--green); }

  .empty-dot {
    color: var(--text-muted);
  }

  .env-id {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: 0.03em;
  }

  .empty-id {
    color: var(--text-muted);
    font-weight: 400;
  }

  .env-cell-body {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .env-status-label {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .env-cell[data-status='init'] .env-status-label { color: var(--yellow); }
  .env-cell[data-status='busy'] .env-status-label { color: var(--green); }

  .empty-label {
    color: var(--text-muted);
  }

  .env-invokes {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    color: var(--text-muted);
  }

  .env-progress {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background: var(--bg-tertiary);
    overflow: hidden;
  }

  .env-progress-bar {
    height: 100%;
    background: var(--green);
    animation: slide 1s linear infinite;
    width: 40%;
  }

  .env-cell[data-status='init'] .env-progress-bar {
    background: var(--yellow);
  }

  @keyframes slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(350%); }
  }

  .env-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .legend-dot {
    font-family: var(--font-mono);
    font-size: 0.875rem;
  }

  .legend-dot.init { color: var(--yellow); }
  .legend-dot.idle { color: var(--green); }
  .legend-dot.busy { color: var(--green); }
  .legend-dot.empty-legend { color: var(--text-muted); }

  .legend-text {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
