# Post Structure Guide

How we build "live tech example" posts. Follow this template when adding new topics.

---

## Philosophy

Each post is a **working demo** paired with **educational content**. The user interacts with a real implementation while collapsible explanation blocks teach the system design concepts behind it. All data lives in the browser — no server-side persistence required for the demo itself.

Key principles:

- **Show, then explain** — the interactive piece comes first, explanations surround it
- **Production context** — every explanation bridges "what we do in this demo" to "what you'd do at scale"
- **No comments in code** — the code should be self-documenting, written at a senior level
- **i18n from day one** — every user-facing string goes through `t()`, with `en.json` and `pt.json` translations

---

## Route & File Structure

Each new topic follows this layout:

```
frontend/src/
├── routes/
│   └── {topic-slug}/
│       └── +page.svelte           # Main interactive page
├── lib/
│   ├── components/
│   │   ├── {TopicSpecific}.svelte  # Topic-specific UI components
│   │   └── ExplanationBlock.svelte # Reused across all topics
│   └── services/
│       └── {topic}.ts             # Business logic, browser storage, simulation
```

Backend (if needed):

```
backend/src/
└── {topic}/
    ├── {topic}.module.ts
    ├── {topic}.controller.ts
    ├── {topic}.service.ts
    └── dto/
        ├── create-{topic}.dto.ts
        └── {topic}-response.dto.ts
```

---

## Page Composition Pattern

The main `+page.svelte` follows a consistent vertical layout:

```
┌─────────────────────────────────────┐
│  Page Header (title + subtitle)     │
├─────────────────────────────────────┤
│  Interactive Input / Form           │
├─────────────────────────────────────┤
│  ExplanationBlock (core concept)    │  ← defaultOpen={true}
├─────────────────────────────────────┤
│  ExplanationBlock (why not X?)      │
├─────────────────────────────────────┤
│  Results / Output List              │
├─────────────────────────────────────┤
│  ExplanationBlock (storage)         │
├─────────────────────────────────────┤
│  Visualizer Component (cache, etc.) │
├─────────────────────────────────────┤
│  ExplanationBlock (performance)     │
├─────────────────────────────────────┤
│  ExplanationBlock (system design)   │  ← second-to-last
├─────────────────────────────────────┤
│  ExplanationBlock (references)      │  ← always last
└─────────────────────────────────────┘
```

The first explanation block uses `defaultOpen={true}` so users immediately see educational content. The rest start collapsed.

The flow interleaves **interactive sections** with **explanations** — users do something, then read about why it works that way.

---

## Explanation Content Style

Each explanation block is a translation key under `explanations.{concept}` with `title` and `content` fields.

### Writing rules

1. **Start with "In this demo"** — ground the reader in what they just interacted with
2. **Bridge to production** — "In production with 100M+ URLs, you'd need..."
3. **Use bold headers** — `**DynamoDB**`, `**Redis INCR**` to break up wall-of-text
4. **Include numbers** — `62^7 = 3,521,614,606,208`, `~30 application servers`, `80-90% reduction`
5. **Use markdown formatting** — `**bold**`, `` `code` ``, bullet lists with `- ` prefix. The `ExplanationBlock` component renders these as HTML
6. **Separate paragraphs** with `\n\n` (double newline in JSON strings)
7. **Keep it conversational** — "This seems elegant — but..." rather than textbook tone
8. **End with a takeaway** — summarize the key insight or list the benefits

### Content structure per block

```
Paragraph 1: What this concept is and why it matters
Paragraph 2: How it works (with concrete numbers/examples)
Paragraph 3: How we simulate it in the demo
Paragraph 4: What production looks like
Paragraph 5: Summary / bullet-point takeaway (optional)
```

### Example (from URL shortener):

```json
{
  "title": "Caching Layer",
  "content": "When a short URL is accessed, looking it up in the database every time is wasteful — especially for popular links.\n\nA **cache** (like Redis or Memcached) sits between your app and the database:\n\n1. **Request arrives** → check cache first\n2. **Cache HIT** → return immediately (sub-millisecond)\n3. **Cache MISS** → query database, store result in cache, return\n\nThis is the **cache-aside** (lazy loading) pattern. Popular URLs stay hot in cache, reducing database load by **80-90%**.\n\nWe simulate this with an **LRU (Least Recently Used)** cache in the browser. When the cache is full, the least recently accessed entry gets evicted to make room for new ones.\n\nIn production, a Redis cluster with ~128MB can cache millions of hot URLs."
}
```

---

## Component Patterns

### Props Interface

Always define an explicit `Props` interface using `$props()`:

