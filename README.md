# URL Shortener Techblog

A techblog by Raphael Sasso featuring interactive System Design examples. The first example is a fully functional URL shortener with educational explanations about base62 encoding, database sharding, caching strategies, and HTTP redirect semantics.

## Tech Stack

- **Frontend**: SvelteKit 2 + Svelte 5 (runes) + TypeScript
- **Backend**: NestJS 11 + TypeScript
- **Deployment**: Vercel (adapter-vercel + serverless functions)
- **i18n**: English and Portuguese with auto-detection

## Project Structure

```
├── frontend/          SvelteKit application
│   └── src/
│       ├── routes/    Pages (home, url-shortener, redirect)
│       ├── lib/       Components, services, i18n
│       └── app.css    Global dark terminal theme
├── backend/           NestJS API (stateless URL hashing)
│   └── src/
│       └── url-shortener/  Feature module (controller, service, DTOs)
└── package.json       npm workspaces root
```

## Getting Started

```bash
# Install dependencies
npm install

# Run both frontend and backend in development
npm run dev

# Or run them separately
npm run dev:frontend    # http://localhost:5173
npm run dev:backend     # http://localhost:3000
```

## Deploying to Vercel

This monorepo deploys as two separate Vercel projects from the same repository:

### Frontend
- **Root Directory**: `frontend`
- **Framework Preset**: SvelteKit
- **Environment Variable**: `VITE_API_URL` = your backend Vercel URL

### Backend
- **Root Directory**: `backend`
- **Framework Preset**: Other
- The `vercel.json` in `backend/` handles routing to the serverless function

The frontend works fully standalone (client-side hashing) when `VITE_API_URL` is not set.
