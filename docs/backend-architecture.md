# Backend Architecture

## Tech Stack

| Area | Technology |
|------|------------|
| Framework | NestJS 11 |
| HTTP Platform | Express (via `@nestjs/platform-express`) |
| Language | TypeScript 5 |
| Validation | `class-validator` + `class-transformer` |
| ID Encoding | `sqids` (base62 alphabet) |
| Deployment | Vercel Serverless Functions (`@vercel/node`) |

## Project Structure

```
backend/
├── api/
│   └── index.ts                  # Vercel serverless entry point
├── src/
│   ├── main.ts                   # Local dev entry point
│   ├── app.module.ts             # Root NestJS module
│   └── url-shortener/
│       ├── url-shortener.module.ts
│       ├── url-shortener.controller.ts
│       ├── url-shortener.service.ts
│       └── dto/
│           ├── create-url.dto.ts
│           └── url-response.dto.ts
├── vercel.json                   # Vercel deployment config
├── nest-cli.json
├── tsconfig.json
└── tsconfig.build.json
```

## Module Structure

```
AppModule
  └── UrlShortenerModule
        ├── UrlShortenerController
        └── UrlShortenerService
```

`AppModule` is the root module and imports only `UrlShortenerModule`. The architecture follows NestJS single-responsibility conventions with one feature module per domain.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/urls/shorten` | Encode a numeric ID into a short code |

### POST /api/urls/shorten

**Request body:**

```json
{
  "url": "https://example.com",
  "id": 1
}
```

**Response:**

```json
{
  "shortCode": "abCdEf",
  "originalUrl": "https://example.com"
}
```

The backend is stateless — it only performs ID-to-shortcode encoding. All persistence is handled client-side in the browser.

## Service: UrlShortenerService

The service wraps the Sqids library for bidirectional encoding:

- **Constructor**: Initializes Sqids with a base62 alphabet (`a-z`, `A-Z`, `0-9`) and `minLength: 6`
- **`encode(id: number)`**: Encodes a single integer into a Sqids string, truncated to max 7 characters
- **`decode(shortCode: string)`**: Decodes a short code back to the original integer (available but not exposed via controller)

### Why Sqids (Hashids)?

Sqids provides non-sequential, obfuscated short codes from sequential IDs. This gives:

- **No collisions**: Monotonic IDs guarantee uniqueness (avoids the birthday paradox)
- **Obfuscation**: Users cannot infer the total count or predict next codes
- **Compact output**: Base62 encoding yields ~3.5 trillion combinations in 7 characters

## DTOs and Validation

### CreateUrlDto

| Field | Type | Validators |
|-------|------|------------|
| `url` | `string` | `@IsNotEmpty()`, `@IsUrl()` |
| `id` | `number` | `@IsInt()`, `@Min(1)` |

### UrlResponseDto

| Field | Type |
|-------|------|
| `shortCode` | `string` |
| `originalUrl` | `string` |

Plain class with no validation decorators (response shape only).

The global `ValidationPipe` is configured with `whitelist: true` (strips unknown properties) and `transform: true` (enables type coercion from `class-transformer`).

## Configuration

| Setting | Local (`main.ts`) | Vercel (`api/index.ts`) |
|---------|-------------------|-------------------------|
| CORS origin | `FRONTEND_URL` or `http://localhost:5173` | `FRONTEND_URL` or `*` |
| CORS methods | `GET`, `POST` | `GET`, `POST` |
| Global prefix | `api` | `api` |
| Port | `PORT` env or `3000` | N/A (serverless) |

Environment variables (documented in `.env.example`):

- `PORT` — local dev server port
- `FRONTEND_URL` — allowed CORS origin

## Vercel Deployment

### Entry Point (`api/index.ts`)

The serverless handler follows a lazy bootstrap pattern:

1. A shared Express instance is created at module level
2. On first request, `bootstrap()` creates the NestJS app using `ExpressAdapter` with that shared instance, configures CORS/prefix/validation, and calls `app.init()` (no `listen()`)
3. Subsequent warm invocations skip bootstrap and reuse the existing app
4. The default-exported `handler(req, res)` pipes Vercel's request/response through Express

### vercel.json

```json
{
  "version": 2,
  "builds": [
    { "src": "api/index.ts", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api(.*)", "dest": "api/index.ts" }
  ]
}
```

- **Build**: Compiles `api/index.ts` with `@vercel/node`
- **Routing**: All paths starting with `/api` are forwarded to the serverless function
- **Root directory**: Must be set to `backend` in Vercel project settings (monorepo)

### Architecture Diagram

```
Local development:
  Node.js → main.ts → Express → NestJS → :3000

Vercel production:
  Request /api/* → vercel.json route
    → api/index.ts handler(req, res)
      → bootstrap() on cold start
      → Express(req, res) → NestJS pipeline
```
