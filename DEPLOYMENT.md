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

Both the initial deployment and the GitHub-triggered deployment reached READY. Live Home, Projects, About and Contact each returned HTTP 200 and their expected titles, both with authenticated checks and through the public production address. Live logo and stylesheet hashes match the local files. Local checks cover navigation, page titles/headings, active-page indication, local asset references, image loading, exact original-logo file integrity, keyboard access to the skip link, mobile layouts at 320px and 390px, and the three-column desktop project layout at 1280px. Tested mobile pages had no horizontal overflow. There are no film links or email links until real destinations are supplied.

GitHub collaboration invitations have not been sent; Andy and Javi's GitHub usernames are still needed. Repository collaborators can propose changes through pull requests. Vercel access for protected previews is managed separately in its dashboard.

The implementation owner is Codex chat `01a11cf0-fc63-77f2-9143-d8410bbe919b`. Local source is the `outputs/aporia-films-site` directory in that chat workspace. Vercel is the only deployed hosting provider. An earlier Sites registration was left unpublished when the user chose Vercel.
