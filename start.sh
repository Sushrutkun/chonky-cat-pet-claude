#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "Starting Chonky Cat server (Docker)..."
docker compose up -d --build

echo "Starting floating overlay (Electron)..."
cd desktop-overlay
if [ ! -d node_modules ]; then
  npm install
fi

nohup npm start > /tmp/chonky-cat-overlay.log 2>&1 &
disown

echo "Chonky Cat is running. Look for it in the bottom-right corner of your screen."
echo "Run ./stop.sh to stop it, or use the tray menu."
