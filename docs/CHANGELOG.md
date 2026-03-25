# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Added

- **Terminal autocomplete**: Ghost text suggestions appear as you type commands on the homepage terminal; press `Tab` to complete. A visual `tab` badge indicates when a suggestion is available.
- **Background effects upgrade**: Replaced per-pixel simplex noise with a multi-layered canvas scene featuring 6 flowing aurora orbs (radial gradients with `screen` blending), 60 floating particles with flicker, and a vignette overlay. Debounced resize handling.
- **`/rocambole` command**: New terminal command that prints an ASCII cat art.
- **Programmatic autofocus**: Input is focused on mount via `$effect` instead of the HTML `autofocus` attribute.
- **Keyboard handler on terminal div**: Added `onkeydown` alongside `onclick` to satisfy Svelte a11y rules for non-interactive elements with click events.

### Fixed

- **Vercel backend 404**: Replaced AWS Lambda-style handler (`event, context, callback`) in `api/index.ts` with a Vercel-compatible default export using standard `(req, res)` signature and `ExpressAdapter`. Removed dependency on `@codegenie/serverless-express` at runtime.
- **Vercel route matching**: Changed `vercel.json` route pattern from `/api/(.*)` to `/api(.*)` so requests to `/api` without a trailing path are also matched.
- **`cat about.md` scroll**: Added double `requestAnimationFrame` for scroll-after-render and an `onload` handler on the avatar image to trigger an additional scroll once the image finishes loading.
- **a11y autofocus warning**: Removed `autofocus` HTML attribute and replaced with programmatic focus via `$effect` to avoid Svelte's `a11y_autofocus` lint warning.
- **a11y click-events warning**: Added `onkeydown` handler to the terminal div to pair with the existing `onclick`, resolving the `a11y_click_events_have_key_events` lint warning.

### Changed

- **Rocambole ASCII art**: Updated from multi-line sitting cat to a minimal whisker-face cat art (`/\_/\` style).

---

## [0.1.0] — 2026-03-24

### Added

- **Monorepo structure**: npm workspaces with `frontend/` (SvelteKit) and `backend/` (NestJS) packages, managed from a root `package.json` with `concurrently`.
- **Homepage**: Interactive terminal interface with commands (`hello`, `cat about.md`, `/github`, `/linkedin`, `/rocambole`, `help`, `clear`), profile section with avatar and social links, animated gradient background.
- **URL shortener**: Full client-side URL shortening flow with incremental ID generation, Sqids encoding (base62, max 7 chars), localStorage persistence, and LRU cache simulation (sessionStorage).
- **Redirect simulation**: `/s/[code]` page with step-by-step animated status (cache check, hit/miss, lookup), 3-second countdown, and `window.location.href` navigation simulating HTTP 302.
- **Educational content**: Collapsible explanation blocks covering incremental ID + base62 + Sqids, birthday paradox prevention, storage sharding (DynamoDB, Cassandra), caching layers (Redis, Memcached), 301 vs 302 redirects, and overall system design.
- **Internationalization**: English and Portuguese translations with browser language detection, manual toggle in navigation, and localStorage persistence.
- **Backend API**: NestJS module with `POST /api/urls/shorten` endpoint, Sqids-based ID encoding service, DTO validation with `class-validator`.
- **Vercel deployment**: `@sveltejs/adapter-vercel` for frontend, `@vercel/node` serverless function for backend with lazy NestJS bootstrap.
- **Auto-https**: URL form automatically prepends `https://` if no protocol is provided.
- **Cache persistence**: LRU cache migrated from in-memory `Map` to sessionStorage to survive full-page navigation during redirect simulation.
- **Dark terminal theme**: GitHub-like dark palette with JetBrains Mono and Inter fonts, CSS custom properties, responsive layout.
