# chonky-cat-pet-claude

A chonky orange tabby cat pet page. Plain static HTML/CSS/JS, no build step —
plays a sprite-sheet animation and lets you switch between states (idle,
running, waving, jumping, waiting, failed, review), plus an interactive
16-direction look compass.

Also installable as a **Claude Code plugin**: a floating, always-on-top
desktop cat that sits in the bottom-right corner of your screen and waves
whenever Claude finishes responding.

## Run the page standalone

Just open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Floating desktop avatar

An **Electron** app (`desktop-overlay/`) renders the cat as a frameless,
transparent, always-on-top window pinned to the bottom-right corner of your
screen, and serves the page itself (no external server needed). It adds a
menu-bar tray icon (🐱) with Show/Hide, Reset position, a Size submenu
(5 presets), and Quit.

```bash
./start.sh   # launches the floating cat
./stop.sh    # stops it
```

## Install as a Claude Code plugin

```
/plugin marketplace add Sushrutkun/chonky-cat-pet-claude
/plugin install chonky-cat-pet@chonky-cat-pet-claude
```

Then just tell Claude things like "start the cat", "make it bigger", or
"stop the cat" — the bundled `chonky-cat-pet` skill handles it. Once
running, the cat waves automatically every time a Claude Code turn finishes
(via the plugin's `Stop` hook hitting the overlay's local control server).

No marketplace needed for personal use: cloning this repo into
`~/.claude/skills/chonky-cat-pet` loads it automatically on your next
Claude Code session, with no install step.

## Files

- `index.html` / `style.css` / `script.js` — the page (supports a
  `?widget=1` mode: transparent background, sprite only, resizable via a
  `--widget-scale` CSS variable, reacts to `pet-react`/`pet-set-scale`
  events from the overlay)
- `desktop-overlay/` — Electron app: serves the page itself on
  `localhost:8420`, exposes `POST /react` and `POST /size` control
  endpoints, and displays it as a floating desktop widget
- `start.sh` / `stop.sh` — start/stop the overlay
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` — plugin
  manifest and marketplace listing
- `hooks/hooks.json` — `Stop` hook that pings the overlay to play the wave
  animation when a turn finishes
- `skills/chonky-cat-pet/SKILL.md` — the start/stop/resize skill
- `public/pet/spritesheet.webp` — animation atlas (8 cols x 11 rows; rows 9-10 are single-frame look poses)
- `public/pet/pet.json` — pet manifest
- `public/pet/look-directions.png` — look-direction reference sheet (design reference, not used by the page)
