<script lang="ts">
  import { t } from '$lib/i18n';
  import {
    getAllObjects,
    getDirectAssociations,
    createObject,
    createAssociation,
    seedData,
    clearAll,
    resetCaches,
    getCacheTierStats,
    type TaoObject,
    type TaoAssociation,
    type ObjectType,
    type AssocType,
    type CacheTierStats,
  } from '$lib/services/social-graph';
  import ObjectCreator from '$lib/components/ObjectCreator.svelte';
  import AssociationCreator from '$lib/components/AssociationCreator.svelte';
  import GraphVisualizer from '$lib/components/GraphVisualizer.svelte';
  import TaoQueryPanel from '$lib/components/TaoQueryPanel.svelte';
  import CacheTierVisualizer from '$lib/components/CacheTierVisualizer.svelte';
  import ExplanationBlock from '$lib/components/ExplanationBlock.svelte';

  let objects: TaoObject[] = $state([]);
  let associations: TaoAssociation[] = $state([]);
  let cacheStats: CacheTierStats = $state(getCacheTierStats());

  $effect(() => {
    seedData();
    objects = getAllObjects();
    associations = getDirectAssociations();
  });

  function refresh() {
    objects = getAllObjects();
    associations = getDirectAssociations();
  }

  function handleCreateObject(type: ObjectType, fields: Record<string, string>) {
    createObject(type, fields);
    refresh();
  }

  function handleCreateAssociation(id1: number, type: AssocType, id2: number) {
    createAssociation(id1, type, id2);
    refresh();
  }

  function handleCacheUpdate() {
    cacheStats = getCacheTierStats();
  }

  function handleResetCache() {
    resetCaches();
    cacheStats = getCacheTierStats();
  }

  function handleClearAll() {
    clearAll();
    objects = [];
    associations = [];
    cacheStats = getCacheTierStats();
  }

  function handleReseed() {
    clearAll();
    seedData();
    refresh();
    cacheStats = getCacheTierStats();
  }
</script>

<svelte:head>
  <title>{t('socialGraph.title')} — Raphael Sasso</title>
</svelte:head>

<div class="page container">
  <header class="page-header">
    <h1 class="page-title">
      <span class="title-accent">&gt;</span> {t('socialGraph.title')}
    </h1>
    <p class="page-subtitle">{t('socialGraph.subtitle')}</p>
  </header>

  <ObjectCreator oncreate={handleCreateObject} />

  <ExplanationBlock
    title={t('explanations.objectsAndAssociations.title')}
    content={t('explanations.objectsAndAssociations.content')}
    defaultOpen={true}
  />

  <AssociationCreator {objects} oncreate={handleCreateAssociation} />

  <ExplanationBlock
    title={t('explanations.whyNotSql.title')}
    content={t('explanations.whyNotSql.content')}
  />

  <GraphVisualizer {objects} {associations} />

  <div class="actions-row">
    <button class="action-btn reseed" onclick={handleReseed}>
      {t('socialGraph.reseed')}
    </button>
    <button class="action-btn clear" onclick={handleClearAll}>
      {t('socialGraph.clearAll')}
    </button>
  </div>

  <ExplanationBlock
    title={t('explanations.taoApi.title')}
    content={t('explanations.taoApi.content')}
  />

  <TaoQueryPanel {objects} oncacheupdate={handleCacheUpdate} />

  <CacheTierVisualizer stats={cacheStats} onreset={handleResetCache} />

  <ExplanationBlock
    title={t('explanations.twoTierCache.title')}
    content={t('explanations.twoTierCache.content')}
  />

  <ExplanationBlock
    title={t('explanations.sharding.title')}
    content={t('explanations.sharding.content')}
  />

  <ExplanationBlock
    title={t('explanations.consistency.title')}
    content={t('explanations.consistency.content')}
  />

  <ExplanationBlock
    title={t('explanations.socialGraphSystemDesign.title')}
    content={t('explanations.socialGraphSystemDesign.content')}
  />

  <ExplanationBlock
    title={t('explanations.socialGraphReferences.title')}
    content={t('explanations.socialGraphReferences.content')}
  />
</div>

<style>
  .page {
    padding: 3rem 1.5rem 6rem;
    max-width: 800px;
  }

  .page-header {
    margin-bottom: 2.5rem;
  }

  .page-title {
    font-family: var(--font-mono);
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  .title-accent {
    color: var(--green);
  }

  .page-subtitle {
    font-size: 0.9375rem;
    color: var(--text-secondary);
  }

  .actions-row {
    display: flex;
    gap: 0.75rem;
    margin: 0.5rem 0 1.5rem;
  }

  .action-btn {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: var(--radius);
    transition: all var(--transition);
  }

  .action-btn.reseed {
    color: var(--accent);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }

  .action-btn.reseed:hover {
    border-color: var(--accent);
    background: var(--bg-tertiary);
  }

  .action-btn.clear {
    color: var(--red);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }

  .action-btn.clear:hover {
    border-color: var(--red);
    background: var(--bg-tertiary);
  }

  @media (max-width: 640px) {
    .actions-row {
      flex-direction: column;
    }
  }
</style>
