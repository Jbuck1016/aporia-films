# Brand tools

These scripts made the logo files in `public/assets/` (October 2026). The website doesn't use them; they are kept so the files can be remade, for example in different colours.

1. `refine_sketch.py` takes the designer's `Logo Only - Sketch.png` (in the Aporia Website project files) and makes the refined sketch: warped onto the mark's exact geometry, crease hatching removed, an even dark side and one consistent hand-drawn outline. It writes large PNGs to an output folder.
2. `make_brand.py` maps those greys onto the site's tones and writes `mark-hero.webp`, `mark.svg`, the tab icons and `grain-fine.png`.

They need Python with numpy, scipy, opencv-python and Pillow. The file paths at the top of each script point at the folders they were first run from; change them before running again. To change the logo colours, edit `G` and `T` (ground and text colours) at the top of `make_brand.py`.
