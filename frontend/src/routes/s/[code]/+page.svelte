<script lang="ts">
  import { page } from '$app/state';
  import { browser } from '$app/environment';
  import { t } from '$lib/i18n';
  import { getUrl, incrementAccess } from '$lib/services/storage';
  import { cacheGet, cachePut, getCacheStats } from '$lib/services/cache';

  type RedirectPhase = 'cache-check' | 'cache-hit' | 'cache-miss' | 'found' | 'not-found';

  let phase: RedirectPhase = $state('cache-check');
  let originalUrl: string | null = $state(null);
  let countdown = $state(3);
  let cacheWasHit = $state(false);

  $effect(() => {
    if (!browser) return;

    const code = page.params.code!;
    if (!code) return;

    const steps = async () => {
      await delay(600);

      const cached = cacheGet(code);
      if (cached) {
        cacheWasHit = true;
        originalUrl = cached.originalUrl;
        phase = 'cache-hit';
        await delay(800);
        phase = 'found';
        incrementAccess(code);
        startCountdown();
        return;
      }

      phase = 'cache-miss';
      await delay(1000);

      const stored = getUrl(code);
      if (stored) {
        originalUrl = stored.originalUrl;
        cachePut(code, stored.originalUrl);
        phase = 'found';
        incrementAccess(code);
        startCountdown();
      } else {
        phase = 'not-found';
      }
    };

    steps();
  });

  function delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  function startCountdown() {
    const interval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(interval);
        if (originalUrl && browser) {
          window.location.href = originalUrl;
        }
      }
    }, 1000);
  }
</script>

<svelte:head>
  <title>{t('redirect.title')}</title>
</svelte:head>

<div class="redirect-page">
  <div class="redirect-card">
    <h1 class="redirect-title">{t('redirect.title')}</h1>

    <div class="steps">
      <div class="step" class:active={phase === 'cache-check'}>
        <span class="step-icon">
          {#if phase === 'cache-check'}⏳{:else}✓{/if}
        </span>
        <span>{t('redirect.lookingUp')}: <code>{page.params.code}</code></span>
      </div>

      <div class="step" class:active={phase === 'cache-check'}>
        <span class="step-icon">
          {#if phase === 'cache-check'}⏳
          {:else if cacheWasHit}✓
          {:else}✗{/if}
        </span>
        <span>{t('redirect.checkingCache')}</span>
      </div>

      {#if phase === 'cache-hit' || (phase !== 'cache-check' && cacheWasHit)}
        <div class="step hit">
          <span class="step-icon">⚡</span>
          <span>{t('redirect.cacheHit')}</span>
        </div>
      {/if}

      {#if phase === 'cache-miss' || (phase !== 'cache-check' && !cacheWasHit && phase !== 'not-found')}
        <div class="step miss" class:active={phase === 'cache-miss'}>
          <span class="step-icon">🔍</span>
          <span>{t('redirect.cacheMiss')}</span>
        </div>
      {/if}

      {#if phase === 'found' && originalUrl}
        <div class="step found">
          <span class="step-icon">✓</span>
          <div class="found-info">
            <span>{t('redirect.found')}</span>
            <a href={originalUrl} class="target-url">{originalUrl}</a>
            <div class="countdown">
              <span class="http-badge">HTTP 302</span>
              {t('redirect.redirecting')} {countdown}s...
            </div>
          </div>
        </div>
      {/if}

      {#if phase === 'not-found'}
        <div class="step error">
          <span class="step-icon">✗</span>
          <div class="not-found-info">
            <span>{t('redirect.notFound')}</span>
            <p>{t('redirect.notFoundDescription')}</p>
            <a href="/" class="back-link">{t('redirect.backHome')}</a>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .redirect-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 56px);
    padding: 2rem;
  }

  .redirect-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 2rem;
    max-width: 560px;
    width: 100%;
  }

  .redirect-title {
    font-family: var(--font-mono);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
  }

  .steps {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .step {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--text-secondary);
    padding: 0.625rem 0.875rem;
    background: var(--bg-primary);
    border-radius: var(--radius);
    border: 1px solid var(--border);
  }

  .step.active {
    border-color: var(--yellow);
  }

  .step.hit {
    border-color: var(--green);
    color: var(--green);
  }

  .step.miss {
    border-color: var(--yellow);
    color: var(--yellow);
  }

  .step.found {
    border-color: var(--green);
  }

  .step.error {
    border-color: var(--red);
  }

  .step-icon {
    flex-shrink: 0;
    width: 1.25rem;
    text-align: center;
  }

  .step code {
    color: var(--accent);
    background: var(--bg-tertiary);
    padding: 0.0625rem 0.375rem;
    border-radius: 4px;
  }

  .found-info, .not-found-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .target-url {
    color: var(--accent);
    word-break: break-all;
    font-size: 0.75rem;
  }

  .countdown {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted);
    font-size: 0.75rem;
  }

  .http-badge {
    background: var(--green-dim);
    color: #fff;
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    font-size: 0.6875rem;
    font-weight: 700;
  }

  .not-found-info p {
    font-size: 0.75rem;
    color: var(--text-muted);
    line-height: 1.6;
    font-family: var(--font-sans);
  }

  .back-link {
    font-size: 0.8125rem;
    color: var(--accent);
  }
</style>
