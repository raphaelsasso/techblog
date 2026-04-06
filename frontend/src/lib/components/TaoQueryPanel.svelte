<script lang="ts">
  import { t } from '$lib/i18n';
  import type { TaoObject, TaoAssociation, AssocType } from '$lib/services/social-graph';
  import {
    ALL_ASSOC_TYPES,
    getObjectLabel,
    pointQuery,
    rangeQuery,
    countQuery,
    queryWithCache,
  } from '$lib/services/social-graph';

  interface Props {
    objects: TaoObject[];
    oncacheupdate: () => void;
  }

  let { objects, oncacheupdate }: Props = $props();

  type QueryTab = 'point' | 'range' | 'count';
  let activeTab: QueryTab = $state('point');

  let pointId1 = $state<number | null>(null);
  let pointType: AssocType = $state('FRIEND');
  let pointId2 = $state<number | null>(null);

  let rangeId1 = $state<number | null>(null);
  let rangeType: AssocType = $state('FRIEND');
  let rangeLimit = $state(10);

  let countId1 = $state<number | null>(null);
  let countType: AssocType = $state('FRIEND');

  let queryResult: string = $state('');
  let cacheLevel: string = $state('');

  function runPointQuery() {
    if (pointId1 === null || pointId2 === null) return;
    const id1 = pointId1;
    const type = pointType;
    const id2 = pointId2;
    const key = `point:${id1}:${type}:${id2}`;
    const { result, cacheLevel: level } = queryWithCache<TaoAssociation | null>(
      key,
      () => pointQuery(id1, type, id2),
    );
    cacheLevel = level;
    queryResult = result
      ? `✅ Association exists: ${id1} → [${type}] → ${id2}`
      : `❌ No association found`;
    oncacheupdate();
  }

  function runRangeQuery() {
    if (rangeId1 === null) return;
    const id1 = rangeId1;
    const type = rangeType;
    const limit = rangeLimit;
    const key = `range:${id1}:${type}:${limit}`;
    const { result, cacheLevel: level } = queryWithCache<TaoAssociation[]>(
      key,
      () => rangeQuery(id1, type, limit),
    );
    cacheLevel = level;
    if (result.length === 0) {
      queryResult = `No ${type} associations from object #${id1}`;
    } else {
      const lines = result.map(
        (a) => `  #${a.id1} → [${a.type}] → #${a.id2} (${new Date(a.time).toLocaleTimeString()})`,
      );
      queryResult = `Found ${result.length} result(s):\n${lines.join('\n')}`;
    }
    oncacheupdate();
  }

  function runCountQuery() {
    if (countId1 === null) return;
    const id1 = countId1;
    const type = countType;
    const key = `count:${id1}:${type}`;
    const { result, cacheLevel: level } = queryWithCache<number>(
      key,
      () => countQuery(id1, type),
    );
    cacheLevel = level;
    queryResult = `Count: ${result} ${type} association(s) from object #${id1}`;
    oncacheupdate();
  }

  const CACHE_LEVEL_LABELS: Record<string, string> = {
    follower: '⚡ Follower Cache HIT',
    leader: '🔄 Leader Cache HIT',
    storage: '💾 Storage Read (MySQL)',
  };

  const CACHE_LEVEL_CLASSES: Record<string, string> = {
    follower: 'level-follower',
    leader: 'level-leader',
    storage: 'level-storage',
  };
</script>

