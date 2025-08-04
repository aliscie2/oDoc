#!/bin/bash

# Environment setup script for oDoc project
set -e

# Colors and logging functions
GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

echo -e "${GREEN}🔧 oDoc Environment Setup${NC}"

# Get current settings
DFX_PORT=4943
get_canister_id() { dfx canister id "$1" 2>/dev/null || echo ""; }

# Get all canister IDs
II_ID=$(get_canister_id internet_identity)
BACKEND_ID=$(get_canister_id backend)
FRONTEND_ID=$(get_canister_id frontend)
IC_SIWE_ID=$(get_canister_id ic_siwe_provider)
LEDGER_ID=$(get_canister_id ckusdc_ledger)
POCKET_IC=$(which pocket-ic 2>/dev/null || echo "")

update_or_add_env() {
    local key="$1" value="$2"
    if grep -q "^$key=" .env 2>/dev/null; then
        # Update existing
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^$key=.*|$key=$value|" .env
        else
            sed -i "s|^$key=.*|$key=$value|" .env
        fi
    else
        # Add new
        echo "$key=$value" >> .env
    fi
}



# Create/update .env file
[ -f ".env" ] && log "Updating .env..." || log "Creating .env..."
touch .env

# Set core variables
update_or_add_env "VITE_DFX_NETWORK" "local"
update_or_add_env "VITE_DFX_PORT" "$DFX_PORT"
update_or_add_env "VITE_IC_HOST" "http://localhost:4943"

# Set canister IDs (with warnings for missing ones)
for var in "VITE_INTERNET_IDENTITY:$II_ID" "VITE_BACKEND_CANISTER_ID:$BACKEND_ID" \
           "VITE_FRONTEND_CANISTER_ID:$FRONTEND_ID" "VITE_IC_SIWE_PROVIDER_ID:$IC_SIWE_ID" \
           "VITE_CANISTER_ID_CKUSDC_LEDGER:$LEDGER_ID" \
           "POCKET_IC_BIN:$POCKET_IC"; do
    key="${var%:*}" value="${var#*:}"
    [ -n "$value" ] && update_or_add_env "$key" "$value" || warn "${key%_*} canister not found"
done

# Add dfx-generated variables
dfx generate --output-env .env.tmp 2>/dev/null || warn "Failed to generate dfx variables"
if [ -f ".env.tmp" ]; then
    while IFS='=' read -r key value; do
        [ -n "$key" ] && [ -n "$value" ] && update_or_add_env "$key" "$value"
    done < .env.tmp
    rm -f .env.tmp
fi

# Remove any duplicate lines (final safety check)
awk '!seen[$0]++' .env > .env.tmp && mv .env.tmp .env

success ".env file updated"

# Build frontend
# log "Building frontend..."
# yarn vite build && success "Frontend built" || warn "Frontend build failed"

# Show results
echo -e "\n${GREEN}✅ Environment Ready${NC}"
echo "🌐 Access URLs:"
[ -n "$FRONTEND_ID" ] && echo "Frontend: http://$FRONTEND_ID.localhost:$DFX_PORT/"
echo "Backend: http://localhost:$DFX_PORT/?canisterId=$BACKEND_ID"