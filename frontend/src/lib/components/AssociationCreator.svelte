<script lang="ts">
  import { t } from '$lib/i18n';
  import type { TaoObject, AssocType } from '$lib/services/social-graph';
  import { ASSOC_TYPES, INVERSE_MAP, getObjectLabel } from '$lib/services/social-graph';

  interface Props {
    objects: TaoObject[];
    oncreate: (id1: number, type: AssocType, id2: number) => void;
  }

  let { objects, oncreate }: Props = $props();
  let sourceId = $state<number | null>(null);
  let targetId = $state<number | null>(null);
  let assocType: AssocType = $state('FRIEND');

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (sourceId === null || targetId === null) return;
    oncreate(sourceId, assocType, targetId);
  }

  let canSubmit = $derived(sourceId !== null && targetId !== null && sourceId !== targetId);

  let isBidirectional = $derived(INVERSE_MAP[assocType] === assocType);
  let inverseType = $derived(INVERSE_MAP[assocType]);
</script>

<form class="creator" onsubmit={handleSubmit}>
  <h3 class="creator-title">
    <span class="creator-icon">↔</span>
    {t('socialGraph.createAssociation')}
  </h3>

  <div class="creator-grid">
    <div class="field field-source">
      <label class="field-label" for="assoc-source">{t('socialGraph.sourceObject')}</label>
      <select id="assoc-source" class="field-select" bind:value={sourceId}>
        <option value={null}>—</option>
        {#each objects as obj (obj.id)}
          <option value={obj.id}>{getObjectLabel(obj)} ({obj.type})</option>
        {/each}
      </select>
    </div>

    <div class="field field-type">
      <label class="field-label" for="assoc-type">{t('socialGraph.associationType')}</label>
      <select id="assoc-type" class="field-select" bind:value={assocType}>
        {#each ASSOC_TYPES as aType}
          <option value={aType}>{aType} {INVERSE_MAP[aType] === aType ? '↔' : '→'}</option>
        {/each}
      </select>
    </div>

    <div class="field field-target">
      <label class="field-label" for="assoc-target">{t('socialGraph.targetObject')}</label>
      <select id="assoc-target" class="field-select" bind:value={targetId}>
        <option value={null}>—</option>
        {#each objects as obj (obj.id)}
          <option value={obj.id}>{getObjectLabel(obj)} ({obj.type})</option>
        {/each}
      </select>
    </div>

    <div class="directionality-hint">
      {#if isBidirectional}
        <span class="hint-badge bidirectional">↔ {t('socialGraph.bidirectional')}</span>
        <span class="hint-text">{assocType} ⟷ {assocType}</span>
      {:else if inverseType}
        <span class="hint-badge unidirectional">→ {t('socialGraph.unidirectional')}</span>
        <span class="hint-text">{t('socialGraph.autoInverse')}: {assocType} → {inverseType}</span>
      {/if}
    </div>

    <button type="submit" class="create-btn" disabled={!canSubmit}>
      {t('socialGraph.link')}
    </button>
  </div>
</form>

<style>
  .creator {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .creator-title {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .creator-icon {
    color: var(--accent);
    font-size: 1rem;
    font-weight: 700;
  }

  .creator-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 0.75rem;
    align-items: end;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    min-width: 0;
  }

  .field-source {
    grid-column: 1;
  }

  .field-type {
    grid-column: 2;
  }

  .field-target {
    grid-column: 3;
  }

  .directionality-hint {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem 0.75rem;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .hint-badge {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: 600;
    padding: 0.1875rem 0.5rem;
    border-radius: 9999px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .hint-badge.bidirectional {
    background: rgba(63, 185, 80, 0.15);
    color: var(--green);
  }

  .hint-badge.unidirectional {
    background: rgba(88, 166, 255, 0.15);
    color: var(--accent);
  }

  .hint-text {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .create-btn {
    grid-column: 1 / -1;
  }

  .field-label {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .field-select {
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

  .field-select:focus {
    border-color: var(--accent);
    outline: none;
  }

  .create-btn {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: 600;
    color: #fff;
    background: var(--accent);
    padding: 0.625rem 1.25rem;
    border-radius: var(--radius);
    white-space: nowrap;
    transition: opacity var(--transition);
  }

  .create-btn:hover:not(:disabled) {
    opacity: 0.85;
  }

  .create-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    .creator-grid {
      grid-template-columns: 1fr;
    }

    .field-source,
    .field-type,
    .field-target {
      grid-column: 1;
    }
  }
</style>
