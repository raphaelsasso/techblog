# Frontend Architecture

## Tech Stack

| Area | Technology |
|------|------------|
| Framework | SvelteKit 2 |
| UI Library | Svelte 5 (runes) |
| Language | TypeScript 5 |
| Build Tool | Vite 7 |
| Adapter | `@sveltejs/adapter-vercel` |
| ID Encoding | `sqids` (client-side fallback) |

## Project Structure

```
frontend/
├── src/
│   ├── app.html                  # HTML shell
│   ├── app.css                   # Global styles, CSS variables, fonts
│   ├── app.d.ts                  # SvelteKit type declarations
│   ├── lib/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── GradientNoise.svelte
│   │   │   ├── UrlForm.svelte
│   │   │   ├── UrlList.svelte
│   │   │   ├── CacheVisualizer.svelte
│   │   │   └── ExplanationBlock.svelte
│   │   ├── i18n/                 # Internationalization
│   │   │   ├── en.json
│   │   │   ├── pt.json
│   │   │   ├── state.svelte.ts
│   │   │   └── index.ts
│   │   └── services/             # Business logic
│   │       ├── api.ts
│   │       ├── storage.ts
│   │       └── cache.ts
│   └── routes/
│       ├── +layout.svelte        # Global layout (nav, locale toggle)
│       ├── +page.svelte          # Homepage (interactive terminal)
│       ├── url-shortener/
│       │   └── +page.svelte      # URL shortener interface
│       └── s/[code]/
│           └── +page.svelte      # Redirect simulation page
└── static/
    └── raphael.jpg               # Profile photo
```

## Routing

| Route | Page | Purpose |
|-------|------|---------|
| `/` | `+page.svelte` | Homepage with interactive terminal and tech examples |
| `/url-shortener` | `url-shortener/+page.svelte` | URL shortener UI with educational content |
| `/s/[code]` | `s/[code]/+page.svelte` | Redirect simulation with cache visualization |

All routing is client-side. No `+page.server.ts` or server hooks are used.

## Components

### GradientNoise.svelte

Full-viewport canvas animation layering three effects:

1. **Aurora orbs** — 6 radial gradient blobs (blue, purple, green, amber, red, cyan) drifting on sinusoidal paths with pulsing radius, blended via `screen` compositing
2. **Floating particles** — 60 micro-dots rising upward with horizontal wobble and opacity flicker
3. **Vignette** — Radial darkening toward screen edges

Debounced resize handler reinitializes the scene on window resize.

### UrlForm.svelte

URL input form with:
- Auto-prepending `https://` if protocol is missing (`normalizeUrl`)
- Validation via `new URL()` constructor
- Loading spinner during submission
- Calls parent `onshorten` callback with normalized URL

### UrlList.svelte

Displays stored short URLs with copy-to-clipboard, visit link, access count, and creation date. Includes a clear-all action that resets both storage and cache stats.

### CacheVisualizer.svelte

Renders cache statistics (hits, misses, hit ratio) and lists current cache entries with their max size constraint.

### ExplanationBlock.svelte

Collapsible educational content block that renders markdown-like text (`**bold**`, `` `code` ``, lists) as HTML. Uses `$effect` for reactive open/closed state.

## Services

### api.ts

`shortenUrl(url)` orchestrates short code generation:

1. Calls `nextId()` from storage to get the next incremental ID
2. If `VITE_API_URL` is set: POSTs `{ url, id }` to the backend API
3. If no API URL (standalone mode): encodes locally with Sqids (base62 alphabet, min length 6, sliced to 7 chars)
4. Returns `{ id, shortCode, originalUrl }`

### storage.ts

localStorage persistence layer managing:

| Key | Data |
|-----|------|
| `url-shortener-data` | JSON map of `StoredUrl` records keyed by `shortCode` |
| `url-shortener-counter` | Monotonic integer for `nextId()` |

Provides `saveUrl`, `getUrl`, `getAllUrls`, `incrementAccess`, and `clearAll`.

### cache.ts

LRU-style cache simulation using sessionStorage:

| Key | Data |
|-----|------|
| `url-shortener-cache` | Serialized Map of cache entries (max 5) |
| `url-shortener-cache-stats` | `{ hits, misses }` counters |

sessionStorage is used instead of in-memory state so cache survives the full-page navigation triggered by redirect simulation (`window.location.href`).

## Internationalization (i18n)

- **Languages**: English (`en`) and Portuguese (`pt`)
- **Detection**: Checks `localStorage('locale')` first, then `navigator.language`, defaults to `en`
- **Switching**: Toggle button in the nav bar calls `setLocale()`, which updates the reactive `$state` and persists to localStorage
- **Lookup**: `t('key.path')` walks the nested translation JSON; missing keys return the key string as fallback
- **Module pattern**: `$state` is encapsulated in a class inside `state.svelte.ts` with exported getter/setter functions to comply with Svelte 5's module export rules

## URL Shortener Flow

```
User input → UrlForm (normalize + validate)
    → shortenUrl() in api.ts
        → nextId() from localStorage counter
        → POST to backend API (or Sqids fallback)
    → saveUrl() to localStorage
    → UrlList renders link as /s/{shortCode}

Visit /s/{code} → cache lookup (sessionStorage)
    → HIT: display cached URL
    → MISS: lookup in localStorage → cachePut()
    → incrementAccess()
    → 3-second countdown → window.location.href (simulated 302)
```

## Data Storage

All data lives in the browser. No server-side persistence.

| Storage | Purpose | Lifetime |
|---------|---------|----------|
| localStorage | URL records, ID counter, locale preference | Permanent (until cleared) |
| sessionStorage | LRU cache entries, hit/miss stats | Current browser session |

## UI/UX Features

- **Dark terminal theme**: GitHub-like dark palette with JetBrains Mono and Inter fonts
- **Interactive terminal**: Command-line interface on homepage with history, prompt, and output rendering
- **Tab autocomplete**: Ghost text suggestion with `Tab` key completion and visual `tab` badge
- **Terminal commands**: `hello`, `cat about.md`, `/github`, `/linkedin`, `/rocambole`, `help`, `clear`
- **Animated background**: Canvas-based aurora orbs with floating particles
- **Educational content**: Collapsible explanation blocks covering base62, birthday paradox, storage sharding, caching, and HTTP redirects
- **Responsive layout**: Sticky blurred nav bar, container-based content width
