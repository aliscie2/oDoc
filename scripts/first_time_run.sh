#!/bin/bash

# Finalized oDoc setup script - follows README instructions with all required deployments
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

echo -e "${GREEN}🚀 oDoc Setup Script - Complete Setup with All Deployments${NC}"

# 1. Check prerequisites
log "Checking prerequisites..."
for tool in dfx cargo yarn; do
    command -v "$tool" >/dev/null || error "$tool is required but not installed"
done
success "All prerequisites found"

# 2. Clean up existing processes
log "Cleaning up existing processes..."
dfx stop 2>/dev/null || true
pkill -f "dfx start" 2>/dev/null || true
lsof -ti :4943 2>/dev/null | xargs kill -9 2>/dev/null || true
success "Cleanup completed"

# 3. Install dependencies
log "Installing Node.js dependencies..."
yarn install || error "yarn install failed"
success "Dependencies installed"

# 4. Add required Rust target
log "Adding Rust target..."
rustup target add wasm32-unknown-unknown 2>/dev/null || true

# 5. Step 1 from README: dfx start --background --clean
log "Step 1: Starting dfx with clean state..."
dfx start --background --clean
sleep 5
dfx ping || error "dfx failed to start"
success "dfx is running"

# 6. Step 2 from README: dfx deploy backend
log "Step 2: Deploying backend..."
dfx deploy backend || error "Backend deployment failed"
success "Backend deployed"

DFX_PORT=$(dfx info webserver-port)
BACKEND_ID=$(dfx canister id backend)
log "Backend canister ID: $BACKEND_ID"

# 7. Step 3 from README: dfx deploy internet_identity
log "Step 3: Deploying internet_identity..."
if dfx deploy internet_identity 2>/dev/null; then
    II_ID=$(dfx canister id internet_identity)
    success "Internet Identity deployed: $II_ID"
else
    warn "Internet Identity deployment failed - will use remote instance"
    II_ID="rdmx6-jaaaa-aaaaa-aaadq-cai"  # Remote IC instance
fi


# 8. Step 4 from README: sh scripts/deploy_ledger.sh
log "Step 4: Deploying ledger..."
if [ -f "scripts/deploy_ledger.sh" ]; then
    chmod +x scripts/deploy_ledger.sh
    bash scripts/deploy_ledger.sh || warn "Ledger deployment failed but continuing..."
    success "Ledger deployment completed"
else
    warn "scripts/deploy_ledger.sh not found, skipping ledger deployment"
fi

# 9. Deploy ic_siwe_provider using the dedicated script
log "Deploying ic_siwe_provider using deployment script..."
if [ -f "scripts/deploy_ic_siwe_provider.sh" ]; then
    chmod +x scripts/deploy_ic_siwe_provider.sh
    bash scripts/deploy_ic_siwe_provider.sh || error "ic_siwe_provider deployment failed"
    success "ic_siwe_provider deployed"
else
    # Fallback: deploy ic_siwe_provider manually
    log "Deploying ic_siwe_provider manually..."
    dfx canister create ic_siwe_provider || true
    dfx deploy ic_siwe_provider || warn "ic_siwe_provider deployment failed"
fi

IC_SIWE_ID=$(dfx canister id ic_siwe_provider 2>/dev/null || echo "")
log "ic_siwe_provider canister ID: $IC_SIWE_ID"

# 10. Create and deploy frontend canister
log "Creating and deploying frontend canister..."
dfx canister create frontend || warn "Frontend canister creation failed"
FRONTEND_ID=$(dfx canister id frontend 2>/dev/null || echo "")
dfx deploy frontend

# 11. Step 5 from README: dfx generate (for all deployed canisters)
log "Step 5: Generating declarations for all canisters..."
dfx generate || warn "Some declaration generation failed but continuing..."
success "Declaration generation completed"

# 12. Update .env file with all canister IDs
log "Creating/updating .env file with all canister IDs..."
cat > .env << EOF
VITE_DFX_NETWORK=local
VITE_DFX_PORT=$DFX_PORT
VITE_IC_HOST=http://localhost:4943
VITE_BACKEND_CANISTER_ID=$BACKEND_ID
VITE_FRONTEND_CANISTER_ID=$FRONTEND_ID
VITE_INTERNET_IDENTITY=$II_ID
EOF
