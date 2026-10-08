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

## Smaller calls

- **Grain texture.** `Grain Background.png` is a light, large-format texture with a big triangle printed in it. Tiled as it is, that triangle repeats across the page. `assets/grain.jpg` is a crop of its speckled area, inverted so the specks read light on the dark ground, and sits at 5% opacity in screen blend.
- **Dim label colour.** `#5c5c58` on `#0b0b0b` is about 2.9:1 contrast, below the 4.5:1 needed. It is only used for decorative, screen-reader-hidden indices (card numbers, partner 01/02). Every label people actually need to read uses `#9a9a94` (about 6.9:1).
- **H1.** The page's single H1 is the hand-lettered wordmark image (alt text "Aporia Films"), because the spec reserves the wordmark for the hero. The H1 still carries `font-stretch: 112%` and weight 300 for its fallback text.
- **Hero mark.** The mark is inline SVG traced from `Transparent - White outline.png`. Its top-right corner is a separate cube (as in `Broken.png`) that detaches during the intro and stays as the scroll-to-projects button.
