#!/bin/bash

# Environment setup script for oDoc project
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

echo -e "${GREEN}🔧 oDoc Environment Setup${NC}"

# Get current dfx port
DFX_PORT=$(dfx info webserver-port 2>/dev/null || echo "4943")

# Get canister IDs
II_ID=$(dfx canister id internet_identity 2>/dev/null || echo "")
BACKEND_ID=$(dfx canister id backend 2>/dev/null || echo "")
FRONTEND_ID=$(dfx canister id frontend 2>/dev/null || echo "")
IC_SIWE_ID=$(dfx canister id ic_siwe_provider 2>/dev/null || echo "")
POCKET_IC=$(which pocket-ic 2>/dev/null || echo "")

if [ -f ".env" ]; then
    log "Updating existing .env file..."
    
    # Update existing variables or add new ones
    grep -q "VITE_DFX_NETWORK=" .env && sed -i "s/VITE_DFX_NETWORK=.*/VITE_DFX_NETWORK=local/" .env || echo "VITE_DFX_NETWORK=local" >> .env
    grep -q "VITE_DFX_PORT=" .env && sed -i "s/VITE_DFX_PORT=.*/VITE_DFX_PORT=$DFX_PORT/" .env || echo "VITE_DFX_PORT=$DFX_PORT" >> .env
    grep -q "VITE_IC_HOST=" .env && sed -i "s|VITE_IC_HOST=.*|VITE_IC_HOST=http://localhost:$DFX_PORT|" .env || echo "VITE_IC_HOST=http://localhost:$DFX_PORT" >> .env
    
    # Update canister ID variables
    if [ -n "$II_ID" ]; then
        grep -q "VITE_INTERNET_IDENTITY=" .env && sed -i "s/VITE_INTERNET_IDENTITY=.*/VITE_INTERNET_IDENTITY=$II_ID/" .env || echo "VITE_INTERNET_IDENTITY=$II_ID" >> .env
    else
        warn "Internet Identity canister ID not found"
    fi
    
    if [ -n "$BACKEND_ID" ]; then
        grep -q "VITE_BACKEND_CANISTER_ID=" .env && sed -i "s/VITE_BACKEND_CANISTER_ID=.*/VITE_BACKEND_CANISTER_ID=$BACKEND_ID/" .env || echo "VITE_BACKEND_CANISTER_ID=$BACKEND_ID" >> .env
    else
        warn "Backend canister ID not found"
    fi
    
    if [ -n "$FRONTEND_ID" ]; then
        grep -q "VITE_FRONTEND_CANISTER_ID=" .env && sed -i "s/VITE_FRONTEND_CANISTER_ID=.*/VITE_FRONTEND_CANISTER_ID=$FRONTEND_ID/" .env || echo "VITE_FRONTEND_CANISTER_ID=$FRONTEND_ID" >> .env
    else
        warn "Frontend canister ID not found"
    fi
    
    if [ -n "$IC_SIWE_ID" ]; then
        grep -q "VITE_IC_SIWE_PROVIDER_ID=" .env && sed -i "s/VITE_IC_SIWE_PROVIDER_ID=.*/VITE_IC_SIWE_PROVIDER_ID=$IC_SIWE_ID/" .env || echo "VITE_IC_SIWE_PROVIDER_ID=$IC_SIWE_ID" >> .env
    fi
    
    if [ -n "$POCKET_IC" ]; then
        grep -q "POCKET_IC_BIN=" .env && sed -i "s|POCKET_IC_BIN=.*|POCKET_IC_BIN=$POCKET_IC|" .env || echo "POCKET_IC_BIN=$POCKET_IC" >> .env
    fi
    
else
    log "Creating new .env file..."
    
    # Create new .env file with all variables
    cat > .env <<EOF
VITE_DFX_NETWORK=local
VITE_DFX_PORT=$DFX_PORT
VITE_IC_HOST=http://localhost:$DFX_PORT
EOF

    # Add canister IDs if they exist
    if [ -n "$II_ID" ]; then
        echo "VITE_INTERNET_IDENTITY=$II_ID" >> .env
    else
        warn "Internet Identity canister ID not found"
    fi
    
    if [ -n "$BACKEND_ID" ]; then
        echo "VITE_BACKEND_CANISTER_ID=$BACKEND_ID" >> .env
    else
        warn "Backend canister ID not found"
    fi
    
    if [ -n "$FRONTEND_ID" ]; then
        echo "VITE_FRONTEND_CANISTER_ID=$FRONTEND_ID" >> .env
    else
        warn "Frontend canister ID not found"
    fi
    
    if [ -n "$IC_SIWE_ID" ]; then
        echo "VITE_IC_SIWE_PROVIDER_ID=$IC_SIWE_ID" >> .env
    fi
    
    if [ -n "$POCKET_IC" ]; then
        echo "POCKET_IC_BIN=$POCKET_IC" >> .env
    fi
fi

# Add DFX environment variables (auto-generated)
dfx generate --output-env .env 2>/dev/null || warn "Failed to generate additional dfx environment variables"

success ".env file updated successfully"

# Build frontend with all declarations available
log "Building frontend with all declarations..."
yarn vite build || error "Frontend build failed"
success "Frontend built successfully"

# Final verification and instructions
echo -e "\n${GREEN}✅ Setup Complete - All Canisters Deployed!${NC}"
echo ""
echo "🌐 Access URLs:"
if [ -n "$FRONTEND_ID" ]; then
    echo "Frontend: http://localhost:$DFX_PORT/?canisterId=$FRONTEND_ID"
    echo "Frontend: http://$FRONTEND_ID.localhost:$DFX_PORT/"
fi
echo "Backend:  http://localhost:$DFX_PORT/?canisterId=$BACKEND_ID"
echo "Internet Identity: http://localhost:$DFX_PORT/?canisterId=$II_ID"
if [ -n "$IC_SIWE_ID" ]; then
    echo "ic_siwe_provider: http://localhost:$DFX_PORT/?canisterId=$IC_SIWE_ID"
fi
echo ""
echo "📋 Environment variables set:"
echo "  Network: local"
echo "  DFX Port: $DFX_PORT"
echo "  IC Host: http://localhost:$DFX_PORT"
if [ -n "$BACKEND_ID" ]; then
    echo "  Backend: $BACKEND_ID"
fi
if [ -n "$FRONTEND_ID" ]; then
    echo "  Frontend: $FRONTEND_ID"
fi
if [ -n "$II_ID" ]; then
    echo "  Internet Identity: $II_ID"
fi
if [ -n "$IC_SIWE_ID" ]; then
    echo "  ic_siwe_provider: $IC_SIWE_ID"
fi
echo ""
echo "📋 Next steps (Step 6 from README):"
echo "  yarn run start                    # Start dev server"
echo "  open http://127.0.0.1:5173/   # Open the app (Step 7 from README)"
echo ""
echo "🛑 To stop:"
echo "  dfx stop                      # Stop dfx when done"
echo ""
echo "📝 All canister IDs have been saved to .env file"