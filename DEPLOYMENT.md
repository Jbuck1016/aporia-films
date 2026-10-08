# Deployment and handoff

- Website: https://aporia-films.vercel.app
- Private source repository: https://github.com/Jbuck1016/aporia-films
- Vercel dashboard: https://vercel.com/jbuck1016s-projects/aporia-films
- Vercel project: `prj_8Z3t7Ry8PClmfLWNXUxyuvDKfgHt`
- Team: `team_ZhZBoEFZCzzBMdXywePmisVC`
- GitHub repository connection verified in Vercel project settings: `Jbuck1016/aporia-films`.
- Production branch: `main`.
- The main production address, `https://aporia-films.vercel.app`, opens without sign-in (verified HTTP 200 with the actual website content). Unique deployment URLs redirect unauthenticated visitors to Vercel sign-in. Vercel's default protection settings were preserved.
- Automatic deployment was verified by pushing commit `4f859ae436e447308f0464a78fb7e4d3ddc51eca` to GitHub `main`: Vercel created a READY production deployment from that exact commit with source `git` and assigned the main website address.

## Content still needed

Approved company introduction/about text; movie titles, images, descriptions and optional credits; contact email addresses; and any intended project card destinations. Three card placeholders and two email placeholders are intentional. No invented films, biographies, addresses, or contact destinations are present.

## Verification

The site now has one continuous homepage with Home, Projects, About and Contact in that order. The sticky navigation links point to native fragment IDs within that document. The former `/projects/`, `/about/` and `/contact/` documents redirect to matching homepage sections and include fallback links.

Local verification for this revision covers ordinary scrolling through all four sections, all navigation links, unobscured anchor positions below the sticky header, current-section indication, the three legacy URL redirects, a single H1 and valid heading hierarchy, unique section IDs, local asset references, and desktop (1280px) and narrow-phone (320px) layouts without horizontal overflow. The stylesheet disables smooth scrolling for reduced-motion preferences. The logo, company content, project placeholders and pending emails are unchanged. No film or email destinations have been invented.

The connected GitHub workflow previously reached READY from a push to `main`; subsequent revisions use that same workflow. The owning chat verifies the matching deployment and live homepage after pushing.

GitHub collaboration invitations have not been sent; Andy and Javi's GitHub usernames are still needed. Repository collaborators can propose changes through pull requests. Vercel access for protected previews is managed separately in its dashboard.

The implementation owner is Codex chat `01a11cf0-fc63-77f2-9143-d8410bbe919b`. Local source is the `outputs/aporia-films-site` directory in that chat workspace. Vercel is the only deployed hosting provider. An earlier Sites registration was left unpublished when the user chose Vercel.
