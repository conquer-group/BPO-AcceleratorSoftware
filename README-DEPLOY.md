# Deploying Conquer BPO Accelerator

This is a Next.js app. Follow these steps in order — each one feeds credentials into the next.

## 1. Supabase (database + accounts) — ~10 min

1. Go to supabase.com → New project. Save the database password somewhere safe.
2. Once it's created: **Project Settings → API** — copy the "Project URL", "anon public" key, and "service_role" key. You'll paste these into Vercel later.
3. **SQL Editor → New query** — paste the entire contents of `sql/schema.sql` from this project and click Run. This creates your tables and security rules.

## 2. Stripe (billing) — ~10 min

1. Go to dashboard.stripe.com → create your account (test mode is on by default, which is good for now).
2. **Product catalog → Add product** — name it "Conquer BPO Accelerator". Add two prices: one recurring monthly, one recurring yearly. Copy each price's ID (starts with `price_...`).
3. Leave the webhook step for after you deploy (step 4) — Stripe needs your live URL first.

## 3. Push this code to GitHub

1. Create a new empty repository on GitHub.
2. From this folder: `git init && git add . && git commit -m "initial commit"`, then follow GitHub's instructions to push.

## 4. Deploy on Vercel — ~5 min

1. Go to vercel.com → New Project → import the GitHub repo you just created.
2. Before deploying, add these Environment Variables (from `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`
   - `ANTHROPIC_API_KEY` (from console.anthropic.com)
   - `NEXT_PUBLIC_SITE_URL` — set this to your future subdomain, e.g. `https://bpo.conquergroupllc.com`
   - Leave `STRIPE_WEBHOOK_SECRET` blank for now — added in the next step.
3. Click Deploy. You'll get a temporary `*.vercel.app` URL.

## 5. Connect your subdomain

1. In Vercel: **Project → Settings → Domains** → add `bpo.conquergroupllc.com` (use your real domain).
2. Vercel shows you a CNAME record to add. Go to your domain's DNS settings (wherever you manage conquergroupllc.com — GoDaddy, Namecheap, Cloudflare, etc.) and add that CNAME record.
3. Wait for it to verify (a few minutes to a few hours depending on your DNS provider). Once verified, update `NEXT_PUBLIC_SITE_URL` in Vercel's environment variables to match, and redeploy.

## 6. Finish Stripe webhook setup

1. In Stripe: **Developers → Webhooks → Add endpoint**. URL: `https://bpo.conquergroupllc.com/api/stripe-webhook`.
2. Select these events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
3. Copy the "Signing secret" (starts with `whsec_...`) and add it to Vercel as `STRIPE_WEBHOOK_SECRET`. Redeploy once more so it takes effect.

## 7. Test it end to end

1. Visit your subdomain → Sign up with a test email → Subscribe (use Stripe's test card `4242 4242 4242 4242`, any future date, any CVC).
2. You should land back on `/dashboard` with the full app unlocked.
3. Check Supabase's Table Editor → `subscriptions` table → your row should show `status: active`.

## Going live for real payments

Everything above works in Stripe's test mode. When you're ready to accept real cards: in Stripe, toggle to **Live mode**, recreate the product/prices there (test and live are separate), update the four Stripe environment variables in Vercel with the live values, and redo the webhook step (test and live webhooks are separate too).

## Costs at this scale

- Supabase free tier: fine to start (500MB database, 50k monthly active users)
- Vercel free tier: fine to start (hobby projects; upgrade to Pro ~$20/mo if you want a team account or higher limits)
- Stripe: no monthly fee, ~2.9% + 30¢ per transaction
- Anthropic API: pay-per-use for proposal generation, billed to your Anthropic account