```svelte
<script lang="ts">
  interface Props {
    onaction: (value: string) => void;
    loading?: boolean;
  }

  let { onaction, loading = false }: Props = $props();
</script>
```

### State Management

- Use `$state()` for local component state
- Use `$derived()` for computed values
- Use `$effect()` for side effects (focus, scroll, DOM manipulation)
- Never use Svelte 4 stores — all reactivity through runes

### Event Callbacks

Pass callbacks as props with `on` prefix (not Svelte 4 `dispatch`):

```svelte
<UrlForm onshorten={handleShorten} {loading} />
<UrlList {urls} onclear={handleClear} />
```

### ExplanationBlock Usage

```svelte
<ExplanationBlock
  title={t('explanations.{concept}.title')}
  content={t('explanations.{concept}.content')}
  defaultOpen={true}  <!-- only for the first/primary explanation -->
/>
```

---

## Service Layer Pattern

Each topic gets a service file in `$lib/services/` that handles:

1. **Browser storage** — `localStorage` for persistent data, `sessionStorage` for ephemeral/simulation data
2. **Business logic** — encoding, validation, transformation
3. **API calls** — with client-side fallback when `VITE_API_URL` is not set

### Storage service template

```typescript
export interface StoredItem {
  // domain fields
  id: number;
  createdAt: number;
}

const STORAGE_KEY = '{topic}-data';
const COUNTER_KEY = '{topic}-counter';

function readAll(): Record<string, StoredItem> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, StoredItem>): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function nextId(): number {
  if (typeof localStorage === 'undefined') return 1;
  const current = parseInt(localStorage.getItem(COUNTER_KEY) ?? '0', 10);
  const next = current + 1;
  localStorage.setItem(COUNTER_KEY, String(next));
  return next;
}
```

Always guard `localStorage`/`sessionStorage` access with `typeof` check for SSR safety.

---

## Styling Conventions

### CSS Variables (from `app.css`)

| Variable | Value | Usage |
|----------|-------|-------|
| `--bg-primary` | `#0d1117` | Page background |
| `--bg-secondary` | `#161b22` | Cards, terminals, panels |
| `--bg-tertiary` | `#21262d` | Hover states, nested elements |
| `--bg-card` | `#1c2128` | Card backgrounds |
| `--border` | `#30363d` | Default borders |
| `--text-primary` | `#e6edf3` | Headings, primary text |
| `--text-secondary` | `#8b949e` | Body text, descriptions |
| `--text-muted` | `#6e7681` | Labels, hints, timestamps |
| `--accent` | `#58a6ff` | Links, focus states |
| `--green` | `#3fb950` | Success, prompts, positive |
| `--red` | `#f85149` | Errors, destructive |
| `--yellow` | `#d29922` | Warnings, active states |
| `--purple` | `#bc8cff` | Section title accents |
| `--font-mono` | JetBrains Mono | Code, terminal, inputs, titles |
| `--font-sans` | Inter | Body text, descriptions |

### Page header pattern

```svelte
<header class="page-header">
  <h1 class="page-title">
    <span class="title-accent">&gt;</span> {t('{topic}.title')}
  </h1>
  <p class="page-subtitle">{t('{topic}.subtitle')}</p>
</header>
```

The `>` prompt accent uses `var(--green)`. Section titles use `#` with `var(--purple)`.

### Typography scale

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Page title | mono | `clamp(1.5rem, 4vw, 2rem)` | 700 |
| Section title | mono | `1.25rem` | 600 |
| Body text | sans | `0.875rem` | 400 |
| Subtitle | sans | `0.9375rem` | 400 |
| Code/terminal | mono | `0.8125rem` | 400 |
| Labels/hints | mono | `0.75rem` | 400-600 |

### Component styling

- Scoped `<style>` blocks only — no global styles except `app.css`
- Use `var()` for all colors, fonts, radii, and transitions
- Mobile breakpoint at `640px`
- Cards: `bg-card` background, `border` border, `radius-lg` corners
- Hover: `bg-tertiary` background, `border-hover` border, `translateY(-2px)` lift
- Focus-within: `border-color: var(--accent)`

---

## i18n Structure

Every new topic adds keys to both `en.json` and `pt.json`:

```json
{
  "{topicCamelCase}": {
    "title": "...",
    "subtitle": "...",
    // UI labels
  },
  "explanations": {
    "{concept1}": { "title": "...", "content": "..." },
    "{concept2}": { "title": "...", "content": "..." }
  }
}
```

Content translations should be natural — not literal word-for-word. Adapt idioms and structure for Portuguese readers.

---

## Homepage Integration

Each new topic gets a card on the homepage under "Live Tech Examples":

