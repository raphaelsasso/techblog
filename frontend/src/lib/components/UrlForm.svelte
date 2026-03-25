<script lang="ts">
  import { t } from '$lib/i18n';

  interface Props {
    onshorten: (url: string) => void;
    loading?: boolean;
  }

  let { onshorten, loading = false }: Props = $props();
  let url = $state('');
  let error = $state('');

  function normalizeUrl(raw: string): string {
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';

    const trimmed = url.trim();
    if (!trimmed) return;

    const fullUrl = normalizeUrl(trimmed);

    try {
      new URL(fullUrl);
    } catch {
      error = 'Please enter a valid URL (e.g., google.com)';
      return;
    }

    onshorten(fullUrl);
    url = '';
  }
</script>

<form class="url-form" onsubmit={handleSubmit}>
  <div class="input-row">
    <div class="input-wrapper">
      <span class="input-prefix">https://</span>
      <input
        type="text"
        bind:value={url}
        placeholder={t('urlShortener.inputPlaceholder')}
        disabled={loading}
      />
    </div>
    <button type="submit" class="shorten-btn" disabled={loading || !url.trim()}>
      {#if loading}
        <span class="spinner"></span>
      {:else}
        {t('urlShortener.shorten')}
      {/if}
    </button>
  </div>
  {#if error}
    <p class="error-msg">{error}</p>
  {/if}
</form>

<style>
  .url-form {
    margin-bottom: 2rem;
  }

  .input-row {
    display: flex;
    gap: 0.75rem;
  }

  .input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    transition: border-color var(--transition);
  }

  .input-wrapper:focus-within {
    border-color: var(--accent);
  }

  .input-prefix {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--text-muted);
    padding: 0 0 0 0.875rem;
    user-select: none;
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 0.875rem;
    padding: 0.75rem 0.875rem 0.75rem 0.25rem;
  }

  input::placeholder {
    color: var(--text-muted);
  }

  .shorten-btn {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: #fff;
    background: var(--green-dim);
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius);
    white-space: nowrap;
    min-width: 110px;
  }

  .shorten-btn:hover:not(:disabled) {
    background: var(--green);
  }

  .shorten-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-msg {
    font-size: 0.8125rem;
    color: var(--red);
    margin-top: 0.5rem;
    font-family: var(--font-mono);
  }

  @media (max-width: 640px) {
    .input-row {
      flex-direction: column;
    }
  }
</style>
