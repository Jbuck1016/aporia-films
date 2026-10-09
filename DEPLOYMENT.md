# Deployment

- Website: https://aporia-films.vercel.app
- Source repository: https://github.com/Jbuck1016/aporia-films
- Vercel dashboard: https://vercel.com/jbuck1016s-projects/aporia-films
- Production branch: `main`. Every push to `main` deploys automatically.
- The production address opens without sign-in. Unique per-deployment URLs sit behind Vercel's default deployment protection.

## How it is served

`vercel.json` serves the `public/` folder as static files, with no install and no build step. Clean URLs are on, so `public/projects/index.html` is served at `/projects` (likewise `/about` and `/contact`). See `DECISIONS.md` for why.

## Still needed from the founders

All text in `site.json` and `films.json` is sample copy and must be replaced. Also needed: real film stills, founder photos, confirmed email addresses and socials, and a domain if one is planned.
