#!/bin/bash
set -e
export DFX_WARNING=-mainnet_plaintext_identity

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKEND_ID="2nvlk-tyaaa-aaaal-ab5ya-cai"

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_backend_build() {
    local wasm_path="target/wasm32-unknown-unknown/release/backend.wasm"
    local wasm_gz_path="${wasm_path}.gz"
    
    # Check if wasm exists and is newer than source files
    if [[ -f "$wasm_gz_path" ]]; then
        local newest_src=$(find src/backend -name "*.rs" -newer "$wasm_gz_path" | head -1)
        if [[ -z "$newest_src" ]]; then
            log_info "Backend wasm is up to date, skipping build"
            return 0
        fi
    fi
    return 1
}

check_frontend_build() {
    # Check if build dir exists and is newer than src
    if [[ -d "build" ]]; then
        local newest_src=$(find src/frontend -newer build/index.html 2>/dev/null | head -1)
        if [[ -z "$newest_src" ]]; then
            log_info "Frontend build is up to date, skipping build"
            return 0
        fi
    fi
    return 1
}

deploy_backend() {
    log_info "Checking backend build..."
    
    local wasm_path="target/wasm32-unknown-unknown/release/backend.wasm"
    local wasm_gz_path="${wasm_path}.gz"
    
    # Only build if needed
    if ! check_backend_build; then
        log_info "Building backend..."
        if ! cargo build --target wasm32-unknown-unknown --release --package backend; then
            log_error "Backend build failed"
            return 1
        fi
        
        if [[ -f "$wasm_path" ]]; then
            log_info "Compressing backend wasm..."
            gzip -fk "$wasm_path"
        fi
    fi
    
    # Deploy
    log_info "Deploying backend..."
    if dfx canister install $BACKEND_ID --wasm "$wasm_gz_path" --mode upgrade --network ic; then
        log_info "✓ Backend deployed successfully"
        return 0
    fi
    
    log_error "Backend deployment failed"
    return 1
}

deploy_frontend() {
    local frontend_id
    if ! frontend_id=$(dfx canister id frontend --network ic 2>/dev/null); then
        log_info "No frontend canister found, skipping"
        return 0
    fi
    
    log_info "Checking frontend build..."
    
    # Only build if needed
    if ! check_frontend_build; then
        log_info "Building frontend..."
        if ! npm run build; then
            log_error "Frontend build failed"
            return 1
        fi
    fi
    
    # Deploy
    log_info "Deploying frontend..."
    if dfx deploy frontend --network ic; then
        log_info "✓ Frontend deployed successfully"
        return 0
    fi
    
    if dfx canister install frontend --mode upgrade --network ic; then
        log_info "✓ Frontend upgraded successfully"
        return 0
    fi
    
    log_error "Frontend deployment failed"
    return 1
}

force_rebuild() {
    log_warn "Force rebuilding everything..."
    rm -rf target/wasm32-unknown-unknown/release/backend.wasm*
    rm -rf build/
    deploy_backend
    deploy_frontend
}

check_deployments() {
    log_info "Verifying deployments..."
    
    local status=$(dfx canister status $BACKEND_ID --network ic)
    echo "Backend:" 
    echo "$status" | grep -E "(Status|Module hash)"
    
    if dfx canister call $BACKEND_ID whoami --network ic &>/dev/null; then
        log_info "✓ Backend is responding"
    else
        log_warn "Backend may not be functional"
    fi
}

main() {
    log_info "Smart Deploy - Only builds what changed"
    
    # Check for force flag
    if [[ "$1" == "--force" || "$1" == "-f" ]]; then
        force_rebuild
        check_deployments
        return
    fi
    
    local success=true
    
    if ! deploy_backend; then
        success=false
    fi
    
    if ! deploy_frontend; then
        success=false
    fi
    
    check_deployments
    
    if $success; then
        log_info "🎉 All deployments successful!"
    else
        log_error "💥 Some deployments failed"
        log_info "Try: sh scripts/deploy-main-net.sh --force"
        exit 1
    fi
}

main "$@"