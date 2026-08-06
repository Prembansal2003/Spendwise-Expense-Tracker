#!/usr/bin/env bash
# Frontend build script inside frontend directory
set -o errexit
npm install
npx vite build
mkdir -p dist
