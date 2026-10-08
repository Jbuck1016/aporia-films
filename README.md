# Aporia Films website

Review draft with four static pages: Home, Projects, About, Contact. This is a plain HTML/CSS site with a small Node.js page generator and no third-party dependencies.

## Editing

Edit `content.mjs` for the company text, logo asset path, partners, email addresses, and projects. Run `node build.mjs` to regenerate the four pages in `dist/`. Style tokens and responsive layout are in `dist/assets/styles.css`.

Place supplied assets in `dist/assets/`. Set `site.logo` to its root-relative path. Do not invent project credits, bios, contact information, or destinations. The project card component in `build.mjs` has no links until destinations are approved. Empty email values render plain text, never fake mail links.

## Current content status

Confirmed: Aporia Films is a film production company; Andy Arango and Javi Arango are Founding Partners.

Temporary neutral copy: “A film production company.” and “Let’s talk.” Three project cards explicitly show draft placeholders. Project titles, artwork, descriptions, credits, and contact email addresses are missing. About copy is intentionally limited to the confirmed company and partner facts.

Supplied logo: `Main Logo - Clean.png`, copied unchanged to `dist/assets/aporia-logo.png`. Original dimensions 5053 × 5052, RGBA with transparent background, 516,372 bytes. The light panel behind it is website styling, not an artwork edit. It preserves the dark edges and the original proportions. Only this explicitly supplied file was inspected and used.

## Hosting and ownership

Hosting provider: Vercel. The `vercel.json` file runs `node build.mjs` and serves `dist/`. The production branch is intended to be `main`. Once the GitHub integration is connected, pushing or merging to `main` creates a live deployment; pull requests receive review deployments. See `DEPLOYMENT.md` for the verified connection status and URLs.

This draft has `noindex, nofollow`; remove only when an intentional public launch is approved and content is complete. Vercel deployment protection is controlled in the project dashboard, independently of repository privacy.

## Preview and collaborate

1. Install Node.js if needed, clone the private repository, and create a branch for changes.
2. Edit `content.mjs`, place approved images in `dist/assets/`, and run `node build.mjs`.
3. Preview using any static web server. With Python installed: `python -m http.server 4173 --directory dist`, then visit `http://localhost:4173`.
4. Open a pull request and review the Vercel preview. Merge to `main` when the change is approved.

GitHub's browser editor can also change `content.mjs`; Vercel generates the HTML during its build. No CMS is required. Add Andy and Javi as repository collaborators once their GitHub usernames are known. Vercel project access or team membership may also be needed to see protected previews or manage deployments, depending on the account plan. No invitations have been sent.

The owning implementation chat is `01a11cf0-fc63-77f2-9143-d8410bbe919b`.

No analytics, forms, third-party scripts, or external fonts are included.
