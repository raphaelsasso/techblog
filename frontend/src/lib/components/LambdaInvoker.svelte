<script lang="ts">
  import { t } from '$lib/i18n';

  interface Props {
    onInvoke: (count: number) => void;
    onReset: () => void;
    activeCount: number;
    concurrencyLimit: number;
  }

  let { onInvoke, onReset, activeCount, concurrencyLimit }: Props = $props();
</script>

<section class="invoker">
  <header class="invoker-header">
    <span class="invoker-icon">⚡</span>
    <h3 class="invoker-title">{t('awsLambda.invoker')}</h3>
    <span class="concurrency">
      <span class="concurrency-active">{activeCount}</span>
      <span class="concurrency-sep">/</span>
      <span class="concurrency-limit">{concurrencyLimit}</span>
      <span class="concurrency-label">{t('awsLambda.concurrent')}</span>
    </span>
  </header>

  <div class="actions">
    <button class="invoke-btn primary" onclick={() => onInvoke(1)}>
      <span class="btn-icon">▶</span>
      <span class="btn-label">{t('awsLambda.invokeOnce')}</span>
    </button>
    <button class="invoke-btn" onclick={() => onInvoke(5)}>
      <span class="btn-icon">⚡</span>
      <span class="btn-label">{t('awsLambda.invokeBurst')}</span>
    </button>
    <button class="invoke-btn reset" onclick={onReset}>
      <span class="btn-icon">↺</span>
      <span class="btn-label">{t('awsLambda.reset')}</span>
    </button>
  </div>

  <p class="invoker-hint">{t('awsLambda.invokerHint')}</p>
</section>

<style>
  .invoker {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    margin: 1.5rem 0;
  }

  .invoker-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .invoker-icon {
    font-size: 1rem;
  }

  .invoker-title {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .concurrency {
    margin-left: auto;
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }

  .concurrency-active {
    color: var(--green);
    font-weight: 700;
  }

  .concurrency-sep {
    color: var(--text-muted);
  }

  .concurrency-limit {
    color: var(--text-secondary);
  }

  .concurrency-label {
    color: var(--text-muted);
    margin-left: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.6875rem;
  }

  .actions {
    display: flex;
    gap: 0.625rem;
    flex-wrap: wrap;
  }

  .invoke-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-primary);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    padding: 0.625rem 1rem;
    border-radius: var(--radius);
    transition: all var(--transition);
    flex: 1;
    justify-content: center;
    min-width: 130px;
  }

  .invoke-btn:hover {
    border-color: var(--accent);
    background: var(--bg-tertiary);
    transform: translateY(-1px);
  }

  .invoke-btn.primary {
    color: var(--green);
    border-color: rgba(63, 185, 80, 0.4);
    background: rgba(63, 185, 80, 0.08);
  }

  .invoke-btn.primary:hover {
    border-color: var(--green);
    background: rgba(63, 185, 80, 0.15);
  }

  .invoke-btn.reset {
    color: var(--text-muted);
    flex: 0 0 auto;
    min-width: auto;
  }

  .invoke-btn.reset:hover {
    color: var(--red);
    border-color: var(--red);
  }

  .btn-icon {
    font-size: 0.75rem;
  }

  .invoker-hint {
    margin-top: 0.875rem;
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
    line-height: 1.5;
  }

  @media (max-width: 640px) {
    .invoke-btn {
      min-width: auto;
      flex: 1 1 calc(50% - 0.5rem);
    }
  }
</style>
