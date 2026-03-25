<script lang="ts">
  import { t } from '$lib/i18n';
  import type { CacheStats } from '$lib/services/cache';

  interface Props {
    stats: CacheStats;
  }

  let { stats }: Props = $props();

  let hitRatio = $derived(
    stats.hits + stats.misses > 0
      ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1)
      : '0.0'
  );
</script>

<section class="cache-viz">
  <h3 class="cache-title">
    <span class="cache-icon">⚡</span>
    {t('cache.title')}
  </h3>

  <div class="stats-grid">
    <div class="stat-card hit">
      <span class="stat-value">{stats.hits}</span>
      <span class="stat-label">{t('cache.hits')}</span>
    </div>
    <div class="stat-card miss">
      <span class="stat-value">{stats.misses}</span>
      <span class="stat-label">{t('cache.misses')}</span>
    </div>
    <div class="stat-card ratio">
      <span class="stat-value">{hitRatio}%</span>
      <span class="stat-label">{t('cache.hitRatio')}</span>
    </div>
  </div>

  <div class="cache-entries">
    <div class="entries-header">
      <span>{t('cache.entries')}</span>
      <span class="entries-count">{stats.entries.length}/{stats.maxSize} {t('cache.maxSize')}</span>
    </div>
    {#if stats.entries.length === 0}
      <p class="entries-empty">{t('cache.empty')}</p>
    {:else}
      <div class="entries-list">
        {#each stats.entries as entry, i (entry.shortCode)}
          <div class="entry-item">
            <span class="entry-index">{i}</span>
            <span class="entry-code">{entry.shortCode}</span>
            <span class="entry-url">{entry.originalUrl}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>

<style>
  .cache-viz {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    margin: 1.5rem 0;
  }

  .cache-title {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .cache-icon {
    font-size: 1rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .stat-card {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.75rem;
    text-align: center;
  }

  .stat-value {
    display: block;
    font-family: var(--font-mono);
    font-size: 1.25rem;
    font-weight: 700;
  }

  .stat-label {
    display: block;
    font-size: 0.6875rem;
    color: var(--text-muted);
    margin-top: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat-card.hit .stat-value {
    color: var(--green);
  }

  .stat-card.miss .stat-value {
    color: var(--red);
  }

  .stat-card.ratio .stat-value {
    color: var(--accent);
  }

  .cache-entries {
    border-top: 1px solid var(--border);
    padding-top: 1rem;
  }

  .entries-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-bottom: 0.75rem;
  }

  .entries-count {
    color: var(--text-muted);
  }

  .entries-empty {
    font-size: 0.8125rem;
    color: var(--text-muted);
    text-align: center;
    padding: 1rem;
    font-family: var(--font-mono);
  }

  .entries-list {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .entry-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    padding: 0.375rem 0.625rem;
    background: var(--bg-primary);
    border-radius: var(--radius);
  }

  .entry-index {
    color: var(--text-muted);
    width: 1rem;
    text-align: right;
  }

  .entry-code {
    color: var(--green);
    font-weight: 600;
    width: 5rem;
  }

  .entry-url {
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
</style>
