<script lang="ts">
  import { t } from '$lib/i18n';
  import type { ObjectType } from '$lib/services/social-graph';
  import { OBJECT_TYPES } from '$lib/services/social-graph';

  interface Props {
    oncreate: (type: ObjectType, fields: Record<string, string>) => void;
  }

  let { oncreate }: Props = $props();
  let selectedType: ObjectType = $state('USER');
  let name = $state('');

  function handleSubmit(e: Event) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    oncreate(selectedType, { name: trimmed });
    name = '';
  }
</script>

<form class="creator" onsubmit={handleSubmit}>
  <h3 class="creator-title">
    <span class="creator-icon">+</span>
    {t('socialGraph.createObject')}
  </h3>

  <div class="creator-row">
    <div class="field">
      <label class="field-label" for="obj-type">{t('socialGraph.objectType')}</label>
      <select id="obj-type" class="field-select" bind:value={selectedType}>
        {#each OBJECT_TYPES as objType}
          <option value={objType}>{objType}</option>
        {/each}
      </select>
    </div>

    <div class="field field-grow">
      <label class="field-label" for="obj-name">{t('socialGraph.objectName')}</label>
      <input
        id="obj-name"
        type="text"
        class="field-input"
        bind:value={name}
        placeholder={t('socialGraph.objectNamePlaceholder')}
      />
    </div>

    <button type="submit" class="create-btn" disabled={!name.trim()}>
      {t('socialGraph.create')}
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
    color: var(--green);
    font-size: 1rem;
    font-weight: 700;
  }

  .creator-row {
    display: flex;
    gap: 0.75rem;
    align-items: flex-end;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .field-grow {
    flex: 1;
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
  }

  .field-select:focus,
  .field-input:focus {
    border-color: var(--accent);
    outline: none;
  }

  .field-input::placeholder {
    color: var(--text-muted);
  }

  .create-btn {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: 600;
    color: #fff;
    background: var(--green-dim);
    padding: 0.625rem 1.25rem;
    border-radius: var(--radius);
    white-space: nowrap;
    transition: background var(--transition);
  }

  .create-btn:hover:not(:disabled) {
    background: var(--green);
  }

  .create-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    .creator-row {
      flex-direction: column;
      align-items: stretch;
    }

    .create-btn {
      width: 100%;
    }
  }
</style>
