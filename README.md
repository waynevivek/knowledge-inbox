# Personal Knowledge Inbox

A personal knowledge inbox built with Next.js 16 (App Router), TypeScript, Prisma, Neon Serverless Postgres, Better Auth (GitHub OAuth), and shadcn/ui.

## Local Development Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in the following variables in `.env`:

- `DATABASE_URL` / `DIRECT_URL`: Connection strings for your local/development Neon Postgres database (e.g., `neondb_dev`).
- `TEST_DATABASE_URL` / `TEST_DIRECT_URL`: Connection strings for your isolated test database (e.g., `neondb_test`). Must differ from `DATABASE_URL`.
- `BETTER_AUTH_SECRET`: Generate a 32-byte random secret with:
  ```bash
  openssl rand -base64 32
  ```
- `BETTER_AUTH_URL`: `http://localhost:3000` for local development.
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: From your local GitHub OAuth App (see below).
- `ALLOWED_EMAILS`: Comma-separated list of GitHub account email addresses allowed to sign in and create an account (e.g., `you@example.com`).

### 3. Create GitHub OAuth Apps (Local & Production)

GitHub OAuth Apps support a single Authorization callback URL per app, so create **two separate GitHub OAuth Apps** under **GitHub Settings → Developer settings → OAuth Apps → New OAuth App**:

#### Local Development OAuth App
- **Application name**: `Knowledge Inbox (Local)`
- **Homepage URL**: `http://localhost:3000`
- **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
- Copy the **Client ID** and generate a **Client secret**, then set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in your local `.env`.

#### Production OAuth App
- **Application name**: `Knowledge Inbox`
- **Homepage URL**: `https://knowledge-inbox-ruby.vercel.app`
- **Authorization callback URL**: `https://knowledge-inbox-ruby.vercel.app/api/auth/callback/github`
- Set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (`https://knowledge-inbox-ruby.vercel.app`), and `ALLOWED_EMAILS` in your Vercel Project Environment Variables (Production).
- *Note*: Vercel Preview deployments use dynamic `.vercel.app` URLs and will not match the single GitHub OAuth callback URL; login is expected to work on Local and Production only.

### 4. Apply database migrations & run

```bash
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Quality Gates

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```
