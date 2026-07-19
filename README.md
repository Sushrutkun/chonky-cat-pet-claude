# chonky-cat-pet-claude

A chonky orange tabby cat pet page. Plain static HTML/CSS/JS, no build step —
plays a sprite-sheet animation and lets you switch between states (idle,
running, waving, jumping, waiting, failed, review), plus an interactive
16-direction look compass.

## Run it

Just open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Files

- `index.html` / `style.css` / `script.js` — the page
- `public/pet/spritesheet.webp` — animation atlas (8 cols x 11 rows; rows 9-10 are single-frame look poses)
- `public/pet/pet.json` — pet manifest
- `public/pet/look-directions.png` — look-direction reference sheet (design reference, not used by the page)
