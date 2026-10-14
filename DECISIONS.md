# Decisions

## Stack: plain static HTML, CSS and JavaScript (October 2026 rebuild)

The previous draft was a hand-written Node script (`build.mjs` plus `content.mjs`) that pasted strings together into static HTML in `dist/`. It had no framework, no components and no real reuse, so keeping a build step added a layer between the founders and their content without giving anything back. The rebuild is plain static files in `public/`, served by Vercel exactly as they are, with no install and no build. Films come from one file, `public/films.json`, and the editable About and Contact text comes from `public/site.json`. To add a film, Andy and Javi add one JSON entry and drop one image into `public/assets/films/`. Nothing else has to change, nothing can fail to compile, and the page they see locally is byte-for-byte the page that goes live. The old design, the build script and the generated `dist/` folder were deleted. `vercel.json` serves `public/` directly. (The old `/projects/`, `/about/` and `/contact/` redirects were later replaced by real section pages, as described below.)

## Section pages alongside the scrolling home (October 2026)

Home stays a single scrolling page because it is the first impression: the intro, a few featured films, and short versions of About and Contact. Each of those sections now also has a full page (`/projects`, `/about`, `/contact`). These carry what doesn't fit on home: every film with status filters, the long story and founder bios, and a contact form. They also give each part of the studio a clean, shareable URL. All four pages read the same `films.json` and `site.json`, and each founder appears once, in the `founders` array, so names and emails are never duplicated. With no build step, the nav and footer are defined once in `app.js` (`renderChrome`) and written into every page when it loads. Each HTML file keeps a plain static nav only as a no-JavaScript fallback.

How the nav behaves on each page:
- **On home (`/`):** links are in-page anchors (`#home`, `#projects`, `#about`, `#contact`). They smooth-scroll, and the highlight follows whichever section is in view.
- **On a section page:** links go back into home (`/#home`, `/#projects`, `/#about`, `/#contact`). The current page's own link points at itself, is marked `aria-current="page"` and is highlighted. Arriving on home this way lands on the section under the sticky nav, re-aligned after the JSON content renders.
- **Brand mark:** always goes to `/`.
- **Film deep links:** home uses `/#projects/<slug>`, and `/projects` uses `/projects#<slug>`. Both open the film's panel on load.
- **Hiding until ready:** section pages keep their content hidden until the JSON has rendered (with a 3s fallback). Without this, the page jumped as text arrived (layout shift around 0.2). Home doesn't need it because its hero reserves space for the intro line.
- **Clean URLs:** `vercel.json` uses `cleanUrls` with `trailingSlash: false`, so `public/projects/index.html` is served at `/projects`.

## Coming-soon gate on the domain (October 2026)

Once the domain was connected, the founders wanted it to show only a plain "Coming soon" page while they keep editing copy on the vercel.app address. Both addresses are served by the same Vercel project, so instead of detaching the domain (and redoing the DNS hookup at launch), `middleware.js` checks the address a visitor used. On aporia-films.com or www it returns a self-contained, unbranded page on every path (no site icon, `noindex`, not cached), and on any other address it lets the request through to `public/` untouched. Launching is deleting that one file. This is the only server-side code in the project; it needs no install or build. The gate was removed at launch (October 2026).

## Visual identity (October 2026)

Chosen by the founders over three rounds of side-by-side options (logo, type, colour, texture, opening animation).

- **Palette: Nitrate.** Cool charcoal ground `#1b1e1e` with one accent, the faded cyan of old film stock (`#8fb5ad`). The accent is used sparingly: the active menu link, the tagline, film status and the small section labels. Because the mottled texture lightens parts of the background, secondary text (`#d0d6d3`), labels (`#c5cac9`) and the accent (`#b5cec9`) are lighter than the palette's swatches: they pass 4.5:1 on 90% of the background and stay near 4:1 on the very lightest patches. Main text passes everywhere.
- **Type: Didone.** Bodoni Moda for the name, headings, menu and founder names; Hanken Grotesk for body text and the small uppercase labels. Both come from Google Fonts. The hand-lettered wordmark was dropped because its loose marker letters clashed with set type; the name is now typeset in Bodoni capitals, letter-spaced like a title card, and the H1 on Home is that text.
- **Home logo: the designer's sketch, refined.** `assets/mark-hero.webp` starts from `Logo Only - Sketch.png`, warped onto the exact geometry of the mark. The pencil hatching at the inner top crease and the bottom crease was smoothed out, the dark side was given a soft, even tone like the other two sides, and the uneven painted outline was replaced by one consistent, slightly wobbly charcoal line on every edge. Its greys are then mapped onto the site's tones. It is always the full triangle (the earlier floating-cube version and its scroll button were removed).
- **Small logo: `assets/mark.svg`.** The designer's three-tone "Clean" mark, which the handbook recommends for small sizes, drawn as a vector with the full triangle, tip included. Its black side is lifted to a dark grey (`#444847`) so all three sides read on the charcoal. Used in the menu bar and footer.
- **Tab icons.** `favicon.svg`, `favicon.ico`, `assets/favicon-32.png` and `apple-touch-icon.png` put the same mark on a small square in the ground colour, so it reads on both light and dark browser tabs.
- **Texture: mottled + grain.** Chosen from fifteen options. Two layers sit behind all content: `assets/mottle.jpg`, soft, large patches of light and dark like an aged film base (a seamless tile shown 900px wide, 35% opacity), and `assets/grain-fine.png`, an even film-grain tile (12% opacity). The earlier speckle, cropped from `Grain Background.png`, repeated in visible blotches and looked accidental.
- **Opening animation: drawn by hand.** The play triangle appears alone, then wobbly double pencil lines grow outward from it along every edge of the mark, nearest first. The finished logo fills in beneath them, the lines fade, and the triangle sinks back to become the space inside the mark. Then the name and the rest of the page come in. It runs once per browser session, never under reduced motion, and any click or Escape skips it. It is drawn on a `<canvas>` over the logo image; `MARK` in `app.js` records where the image sits in the mark's coordinate space, so the lines land exactly on its edges.
- **Link preview.** `assets/og.jpg` shows the logo and name in the new style.

## Smaller calls

- **Dim label colour.** `#5c6664` on `#1b1e1e` is below the 4.5:1 needed. It is only used for decorative, screen-reader-hidden indices (card numbers, partner 01/02). Every label people actually need to read uses `#c5cac9`.
