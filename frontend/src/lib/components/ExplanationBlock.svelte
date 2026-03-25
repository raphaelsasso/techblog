<script lang="ts">
  interface Props {
    title: string;
    content: string;
    defaultOpen?: boolean;
  }

  let { title, content, defaultOpen = false }: Props = $props();
  let isOpen = $state<boolean>(false);

  $effect(() => {
    isOpen = defaultOpen;
  });

  let paragraphs = $derived(content.split('\n\n'));

  function formatText(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n- /g, '\n• ')
      .replace(/\n(\d+)\. /g, '\n$1. ')
      .replace(/\n/g, '<br>');
  }
</script>

<details class="explanation" open={isOpen}>
  <summary
    class="explanation-header"
    onclick={(e) => {
      e.preventDefault();
      isOpen = !isOpen;
    }}
  >
    <span class="explanation-icon">{isOpen ? '▾' : '▸'}</span>
    <span class="explanation-label">💡</span>
    <span class="explanation-title">{title}</span>
  </summary>

  {#if isOpen}
    <div class="explanation-content">
      {#each paragraphs as paragraph}
        <p>{@html formatText(paragraph)}</p>
      {/each}
    </div>
  {/if}
</details>

<style>
  .explanation {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    margin: 1.5rem 0;
    overflow: hidden;
  }

  .explanation-header {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 1rem 1.25rem;
    cursor: pointer;
    user-select: none;
    list-style: none;
    transition: background var(--transition);
  }

  .explanation-header::-webkit-details-marker {
    display: none;
  }

  .explanation-header:hover {
    background: var(--bg-tertiary);
  }

  .explanation-icon {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-muted);
    width: 1rem;
    text-align: center;
  }

  .explanation-label {
    font-size: 1rem;
  }

  .explanation-title {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--accent);
  }

  .explanation-content {
    padding: 0 1.25rem 1.25rem;
    border-top: 1px solid var(--border);
    padding-top: 1.25rem;
  }

  .explanation-content p {
    font-size: 0.875rem;
    line-height: 1.75;
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }

  .explanation-content p:last-child {
    margin-bottom: 0;
  }

  .explanation-content :global(strong) {
    color: var(--text-primary);
    font-weight: 600;
  }

  .explanation-content :global(code) {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    background: var(--bg-tertiary);
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
    color: var(--green);
  }
</style>