```svelte
<a href="/{topic-slug}" class="example-card">
  <div class="card-icon">{emoji}</div>
  <div class="card-content">
    <h3>{t('home.{topicCamelCase}')}</h3>
    <p>{t('home.{topicCamelCase}Description')}</p>
  </div>
  <div class="card-arrow">→</div>
</a>
```

Add corresponding keys to `home.*` in both translation files.

---

## Backend Pattern (when needed)

The backend is stateless — it performs computation only, not persistence.

### Module structure

- One module per topic: `{Topic}Module` imported by `AppModule`
- One controller, one service per module
- DTOs with `class-validator` decorators for request validation
- Response DTOs as plain classes (shape only, no decorators)

### API conventions

| Convention | Value |
|------------|-------|
| Global prefix | `/api` |
| URL pattern | `/api/{topic-plural}/{action}` |
| Validation | `ValidationPipe` with `whitelist: true`, `transform: true` |
| CORS | configurable via `FRONTEND_URL` env var |

### Vercel deployment

The backend runs as a serverless function via `api/index.ts` with lazy NestJS bootstrap. Each new module is automatically available — just import it in `AppModule`.

---

## Simulation Page Pattern (optional)

If the topic involves a process (like redirects, request flows), create a simulation page at `/{topic-slug}/[param]/+page.svelte` that:

1. Shows step-by-step animated phases with delays
2. Uses typed phase states (`type Phase = 'step1' | 'step2' | ...`)
3. Visualizes cache/lookup behavior with color-coded steps (green = hit, yellow = active, red = error)
4. Includes countdown before final action
5. Displays an HTTP badge or protocol indicator

---

## References Section

Every post **must** include a references section at the bottom of the page, listing the sources, documentation, and further reading that support the concepts covered.

### Implementation

Add a dedicated `ExplanationBlock` as the very last block on the page (after "System Design Overview") with `defaultOpen={false}`:

```svelte
<ExplanationBlock
  title={t('explanations.{topic}References.title')}
  content={t('explanations.{topic}References.content')}
/>
```

### Translation keys

```json
{
  "explanations": {
    "{topic}References": {
      "title": "References & Further Reading",
      "content": "..."
    }
  }
}
```

### Content format

Use numbered entries with bold titles linking to the source, followed by a short description of what the reader will find there:

```
**1. [Title](https://...)** — Brief description of relevance.

**2. [Title](https://...)** — Brief description of relevance.
```

### What to include

- Official documentation for libraries and tools used (e.g., Sqids, Redis, DynamoDB)
- RFCs or specs for protocols referenced (e.g., RFC 7231 for HTTP 302)
- Seminal papers or blog posts that introduced the concepts (e.g., consistent hashing, Snowflake IDs)
- Related system design case studies or architecture posts
- Academic references when discussing algorithmic trade-offs (e.g., birthday paradox probability)

### Example (URL shortener)

```json
{
  "title": "References & Further Reading",
  "content": "**1. Sqids (formerly Hashids)** — https://sqids.org — Library used for ID obfuscation with base62 encoding.\n\n**2. RFC 7231 §6.4.3 — 302 Found** — https://datatracker.ietf.org/doc/html/rfc7231#section-6.4.3 — HTTP specification for temporary redirects.\n\n**3. Birthday Problem (Wikipedia)** — https://en.wikipedia.org/wiki/Birthday_problem — Mathematical foundation for understanding collision probability in hash-based systems.\n\n**4. DynamoDB Developer Guide** — https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ — AWS documentation for the key-value store discussed in the storage section.\n\n**5. Apache Cassandra Architecture** — https://cassandra.apache.org/doc/latest/cassandra/architecture/ — Documentation on consistent hashing and wide-column storage.\n\n**6. Twitter Snowflake** — https://blog.twitter.com/engineering/en_us/a/2010/announcing-snowflake — Distributed ID generation at scale, referenced as a production counter alternative."
}
```

---

## Checklist for New Topics

- [ ] Create `routes/{topic-slug}/+page.svelte` with header + form + explanation blocks
- [ ] Create topic-specific components in `lib/components/`
- [ ] Create service(s) in `lib/services/` with localStorage/sessionStorage persistence
- [ ] Add translation keys to `en.json` and `pt.json` (both UI and explanation content)
- [ ] Add homepage card with emoji, title, and description
- [ ] Add simulation/visualization page if applicable
- [ ] Add backend module if server-side computation is needed
- [ ] First explanation block uses `defaultOpen={true}`
- [ ] Second-to-last explanation block is "System Design Overview"
- [ ] Last explanation block is "References & Further Reading"
- [ ] Update `docs/CHANGELOG.md`
- [ ] Update `docs/frontend-architecture.md` and `docs/backend-architecture.md` if structure changes
