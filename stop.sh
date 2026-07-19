#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "Stopping floating overlay (Electron)..."
pkill -f "desktop-overlay" 2>/dev/null || true

echo "Stopping Chonky Cat server (Docker)..."
docker compose down

echo "Chonky Cat is stopped."
