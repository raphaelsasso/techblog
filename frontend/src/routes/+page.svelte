<script lang="ts">
  import GradientNoise from '$lib/components/GradientNoise.svelte';
  import { t } from '$lib/i18n';
  import { browser } from '$app/environment';

  interface TermLine {
    type: 'command' | 'text' | 'profile' | 'link';
    command?: string;
    text?: string;
    url?: string;
    label?: string;
  }

  let history: TermLine[] = $state([]);
  let input = $state('');
  let ghost = $state('');
  let inputEl: HTMLInputElement | undefined = $state();

  const ALL_COMMANDS = ['hello', 'cat about.md', '/github', '/linkedin', '/rocambole', 'help', 'clear'];

  $effect(() => {
    const trimmed = input.toLowerCase().trim();
    if (!trimmed) { ghost = ''; return; }
    const match = ALL_COMMANDS.find(c => c.startsWith(trimmed) && c !== trimmed);
    ghost = match ?? '';
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Tab' && ghost) {
      e.preventDefault();
      input = ghost;
      ghost = '';
    }
  }

  const COMMANDS: Record<string, () => TermLine[]> = {
    'hello': () => [{ type: 'text', text: 'world' }],
    '/github': () => {
      if (browser) window.open('https://github.com/raphaelsasso', '_blank');
      return [{ type: 'link', url: 'https://github.com/raphaelsasso', label: 'Opening GitHub...' }];
    },
    '/linkedin': () => {
      if (browser) window.open('https://www.linkedin.com/in/raphael-sasso/', '_blank');
      return [{ type: 'link', url: 'https://www.linkedin.com/in/raphael-sasso/', label: 'Opening LinkedIn...' }];
    },
    'cat about.md': () => [{ type: 'profile' }],
    '/rocambole': () => [
      { type: 'text', text: '    /\\_/\\' },
      { type: 'text', text: '= ( \u2022 . \u2022 ) =' },
      { type: 'text', text: '   /     \\' },
      { type: 'text', text: '' },
      { type: 'text', text: 'Rocambole says meow! 🐾' },
    ],
    'help': () => [
      { type: 'text', text: 'Available commands:' },
      { type: 'text', text: '  hello           → world' },
      { type: 'text', text: '  cat about.md    → who am I' },
      { type: 'text', text: '  /github         → open GitHub profile' },
      { type: 'text', text: '  /linkedin       → open LinkedIn profile' },
      { type: 'text', text: '  /rocambole      → 🐱' },
      { type: 'text', text: '  clear           → clear terminal' },
    ],
  };

  function handleSubmit(e: Event) {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;

    history.push({ type: 'command', command: input.trim() });

    if (cmd === 'clear') {
      history = [];
    } else if (COMMANDS[cmd]) {
      history.push(...COMMANDS[cmd]());
    } else {
      history.push({ type: 'text', text: `command not found: ${input.trim()}. Type "help" for available commands.` });
    }

    input = '';
    scrollToBottom();
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inputEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  }

  function focusInput() {
    inputEl?.focus();
  }

  $effect(() => {
    if (browser && inputEl) inputEl.focus();
  });
</script>

<svelte:head>
  <title>Raphael Sasso — System Design & Architecture</title>
</svelte:head>

<GradientNoise />

