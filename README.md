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

## Floating desktop avatar

Runs the cat as a small, always-on-top window pinned to the bottom-right
corner of your screen — a floating desktop pet. Two pieces work together:

- **Docker** serves the page (nginx, port 8420) — stoppable/restartable on
  its own with `docker compose up`/`down`.
- A small **Electron** app (`desktop-overlay/`) renders a frameless,
  transparent, always-on-top window that loads the page in `?widget=1`
  mode, and adds a menu-bar tray icon (🐱) with Show/Hide, Reset position,
  and Quit.

```bash
./start.sh   # builds/starts the Docker container + launches the overlay
./stop.sh    # stops the overlay and the container
```

Note: once loaded, the overlay runs from cached assets in its own process,
so `docker compose down` alone won't make the window disappear — use
`./stop.sh` (or Quit from the tray menu) to actually stop it.

## Files

- `index.html` / `style.css` / `script.js` — the page (supports a
  `?widget=1` mode: transparent background, sprite only, idle loop)
- `Dockerfile` / `docker-compose.yml` — serves the page via nginx on
  `localhost:8420`
- `desktop-overlay/` — Electron app that displays the page as a floating
  desktop widget
- `start.sh` / `stop.sh` — start/stop both pieces together
- `public/pet/spritesheet.webp` — animation atlas (8 cols x 11 rows; rows 9-10 are single-frame look poses)
- `public/pet/pet.json` — pet manifest
- `public/pet/look-directions.png` — look-direction reference sheet (design reference, not used by the page)
