<script lang="ts">
  import { t } from '$lib/i18n';
  import type { CacheTierStats } from '$lib/services/social-graph';

  interface Props {
    stats: CacheTierStats;
    onreset: () => void;
  }

  let { stats, onreset }: Props = $props();

  let followerRatio = $derived(
    stats.follower.hits + stats.follower.misses > 0
      ? ((stats.follower.hits / (stats.follower.hits + stats.follower.misses)) * 100).toFixed(1)
      : '0.0',
  );

  let leaderRatio = $derived(
    stats.leader.hits + stats.leader.misses > 0
      ? ((stats.leader.hits / (stats.leader.hits + stats.leader.misses)) * 100).toFixed(1)
      : '0.0',
  );

  let totalQueries = $derived(
    stats.follower.hits + stats.leader.hits + stats.storageReads,
  );
</script>

<section class="cache-viz">
  <div class="cache-header">
    <h3 class="cache-title">
      <span class="cache-icon">⚡</span>
      {t('socialGraph.cacheTiers')}
    </h3>
    <button class="reset-btn" onclick={onreset}>{t('socialGraph.resetCache')}</button>
  </div>

  <div class="flow-diagram">
    <div class="flow-step">
      <span class="flow-label">{t('socialGraph.client')}</span>
    </div>
    <span class="flow-arrow">→</span>
    <div class="flow-step tier" class:active={stats.follower.hits > 0}>
      <span class="flow-label">{t('socialGraph.follower')}</span>
      <span class="flow-size">{stats.follower.entries}/{stats.follower.maxSize}</span>
    </div>
    <span class="flow-arrow">→</span>
    <div class="flow-step tier" class:active={stats.leader.hits > 0}>
      <span class="flow-label">{t('socialGraph.leader')}</span>
      <span class="flow-size">{stats.leader.entries}/{stats.leader.maxSize}</span>
    </div>
    <span class="flow-arrow">→</span>
    <div class="flow-step storage">
      <span class="flow-label">MySQL</span>
    </div>
  </div>

  <div class="tiers-grid">
    <div class="tier-card">
      <h4 class="tier-name">{t('socialGraph.follower')}</h4>
      <div class="tier-stats">
        <div class="tier-stat">
          <span class="tier-value hit">{stats.follower.hits}</span>
          <span class="tier-label">{t('socialGraph.hits')}</span>
        </div>
        <div class="tier-stat">
          <span class="tier-value miss">{stats.follower.misses}</span>
          <span class="tier-label">{t('socialGraph.misses')}</span>
        </div>
        <div class="tier-stat">
          <span class="tier-value ratio">{followerRatio}%</span>
          <span class="tier-label">{t('socialGraph.hitRatio')}</span>
        </div>
      </div>
    </div>

    <div class="tier-card">
      <h4 class="tier-name">{t('socialGraph.leader')}</h4>
      <div class="tier-stats">
        <div class="tier-stat">
          <span class="tier-value hit">{stats.leader.hits}</span>
          <span class="tier-label">{t('socialGraph.hits')}</span>
        </div>
        <div class="tier-stat">
          <span class="tier-value miss">{stats.leader.misses}</span>
          <span class="tier-label">{t('socialGraph.misses')}</span>
        </div>
        <div class="tier-stat">
          <span class="tier-value ratio">{leaderRatio}%</span>
          <span class="tier-label">{t('socialGraph.hitRatio')}</span>
        </div>
      </div>
    </div>

    <div class="tier-card">
      <h4 class="tier-name">MySQL ({t('socialGraph.storage')})</h4>
      <div class="tier-stats">
        <div class="tier-stat">
          <span class="tier-value storage-val">{stats.storageReads}</span>
          <span class="tier-label">{t('socialGraph.reads')}</span>
        </div>
        <div class="tier-stat">
          <span class="tier-value total-val">{totalQueries}</span>
          <span class="tier-label">{t('socialGraph.totalQueries')}</span>
        </div>
      </div>
    </div>
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

  .cache-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .cache-title {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .cache-icon {
    font-size: 1rem;
  }

  .reset-btn {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
    background: var(--bg-tertiary);
    padding: 0.375rem 0.75rem;
    border-radius: var(--radius);
    transition: all var(--transition);
  }

  .reset-btn:hover {
    color: var(--red);
  }

  .flow-diagram {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
    padding: 1rem;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    flex-wrap: wrap;
  }

  .flow-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.875rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-tertiary);
  }

  .flow-step.tier.active {
    border-color: var(--green);
  }

  .flow-step.storage {
    border-color: var(--yellow);
  }

  .flow-label {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .flow-size {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    color: var(--text-muted);
  }

  .flow-arrow {
    font-family: var(--font-mono);
    font-size: 1rem;
    color: var(--text-muted);
  }

  .tiers-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .tier-card {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.875rem;
  }

  .tier-name {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--accent);
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .tier-stats {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .tier-stat {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tier-value {
    font-family: var(--font-mono);
    font-size: 1rem;
    font-weight: 700;
  }

  .tier-label {
    font-size: 0.6875rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .tier-value.hit { color: var(--green); }
  .tier-value.miss { color: var(--red); }
  .tier-value.ratio { color: var(--accent); }
  .tier-value.storage-val { color: var(--yellow); }
  .tier-value.total-val { color: var(--text-primary); }

  @media (max-width: 640px) {
    .tiers-grid {
      grid-template-columns: 1fr;
    }

    .flow-diagram {
      gap: 0.375rem;
    }
  }
</style>
