#!/bin/bash

# Script to run end-to-end tests locally
set -e

echo "🚀 Starting local E2E test environment..."

# Start DFX in background
echo "📦 Starting DFX..."
dfx start --background --host 127.0.0.1:4943

# Deploy canisters
echo "🔧 Deploying canisters..."
dfx deploy internet_identity || echo "II deployment failed"
sh scripts/first_time_run.sh
sh scripts/deploy_ledger.sh
sh scripts/set_env.sh
dfx deploy backend

# Build frontend
echo "🏗️  Building frontend..."
yarn build

# Start preview server in background
echo "🌐 Starting preview server..."
yarn preview --port 4173 --host 0.0.0.0 &
PREVIEW_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
timeout 60 bash -c 'until curl -f http://localhost:4173; do sleep 2; done'

# Run Playwright tests
echo "🎭 Running Playwright tests..."
PLAYWRIGHT_BASE_URL=http://localhost:4173 VITE_DFX_NETWORK=local yarn playwright test

# Cleanup
echo "🧹 Cleaning up..."
kill $PREVIEW_PID 2>/dev/null || true
dfx stop

echo "✅ E2E tests completed!"