<div class="hero">
  <div class="container">
    <section class="intro">
      <div class="terminal" role="textbox" tabindex="0" onclick={focusInput} onkeydown={focusInput}>
        <div class="terminal-header">
          <span class="terminal-dot red"></span>
          <span class="terminal-dot yellow"></span>
          <span class="terminal-dot green"></span>
          <span class="terminal-title">raphael@blog:~</span>
        </div>

        <div class="terminal-body">
          <div class="terminal-welcome">
            <span class="welcome-text">Type <strong>help</strong> to see available commands</span>
          </div>

          {#each history as line, i (i)}
            {#if line.type === 'command'}
              <div class="term-line">
                <span class="prompt">$</span>
                <span class="cmd">{line.command}</span>
              </div>
            {:else if line.type === 'text'}
              <div class="term-output">{line.text}</div>
            {:else if line.type === 'link'}
              <div class="term-output link-output">
                <span>{line.label}</span>
                <a href={line.url} target="_blank" rel="noopener noreferrer">{line.url}</a>
              </div>
            {:else if line.type === 'profile'}
              <div class="profile-output">
                <div class="output-profile">
                  <img src="/raphael.jpg" alt="Raphael Sasso" class="avatar" onload={scrollToBottom} />
                  <div class="output-identity">
                    <p class="output-greeting">{t('home.greeting')}</p>
                    <h1 class="output-name">{t('home.name')}</h1>
                  </div>
                </div>
                <p class="output-bio">{t('home.intro')}</p>
                <div class="output-links">
                  <span class="output-label">links:</span>
                  <a href="https://github.com/raphaelsasso" target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    GitHub
                  </a>
                  <a href="https://www.linkedin.com/in/raphael-sasso/" target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </a>
                </div>
              </div>
            {/if}
          {/each}

          <form class="input-line" onsubmit={handleSubmit}>
            <span class="prompt">$</span>
            <div class="input-wrapper">
              {#if ghost}
                <span class="ghost-text">{ghost}</span>
              {/if}
              <input
                bind:this={inputEl}
                bind:value={input}
                onkeydown={handleKeydown}
                type="text"
                class="term-input"
                spellcheck="false"
                autocomplete="off"
              />
              {#if ghost}
                <span class="tab-hint">tab</span>
              {/if}
            </div>
          </form>
        </div>
      </div>
    </section>

    <section class="examples">
      <h2 class="section-title">
        <span class="title-accent">#</span> {t('home.techExamples')}
      </h2>
      <p class="section-description">{t('home.techExamplesDescription')}</p>

      <div class="card-grid">
        <a href="/url-shortener" class="example-card">
          <div class="card-icon">🔗</div>
          <div class="card-content">
            <h3>{t('home.urlShortener')}</h3>
            <p>{t('home.urlShortenerDescription')}</p>
          </div>
          <div class="card-arrow">→</div>
        </a>
        <a href="/social-graph" class="example-card">
          <div class="card-icon">🕸️</div>
          <div class="card-content">
            <h3>{t('home.socialGraph')}</h3>
            <p>{t('home.socialGraphDescription')}</p>
          </div>
          <div class="card-arrow">→</div>
        </a>
      </div>
    </section>
  </div>
</div>

<style>
  .hero {
    padding: 4rem 0 6rem;
    position: relative;
  }

  .intro {
    padding: 4rem 0 5rem;
  }

  .terminal {
    max-width: 680px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    outline: none;
    transition: border-color var(--transition);
  }

  .terminal:focus-within {
    border-color: var(--accent);
  }

  .terminal-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border);
  }

  .terminal-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .terminal-dot.red { background: #ff5f57; }
  .terminal-dot.yellow { background: #febc2e; }
  .terminal-dot.green { background: #28c840; }

  .terminal-title {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-left: 0.5rem;
  }

  .terminal-body {
    padding: 1.25rem;
    max-height: 500px;
    overflow-y: auto;
  }

  .terminal-welcome {
    margin-bottom: 1rem;
  }

  .welcome-text {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--text-muted);
  }

  .welcome-text :global(strong) {
    color: var(--green);
  }

  .term-line {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .prompt {
    color: var(--green);
    font-weight: 700;
    font-family: var(--font-mono);
    font-size: 0.875rem;
  }

  .cmd {
    color: var(--text-secondary);
  }

  .term-output {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--text-secondary);
    padding-left: 1.25rem;
    margin-bottom: 0.25rem;
    white-space: pre;
  }

  .link-output {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    white-space: normal;
  }

  .link-output a {
    color: var(--accent);
    font-size: 0.75rem;
  }

  .profile-output {
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .output-profile {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border);
    flex-shrink: 0;
  }

  .output-greeting {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--green);
    margin-bottom: 0.25rem;
  }

  .output-name {
    font-family: var(--font-mono);
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
  }

  .output-bio {
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.7;
  }

  .output-links {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .output-label {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .output-links a {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--accent);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    padding: 0.25rem 0.625rem;
    border-radius: var(--radius);
    transition: all var(--transition);
  }

  .output-links a:hover {
    color: var(--accent-hover);
    border-color: var(--accent);
    background: rgba(88, 166, 255, 0.08);
  }

  .input-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .input-wrapper {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
  }

  .ghost-text {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    font-family: var(--font-mono);
    font-size: 0.875rem;
    color: var(--text-muted);
    opacity: 0.35;
    pointer-events: none;
    white-space: pre;
  }

  .tab-hint {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    color: var(--text-muted);
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    padding: 0.0625rem 0.375rem;
    border-radius: 3px;
    margin-left: 0.5rem;
    opacity: 0.6;
    flex-shrink: 0;
  }

  .term-input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: 0.875rem;
    outline: none;
    caret-color: var(--accent);
    padding: 0;
    position: relative;
    z-index: 1;
  }

  .term-input::placeholder {
    color: var(--text-muted);
    opacity: 0.4;
  }

  .examples {
    padding-top: 2rem;
    border-top: 1px solid var(--border);
  }

  .section-title {
    font-family: var(--font-mono);
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  .title-accent {
    color: var(--purple);
  }

  .section-description {
    color: var(--text-secondary);
    font-size: 0.9375rem;
    margin-bottom: 2rem;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1rem;
  }

  .example-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    color: var(--text-primary);
    transition: all var(--transition);
  }

  .example-card:hover {
    border-color: var(--border-hover);
    background: var(--bg-tertiary);
    transform: translateY(-2px);
    color: var(--text-primary);
  }

  .card-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-tertiary);
    border-radius: var(--radius);
  }

  .card-content h3 {
    font-family: var(--font-mono);
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .card-content p {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .card-arrow {
    margin-left: auto;
    color: var(--text-muted);
    font-size: 1.25rem;
    flex-shrink: 0;
    align-self: center;
    transition: all var(--transition);
  }

  .example-card:hover .card-arrow {
    color: var(--accent);
    transform: translateX(4px);
  }

  @media (max-width: 640px) {
    .hero {
      padding: 2rem 0 4rem;
    }

    .intro {
      padding: 2rem 0 3rem;
    }

    .output-name {
      font-size: 1.125rem;
    }

    .card-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