<section class="query-panel">
  <h3 class="panel-title">
    <span class="panel-icon">🔍</span>
    {t('socialGraph.queryPanel')}
  </h3>

  <div class="tabs">
    <button
      class="tab"
      class:active={activeTab === 'point'}
      onclick={() => { activeTab = 'point'; queryResult = ''; cacheLevel = ''; }}
    >
      {t('socialGraph.pointQuery')}
    </button>
    <button
      class="tab"
      class:active={activeTab === 'range'}
      onclick={() => { activeTab = 'range'; queryResult = ''; cacheLevel = ''; }}
    >
      {t('socialGraph.rangeQuery')}
    </button>
    <button
      class="tab"
      class:active={activeTab === 'count'}
      onclick={() => { activeTab = 'count'; queryResult = ''; cacheLevel = ''; }}
    >
      {t('socialGraph.countQuery')}
    </button>
  </div>

  <div class="tab-content">
    {#if activeTab === 'point'}
      <div class="query-form">
        <div class="query-grid query-grid-3">
          <div class="field">
            <label class="field-label" for="pq-source">id1</label>
            <select id="pq-source" class="field-select" bind:value={pointId1}>
              <option value={null}>—</option>
              {#each objects as obj (obj.id)}
                <option value={obj.id}>#{obj.id} {getObjectLabel(obj)}</option>
              {/each}
            </select>
          </div>
          <div class="field">
            <label class="field-label" for="pq-type">type</label>
            <select id="pq-type" class="field-select" bind:value={pointType}>
              {#each ALL_ASSOC_TYPES as aType}
                <option value={aType}>{aType}</option>
              {/each}
            </select>
          </div>
          <div class="field">
            <label class="field-label" for="pq-target">id2</label>
            <select id="pq-target" class="field-select" bind:value={pointId2}>
              <option value={null}>—</option>
              {#each objects as obj (obj.id)}
                <option value={obj.id}>#{obj.id} {getObjectLabel(obj)}</option>
              {/each}
            </select>
          </div>
        </div>
        <button class="run-btn" onclick={runPointQuery} disabled={pointId1 === null || pointId2 === null}>
          {t('socialGraph.runQuery')}
        </button>
        <p class="query-hint">{t('socialGraph.pointQueryHint')}</p>
      </div>
    {:else if activeTab === 'range'}
      <div class="query-form">
        <div class="query-grid query-grid-3">
          <div class="field">
            <label class="field-label" for="rq-source">id1</label>
            <select id="rq-source" class="field-select" bind:value={rangeId1}>
              <option value={null}>—</option>
              {#each objects as obj (obj.id)}
                <option value={obj.id}>#{obj.id} {getObjectLabel(obj)}</option>
              {/each}
            </select>
          </div>
          <div class="field">
            <label class="field-label" for="rq-type">type</label>
            <select id="rq-type" class="field-select" bind:value={rangeType}>
              {#each ALL_ASSOC_TYPES as aType}
                <option value={aType}>{aType}</option>
              {/each}
            </select>
          </div>
          <div class="field">
            <label class="field-label" for="rq-limit">limit</label>
            <input id="rq-limit" type="number" class="field-input" bind:value={rangeLimit} min="1" max="50" />
          </div>
        </div>
        <button class="run-btn" onclick={runRangeQuery} disabled={rangeId1 === null}>
          {t('socialGraph.runQuery')}
        </button>
        <p class="query-hint">{t('socialGraph.rangeQueryHint')}</p>
      </div>
    {:else}
      <div class="query-form">
        <div class="query-grid query-grid-2">
          <div class="field">
            <label class="field-label" for="cq-source">id1</label>
            <select id="cq-source" class="field-select" bind:value={countId1}>
              <option value={null}>—</option>
              {#each objects as obj (obj.id)}
                <option value={obj.id}>#{obj.id} {getObjectLabel(obj)}</option>
              {/each}
            </select>
          </div>
          <div class="field">
            <label class="field-label" for="cq-type">type</label>
            <select id="cq-type" class="field-select" bind:value={countType}>
              {#each ALL_ASSOC_TYPES as aType}
                <option value={aType}>{aType}</option>
              {/each}
            </select>
          </div>
        </div>
        <button class="run-btn" onclick={runCountQuery} disabled={countId1 === null}>
          {t('socialGraph.runQuery')}
        </button>
        <p class="query-hint">{t('socialGraph.countQueryHint')}</p>
      </div>
    {/if}
  </div>

  {#if queryResult}
    <div class="result-box">
      {#if cacheLevel}
        <div class="cache-badge {CACHE_LEVEL_CLASSES[cacheLevel]}">
          {CACHE_LEVEL_LABELS[cacheLevel]}
        </div>
      {/if}
      <pre class="result-text">{queryResult}</pre>
    </div>
  {/if}
</section>

<style>
  .query-panel {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    margin: 1.5rem 0;
  }

  .panel-title {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .panel-icon {
    font-size: 1rem;
  }

  .tabs {
    display: flex;
    gap: 0.25rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.5rem;
  }

  .tab {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    padding: 0.5rem 1rem;
    border-radius: var(--radius) var(--radius) 0 0;
    background: transparent;
    transition: all var(--transition);
  }

  .tab:hover {
    color: var(--text-primary);
  }

  .tab.active {
    color: var(--accent);
    background: var(--bg-tertiary);
  }

  .query-form {
    margin-bottom: 0.5rem;
  }

  .query-grid {
    display: grid;
    gap: 0.75rem;
    align-items: end;
    margin-bottom: 0.75rem;
  }

  .query-grid-3 {
    grid-template-columns: 1fr auto 1fr;
  }

  .query-grid-2 {
    grid-template-columns: 1fr 1fr;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    min-width: 0;
  }

  .field-label {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .field-select,
  .field-input {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    padding: 0.625rem 0.75rem;
    transition: border-color var(--transition);
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .field-select:focus,
  .field-input:focus {
    border-color: var(--accent);
    outline: none;
  }

  .query-hint {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 0.5rem;
    font-family: var(--font-mono);
  }

  .run-btn {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: 600;
    color: #fff;
    background: var(--purple);
    padding: 0.625rem 1.25rem;
    border-radius: var(--radius);
    white-space: nowrap;
    transition: opacity var(--transition);
    width: 100%;
  }

  .run-btn:hover:not(:disabled) {
    opacity: 0.85;
  }

  .run-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .result-box {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem;
    margin-top: 1rem;
  }

  .cache-badge {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: 600;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .level-follower {
    background: rgba(63, 185, 80, 0.15);
    color: var(--green);
  }

  .level-leader {
    background: rgba(210, 153, 34, 0.15);
    color: var(--yellow);
  }

  .level-storage {
    background: rgba(248, 81, 73, 0.15);
    color: var(--red);
  }

  .result-text {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--text-secondary);
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
  }

  @media (max-width: 640px) {
    .query-grid-3,
    .query-grid-2 {
      grid-template-columns: 1fr;
    }

    .tabs {
      flex-wrap: wrap;
    }
  }
</style>
