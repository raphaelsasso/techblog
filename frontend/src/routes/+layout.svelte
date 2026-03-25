<script lang="ts">
  import '../app.css';
  import { getLocale, setLocale, detectLocale, t } from '$lib/i18n';
  import { initPostHog, capturePageview } from '$lib/services/posthog';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  $effect(() => {
    setLocale(detectLocale());
  });

  initPostHog();
  afterNavigate(() => capturePageview($page.url.href));

  function toggleLocale() {
    setLocale(getLocale() === 'en' ? 'pt' : 'en');
  }
</script>

<nav>
  <div class="nav-inner container">
    <a href="/" class="logo">
      <span class="logo-symbol">~/</span>
      <span class="logo-text">raphael.sasso</span>
    </a>
    <div class="nav-actions">
      <a href="/" class="nav-link">{t('nav.home')}</a>
      <button class="locale-toggle" onclick={toggleLocale}>
        {t('nav.language')}
      </button>
    </div>
  </div>
</nav>

<main>
  {@render children()}
</main>

<style>
  nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(13, 17, 23, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }

  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
  }

  .logo {
    font-family: var(--font-mono);
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-primary);
    display: flex;
    gap: 0;
  }

  .logo:hover {
    color: var(--text-primary);
  }

  .logo-symbol {
    color: var(--green);
  }

  .logo-text {
    color: var(--text-primary);
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .nav-link {
    font-size: 0.875rem;
    color: var(--text-secondary);
    padding: 0.375rem 0.75rem;
    border-radius: var(--radius);
    transition: all var(--transition);
  }

  .nav-link:hover {
    color: var(--text-primary);
    background: var(--bg-tertiary);
  }

  .locale-toggle {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--accent);
    background: transparent;
    border: 1px solid var(--border);
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius);
    letter-spacing: 0.05em;
  }

  .locale-toggle:hover {
    border-color: var(--accent);
    background: rgba(88, 166, 255, 0.1);
  }

  main {
    position: relative;
    z-index: 1;
    min-height: calc(100vh - 56px);
  }
</style>
