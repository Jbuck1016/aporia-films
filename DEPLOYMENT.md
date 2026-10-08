# Deployment

- Website: https://aporia-films.vercel.app
- Private source repository: https://github.com/Jbuck1016/aporia-films
- Vercel dashboard: https://vercel.com/jbuck1016s-projects/aporia-films
- Vercel project: `prj_8Z3t7Ry8PClmfLWNXUxyuvDKfgHt`
- Team: `team_ZhZBoEFZCzzBMdXywePmisVC`
- Production branch: `main`. Every push to `main` deploys automatically.
- The production address opens without sign-in. Unique per-deployment URLs sit behind Vercel's default deployment protection.

## How it is served

`vercel.json` serves the `public/` folder as static files, with no install and no build step. It also redirects the old `/projects/`, `/about/` and `/contact/` addresses to the matching sections of the homepage. See `DECISIONS.md` for why.

## Still needed from the founders

The studio introduction, the About story and final headline, real films (stills, synopses, credits, links), real contact email addresses, and a domain if one is planned.
