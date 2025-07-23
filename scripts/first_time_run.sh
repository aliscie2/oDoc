#!/bin/bash

# First-time setup script for oDoc project - Core deployment only
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

echo -e "${GREEN}🚀 oDoc First-Time Core Setup${NC}"

# Check prerequisites
for tool in dfx cargo yarn; do
    command -v "$tool" >/dev/null || error "$tool is required but not installed"
done
rustup target add wasm32-unknown-unknown 2>/dev/null || true

# Install dependencies
yarn install || error "yarn install failed"

# Clean start
dfx killall 2>/dev/null || true
dfx stop 2>/dev/null || true
dfx start --background --clean  --port=4943
sleep 3
dfx ping || error "dfx failed to start"

# Create all canisters
dfx canister create --all || error "Canister creation failed"

# Deploy core canisters
dfx deploy backend || error "Backend deployment failed"
dfx deploy internet_identity || error "Internet Identity deployment failed"

success "Core deployment completed"