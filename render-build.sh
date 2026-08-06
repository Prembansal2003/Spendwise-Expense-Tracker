#!/usr/bin/env bash
# Render official monorepo build script for SpendWise Frontend
set -o errexit

echo "==> Installing frontend dependencies..."
npm --prefix frontend install

echo "==> Granting executable permissions to build binaries..."
chmod -R +x frontend/node_modules/.bin || true

echo "==> Building Vite React app..."
npm --prefix frontend run build

echo "==> Preparing dist output directory..."
mkdir -p dist
cp -r frontend/dist/* dist/

echo "==> Frontend build completed successfully!"
