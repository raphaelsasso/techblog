<script lang="ts">
  import { t } from '$lib/i18n';
  import { shortenUrl } from '$lib/services/api';
  import { saveUrl, getAllUrls, clearAll, type StoredUrl } from '$lib/services/storage';
  import { getCacheStats, resetCache, type CacheStats } from '$lib/services/cache';
  import UrlForm from '$lib/components/UrlForm.svelte';
  import UrlList from '$lib/components/UrlList.svelte';
  import CacheVisualizer from '$lib/components/CacheVisualizer.svelte';
  import ExplanationBlock from '$lib/components/ExplanationBlock.svelte';

  let urls: StoredUrl[] = $state([]);
  let cacheStats: CacheStats = $state(getCacheStats());
  let loading = $state(false);

  $effect(() => {
    urls = getAllUrls();
  });

  async function handleShorten(url: string) {
    loading = true;
    try {
      const result = await shortenUrl(url);
      saveUrl(result.id, result.shortCode, result.originalUrl);
      urls = getAllUrls();
      cacheStats = getCacheStats();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  function handleClear() {
    clearAll();
    resetCache();
    urls = [];
    cacheStats = getCacheStats();
  }
</script>

<svelte:head>
  <title>{t('urlShortener.title')} — Raphael Sasso</title>
</svelte:head>

<div class="page container">
  <header class="page-header">
    <h1 class="page-title">
      <span class="title-accent">&gt;</span> {t('urlShortener.title')}
    </h1>
    <p class="page-subtitle">{t('urlShortener.subtitle')}</p>
  </header>

  <UrlForm onshorten={handleShorten} {loading} />

  <ExplanationBlock
    title={t('explanations.base62.title')}
    content={t('explanations.base62.content')}
    defaultOpen={true}
  />

  <ExplanationBlock
    title={t('explanations.birthdayParadox.title')}
    content={t('explanations.birthdayParadox.content')}
  />

  <UrlList {urls} onclear={handleClear} />

  <ExplanationBlock
    title={t('explanations.storage.title')}
    content={t('explanations.storage.content')}
  />

  <CacheVisualizer stats={cacheStats} />

  <ExplanationBlock
    title={t('explanations.cache.title')}
    content={t('explanations.cache.content')}
  />

  <ExplanationBlock
    title={t('explanations.redirects.title')}
    content={t('explanations.redirects.content')}
  />

  <ExplanationBlock
    title={t('explanations.systemDesign.title')}
    content={t('explanations.systemDesign.content')}
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
</style>
