#!/bin/bash
set -euo pipefail

echo "=== Automation Blog — Local Setup ==="

if ! command -v pnpm &> /dev/null; then
  echo "Installing pnpm..."
  corepack enable
  corepack prepare pnpm@9.15.4 --activate
fi

echo "Installing dependencies..."
pnpm install

echo "Starting PostgreSQL via Docker..."
docker compose -f docker/docker-compose.dev.yml up -d

echo "Waiting for PostgreSQL..."
until docker compose -f docker/docker-compose.dev.yml exec postgres pg_isready -U strapi 2>/dev/null; do
  sleep 1
done

echo ""
echo "=== Setup complete ==="
echo "Start Strapi:  pnpm dev:cms"
echo "Start Astro:   pnpm dev:web"
echo "Strapi Admin:  http://localhost:1337/admin"
echo "Astro Dev:     http://localhost:4321"
