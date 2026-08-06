#!/usr/bin/env bash
# Frontend build script inside frontend directory
set -o errexit

echo "==> Installing dependencies..."
npm install

echo "==> Granting executable permissions to build binaries..."
chmod -R +x node_modules/.bin || true

echo "==> Building Vite React app..."
npm run build

mkdir -p dist
