<script lang="ts">
  import { t } from '$lib/i18n';
  import type { StoredUrl } from '$lib/services/storage';

  interface Props {
    urls: StoredUrl[];
    onclear: () => void;
  }

  let { urls, onclear }: Props = $props();
  let copiedCode: string | null = $state(null);

  function getShortUrl(code: string): string {
    if (typeof window === 'undefined') return `/s/${code}`;
    return `${window.location.origin}/s/${code}`;
  }

  async function copyToClipboard(code: string) {
    await navigator.clipboard.writeText(getShortUrl(code));
    copiedCode = code;
    setTimeout(() => { copiedCode = null; }, 2000);
  }

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
</script>

<section class="url-list">
  <div class="list-header">
    <h3>{t('urlShortener.shortenedUrls')}</h3>
    {#if urls.length > 0}
      <button class="clear-btn" onclick={onclear}>{t('urlShortener.clear')}</button>
    {/if}
  </div>

  {#if urls.length === 0}
    <div class="empty-state">
      <p>{t('urlShortener.noUrls')}</p>
    </div>
  {:else}
    <div class="list-items">
      {#each urls as entry (entry.shortCode)}
        <div class="url-item">
          <div class="url-info">
            <div class="short-url">
              <a href="/s/{entry.shortCode}" class="short-link">{getShortUrl(entry.shortCode)}</a>
              <span class="access-count">{entry.accessCount} {t('urlShortener.clicks')}</span>
            </div>
            <div class="original-url">{entry.originalUrl}</div>
            <div class="url-meta">{formatDate(entry.createdAt)}</div>
          </div>
          <div class="url-actions">
            <button
              class="action-btn copy-btn"
              onclick={() => copyToClipboard(entry.shortCode)}
            >
              {copiedCode === entry.shortCode ? t('urlShortener.copied') : t('urlShortener.copy')}
            </button>
            <a
              href="/s/{entry.shortCode}"
              class="action-btn visit-btn"
            >
              {t('urlShortener.visit')}
            </a>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .url-list {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border);
  }

  .list-header h3 {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .clear-btn {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--red);
    background: transparent;
    padding: 0.25rem 0.625rem;
    border-radius: var(--radius);
    border: 1px solid transparent;
  }

  .clear-btn:hover {
    border-color: var(--red);
    background: rgba(248, 81, 73, 0.1);
  }

  .empty-state {
    padding: 2.5rem;
    text-align: center;
  }

  .empty-state p {
    font-size: 0.875rem;
    color: var(--text-muted);
    font-family: var(--font-mono);
  }

  .list-items {
    max-height: 400px;
    overflow-y: auto;
  }

  .url-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border);
    gap: 1rem;
  }

  .url-item:last-child {
    border-bottom: none;
  }

  .url-info {
    flex: 1;
    min-width: 0;
  }

  .short-url {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.25rem;
  }

  .short-link {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--accent);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .access-count {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
    background: var(--bg-tertiary);
    padding: 0.125rem 0.5rem;
    border-radius: 999px;
    white-space: nowrap;
  }

  .original-url {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 0.25rem;
  }

  .url-meta {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
  }

  .url-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .action-btn {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.375rem 0.75rem;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-secondary);
    display: inline-flex;
    align-items: center;
    text-decoration: none;
  }

  .copy-btn:hover {
    border-color: var(--green);
    color: var(--green);
    background: rgba(63, 185, 80, 0.1);
  }

  .visit-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: rgba(88, 166, 255, 0.1);
  }

  @media (max-width: 640px) {
    .url-item {
      flex-direction: column;
      align-items: flex-start;
    }

    .url-actions {
      width: 100%;
    }

    .action-btn {
      flex: 1;
      justify-content: center;
    }
  }
</style>
