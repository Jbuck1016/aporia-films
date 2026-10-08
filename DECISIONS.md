# Decisions

## Stack: plain static HTML, CSS and JavaScript (October 2026 rebuild)

The previous draft was a hand-written Node script (`build.mjs` plus `content.mjs`) that pasted strings together into static HTML in `dist/`. It had no framework, no components and no real reuse, so keeping a build step added a layer between the founders and their content without giving anything back. The rebuild is plain static files in `public/`, served by Vercel exactly as they are, with no install and no build. Films come from one file, `public/films.json`, and the editable About and Contact text comes from `public/site.json`. To add a film, Andy and Javi add one JSON entry and drop one image into `public/assets/films/`. Nothing else has to change, nothing can fail to compile, and the page they see locally is byte-for-byte the page that goes live. The old design, the build script and the generated `dist/` folder were deleted. `vercel.json` now serves `public/` directly and redirects the old `/projects/`, `/about/` and `/contact/` URLs to the matching sections.

## Smaller calls

- **Grain texture.** `Grain Background.png` is a light, large-format texture with a big triangle printed in it. Tiled as it is, that triangle repeats across the page. `assets/grain.jpg` is a crop of its speckled area, inverted so the specks read light on the dark ground, and sits at 5% opacity in screen blend.
- **Dim label colour.** `#5c5c58` on `#0b0b0b` is about 2.9:1 contrast, below the 4.5:1 needed. It is only used for decorative, screen-reader-hidden indices (card numbers, partner 01/02). Every label people actually need to read uses `#9a9a94` (about 6.9:1).
- **H1.** The page's single H1 is the hand-lettered wordmark image (alt text "Aporia Films"), because the spec reserves the wordmark for the hero. The H1 still carries `font-stretch: 112%` and weight 300 for its fallback text.
- **Hero mark.** The mark is inline SVG traced from `Transparent - White outline.png`. Its top-right corner is a separate cube (as in `Broken.png`) that detaches during the intro and stays as the scroll-to-projects button.
