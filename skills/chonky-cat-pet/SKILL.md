---
name: chonky-cat-pet
description: Start, stop, or resize the Chonky Cat floating desktop pet. Use when the user asks to start/launch/show the cat, stop/quit/hide it, or make it bigger/smaller/change its size.
---

# Chonky Cat Pet

A floating, always-on-top desktop cat that sits in the bottom-right corner
of the screen and waves whenever a Claude Code turn finishes (via the
plugin's `Stop` hook).

## Starting the cat

Run the plugin's start script:

```bash
"${CLAUDE_PLUGIN_ROOT}/start.sh"
```

This installs dependencies on first run (only if `desktop-overlay/node_modules`
is missing) and launches the Electron overlay in the background. It's safe
to run again if the cat is already running — the app uses a single-instance
lock and will just no-op.

## Stopping the cat

```bash
"${CLAUDE_PLUGIN_ROOT}/stop.sh"
```

## Resizing the cat

The cat has 5 size presets: `small`, `medium`, `large` (default), `xl`, `xxl`.
Map the user's request (e.g. "make it bigger", "tiny", "huge") to the closest
preset, then call the running overlay's local control server:

```bash
curl -s -X POST http://localhost:8420/size -H 'Content-Type: application/json' -d '{"preset":"<preset>"}'
```

This only works while the cat is running (`start.sh` has been run). If the
request fails to connect, tell the user to start the cat first.
