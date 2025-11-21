### AI Coder Copilot — Frontend-only (Supabase + Gemini)

A minimal full-stack experience without a custom backend server. The app is a React (Vite) frontend that uses:
- Supabase Auth for user sign-in (email/password + optional OAuth) and Supabase Postgres for persistence
- Supabase Row Level Security to ensure per-user privacy of history
- Google Gemini API for real code generation (client-side)
- Prism-based syntax highlighting
- Responsive, dark black-purple theme

Why no backend? The latest requirement asked for “no backend needed.” We therefore use only managed services (Supabase + Gemini) and run all logic in the client. If you prefer a traditional backend, you can add one later, but this repo demonstrates the requested approach.

### Features
- Sign in/up and sign out with Supabase Auth
- Prompt input and language selector (Python, JavaScript, TypeScript, C++, Java)
- Code generation powered by Gemini (`gemini-1.5-flash`) — real network calls
- Copy-to-clipboard
- Saved history in Supabase with per-user privacy via RLS
- Paginated history (10 per page, newest first)
- Account page with basic profile info
- Fully responsive and themed UI

### Tech Stack
- React 19 + Vite + TypeScript
- Supabase JS v2 (auth + Postgres DB)
- Google Generative AI SDK (`@google/generative-ai`)
- Routing: `react-router-dom`
- Syntax highlighting: `prism-react-renderer` (Dracula theme)

### Getting Started

#### 1) Create a Supabase project
- Go to https://supabase.com and create a new project.
- In Authentication → Providers, you can enable Email/Password and optionally GitHub/Google (set callback URL to your dev URL like `http://localhost:5173` and your production domain later).
- Copy your Project URL and anon public API key.

#### 2) Configure environment variables
Create a `.env` file in the project root based on `.env.example`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Notes:
- For local development, these are fine to be in `.env` because Vite uses them only in dev/compiled client. For production, protect your Gemini API key with HTTP referrer restrictions in Google Cloud Console (APIs & Services → Credentials → API keys) so that only your domain can call it.

#### 3) Run the database migration (SQL)
Open Supabase web dashboard → SQL Editor and run the SQL in `supabase/migrations/0001_init.sql`.
This will create tables and policies:
- `languages(id, name unique)`
- `profiles(user_id PK/FK → auth.users.id)`
- `generations(id, user_id FK, language text, language_id FK, prompt text, code text, created_at)`
- RLS policies so each user can only read/insert their own generations
- Indexes for pagination and filtering
- Seed rows for `languages`

ER diagram (also included at the top of the SQL file):

```
 auth.users (Supabase)
    | 1
    |--< profiles (user_id PK/FK)
    |
    |--< generations (id PK, user_id FK, language_id FK?, language text, prompt, code, created_at)

 languages (id PK, name unique)
```

#### 4) Install and run

```
npm install
npm run dev
```

Open http://localhost:5173

#### 5) Sign in and generate code
- Create an account on the Auth page and sign in.
- Enter a prompt, choose a language, click Generate. The app calls Gemini and displays the result with code highlighting, and saves it to Supabase linked to your user.
- Visit the History page to see paginated results, newest first.

### Deployment
- Frontend: Vercel, Netlify, or any static host. Build with `npm run build` and deploy the `dist` folder.
- Environment variables: set the same `VITE_*` vars in your host. For Gemini key, set HTTP referrer restrictions to your domain.
- Supabase: already hosted. Ensure your site domain is allowed in Auth redirect URLs.

### API Surfaces (Client-only)
Instead of a custom backend API, the app uses:
- Supabase PostgREST (via `@supabase/supabase-js`) to insert and read `generations`, with RLS enforcing per-user access.
- Gemini SDK to call `gemini-1.5-flash` directly from the browser. The prompt is prefixed with system guidance and returns only code.

### Data Modeling and Rationale
- `auth.users` (managed by Supabase) for accounts.
- `profiles` related 1:1 to `auth.users` for profile extensibility.
- `languages` stores normalized language names with unique constraint; referenced optionally by `generations.language_id`.
- `generations` stores each generation with `prompt`, `language` (cached label for convenience), optional `language_id`, `code`, and `created_at`. `user_id` ties the row to the author.
- Indexes: `generations(user_id, created_at desc)` supports fast pagination per user; `generations(language_id)` helps future filtering by language.
- RLS: Users can only select/insert their own `generations`. This removes the need for a custom backend to enforce access control.

### Complexity Answers
- Time complexity of paginated retrieval: O(k) for fetching a page of size k after using the index to position by `(user_id, created_at)`. Counting total is O(1) amortized with stats but in practice can scan index; we keep it acceptable and only do it once per visit.
- Schema effect on performance and flexibility: Separating `languages` allows validation, deduplication, and efficient filters/joins; caching `language` as text in `generations` keeps simple reads without join. `user_id + created_at` index optimizes the main access pattern.
- Indexes usefulness: Critical for ordered pagination and filtering. Created `generations_user_created_idx` and `generations_language_idx`.

### Stable SDK Versions
- `@supabase/supabase-js@^2.48.0`
- `@google/generative-ai@^0.21.0`
- `react@^19.2.0`, `react-router-dom@^7.1.1`, `prism-react-renderer@^2.4.0`

### Notes on Security
- Exposing an API key in client code is sensitive. Use domain (HTTP referrer) restrictions on the Gemini API key and rotate if leaked. For stricter control, add a thin backend proxy later.
- Supabase RLS ensures users cannot read/write others’ data even if they tamper with client code.

### Video Demo (what to show)
Record a 2–3 minute clip showing:
1) Sign up or sign in
2) Enter a prompt and select a language, click Generate
3) Show the generated code, copy to clipboard
4) Verify the new row appears in Supabase table (optional) and the History page shows it with pagination

### Folder Structure
- `/src`
  - `/auth` — Auth provider
  - `/components` — Navbar, CodeBlock
  - `/lib` — Supabase and Gemini clients
  - `/pages` — Auth, Generator, History, Account
- `/supabase/migrations` — SQL migration(s)

### FAQ
- Can I add more languages? Insert into `languages` and they will appear automatically.
- Can I filter history by language? Add a `language` filter UI and include `.eq('language_id', selectedId)` in the query.
- Can I replace Gemini? Yes, swap `src/lib/gemini.ts` with another provider (OpenAI, etc.).
