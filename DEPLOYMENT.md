# Deployment

- Website: https://www.aporia-films.com (aporia-films.com redirects here; https://aporia-films.vercel.app still works)
- **Coming-soon gate (on since October 2026):** `middleware.js` shows a plain, unbranded "Coming soon" page on every path of aporia-films.com and www.aporia-films.com, while https://aporia-films.vercel.app keeps serving the real site for previewing copy changes. To launch, delete `middleware.js` and push to `main`; no DNS or dashboard changes are needed.
- Domain: registered at GoDaddy (Javi's account). DNS: A record @ points to Vercel, CNAME www points to @. Email (Microsoft 365) records live there too; do not change nameservers.
- Source repository: https://github.com/Jbuck1016/aporia-films
- Vercel dashboard: https://vercel.com/jbuck1016s-projects/aporia-films
- Production branch: `main`. Every push to `main` deploys automatically.
- The production address opens without sign-in. Unique per-deployment URLs sit behind Vercel's default deployment protection.

## How it is served

`vercel.json` serves the `public/` folder as static files, with no install and no build step. Clean URLs are on, so `public/projects/index.html` is served at `/projects` (likewise `/about` and `/contact`). See `DECISIONS.md` for why.

## Still needed from the founders

All text in `site.json` and `films.json` is sample copy and must be replaced. Also needed: real film stills, founder photos, confirmed email addresses and socials, and a domain if one is planned.
