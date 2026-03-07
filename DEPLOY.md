# Deploy Subconscious Survey

Get your project live in a few steps.

## 1. Push your code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/subconscious-survey.git
git push -u origin main
```

## 2. Create a Supabase project (Auth + Database)

1. Go to [supabase.com](https://supabase.com) → **Start your project** → New project.
2. Note:
   - **Project URL** → use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key (Settings → API) → use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (Settings → API) → use as `SUPABASE_SERVICE_ROLE_KEY`
3. **Database**: In Supabase, go to **Settings → Database**. Copy the **Connection string** (URI). Use it as `DATABASE_URL` (replace `[YOUR-PASSWORD]` with your DB password).

## 3. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → Import your GitHub repo.
2. **Environment variables** (add these in Vercel project → Settings → Environment Variables):

   | Name                         | Value                    | Notes                    |
   |-----------------------------|--------------------------|--------------------------|
   | `DATABASE_URL`              | `postgresql://...`       | From Supabase (step 2)  |
   | `NEXT_PUBLIC_SUPABASE_URL`  | `https://xxx.supabase.co`| From Supabase            |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...`             | From Supabase (anon)     |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...`                | From Supabase (service_role) |

3. **Deploy**: Click **Deploy**. The build runs `prisma generate && prisma migrate deploy && next build` — your production database gets its tables on first deploy (as long as `DATABASE_URL` is set).

## 4. Open your app

**Migrations run automatically during the Vercel build.** To open the app:  
In Vercel project → Settings → Environment Variables, ensure `DATABASE_URL` is set. Then run locally **pointing at production DB** (danger: only if you’re sure):

Use the Vercel URL (e.g. `https://subconscious-survey.vercel.app`). Register and log in to see the dashboard.

---

## Optional: Redis + Passive Intelligence worker

- **Redis** is only needed for “Passive Intelligence” studies (background jobs).
- Without Redis, the app and dashboard work; creating a Passive study will save it as “queued” but jobs won’t run until Redis (and the worker) are set up.
- To enable it:
  1. Add a Redis instance (e.g. [Upstash](https://upstash.com) or Redis Cloud). For Upstash, get host, port, password.
  2. In Vercel, add: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`.
  3. Run the worker somewhere that has network access to Redis (e.g. Railway, Render, or a small VM), with the same env vars + `DATABASE_URL`, and run: `npm run worker:passive` (or `ts-node worker/passive-intel-worker.ts`).

---

## Checklist

- [ ] Code on GitHub
- [ ] Supabase project created (URL, anon key, service_role key, DB URL)
- [ ] Vercel project created and all 4 env vars set
- [ ] Deploy succeeds (migrations run automatically)
- [ ] App opens and you can register / log in
