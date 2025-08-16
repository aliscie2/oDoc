#!/bin/bash

# SCRIPT OVERVIEW
# Purpose: Comprehensive ICP deployment scanner across all DFX identities
# Goal: Find deployed canisters, check cycles health, identify security issues
# Scope: All identities, wallets, canisters, ICP balances

# INITIALIZATION & SETUP
# Security bypass: export DFX_WARNING=-mainnet_plaintext_identity
export DFX_WARNING=-mainnet_plaintext_identity

# Color definitions for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Thresholds
CRITICAL_THRESHOLD=50000000000    # 50B cycles - immediate danger
LOW_THRESHOLD=200000000000        # 200B cycles - warning level
WALLET_HIGH_THRESHOLD=1000000000000  # 1T cycles - needs redistribution

# UTILITY FUNCTIONS
print_header() {
    echo -e "\n${BOLD}${BLUE}╔$(printf '═%.0s' {1..60})╗"
    printf "║${BOLD}${BLUE}%-58s${BOLD}${BLUE}║\n" " $1"
    echo -e "╚$(printf '═%.0s' {1..60})╝${NC}"
}

print_subheader() {
    echo -e "\n${CYAN}┌$(printf '─%.0s' {1..45})┐"
    printf "│${CYAN} %-43s │\n" "$1"
    echo -e "└$(printf '─%.0s' {1..45})┘${NC}"
}

print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_critical() { echo -e "${RED}🚨 CRITICAL: $1${NC}"; }

# Parse numeric values from cycle strings
parse_cycles() {
    echo "$1" | grep -o '[0-9,_]\+' | tr -d ',_' | head -1 2>/dev/null || echo "0"
}

# Convert raw numbers to T/B/M format
format_cycles() {
    local num=$1
    if [ $num -ge 1000000000000 ]; then
        echo "$(echo "scale=1; $num/1000000000000" | bc)T"
    elif [ $num -ge 1000000000 ]; then
        echo "$(echo "scale=1; $num/1000000000" | bc)B"
    else
        echo "${num}M"
    fi
}

# Check if identity uses plaintext storage
check_identity_security() {
    local identity=$1
    local identity_dir="$HOME/.config/dfx/identity/$identity"
    if [ -f "$identity_dir/identity.pem" ]; then
        echo -e "${RED}🔓 INSECURE (plaintext)${NC}"
        return 1
    else
        echo -e "${GREEN}🔒 SECURE${NC}"
        return 0
    fi
}

# Parse ICP balance amount
parse_icp_amount() {
    echo "$1" | grep -o '[0-9]\+\.[0-9]\+' | head -1 2>/dev/null || echo "0"
}

# Check canister reachability
check_canister_reachable() {
    local canister_id=$1
    if dfx canister --network ic status "$canister_id" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

echo -e "${BOLD}${PURPLE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║               COMPLETE ICP DEPLOYMENT SCAN                ║"
echo "║              CHECKING ALL IDENTITIES                     ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# NETWORK VALIDATION
print_info "Testing IC mainnet connection..."
if dfx ping ic >/dev/null 2>&1; then
    print_success "IC mainnet connection OK"
else
    print_error "Cannot connect to IC mainnet - Script stopping"
    exit 1
fi

# Original identity backup - Store current identity to restore later
ORIGINAL_IDENTITY=$(dfx identity whoami)
echo -e "\nOriginal identity: $ORIGINAL_IDENTITY"

# BUILD & DEPLOYMENT DIAGNOSTICS
print_header "BUILD & DEPLOYMENT DIAGNOSTICS"

# Check for build artifacts and sizes
echo "Checking build artifacts and deployment readiness..."

# WASM file checks
echo ""
print_subheader "WASM FILES ANALYSIS"
WASM_FOUND=0
WASM_TOTAL_SIZE=0

# Check for WASM files in common locations
for wasm_dir in ".dfx/ic" ".dfx/local" "target/wasm32-unknown-unknown/release"; do
    if [ -d "$wasm_dir" ]; then
        echo "Checking WASM files in: $wasm_dir"
        
        find "$wasm_dir" -name "*.wasm" -type f 2>/dev/null | while read -r wasm_file; do
            if [ -f "$wasm_file" ]; then
                WASM_SIZE=$(stat -f%z "$wasm_file" 2>/dev/null || stat -c%s "$wasm_file" 2>/dev/null || echo "0")
                WASM_SIZE_MB=$(echo "scale=2; $WASM_SIZE/1024/1024" | bc -l 2>/dev/null || echo "0")
                WASM_FOUND=$((WASM_FOUND + 1))
                WASM_TOTAL_SIZE=$((WASM_TOTAL_SIZE + WASM_SIZE))
                
                printf "  %-40s %8s MB" "$(basename "$wasm_file")" "$WASM_SIZE_MB"
                
                # WASM size warnings
                if [ "$WASM_SIZE" -gt 2097152 ]; then  # 2MB
                    echo -e " ${RED}⚠️  Large WASM (>2MB)${NC}"
                elif [ "$WASM_SIZE" -gt 1048576 ]; then  # 1MB
                    echo -e " ${YELLOW}⚠️  Medium WASM (>1MB)${NC}"
                else
                    echo -e " ${GREEN}✅ OK${NC}"
                fi
            fi
        done
    fi
done

if [ $WASM_FOUND -eq 0 ]; then
    print_warning "No WASM files found - run 'dfx build' first"
else
    WASM_TOTAL_MB=$(echo "scale=2; $WASM_TOTAL_SIZE/1024/1024" | bc -l 2>/dev/null || echo "0")
    echo "Total WASM size: ${WASM_TOTAL_MB}MB across $WASM_FOUND files"
fi

# FRONTEND ASSETS ANALYSIS
echo ""
print_subheader "FRONTEND ASSETS ANALYSIS"

# Check common frontend build directories
FRONTEND_DIRS=("dist" "build" ".next" "out")
ASSETS_FOUND=0

for dir in "${FRONTEND_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        ASSETS_FOUND=1
        echo "Found frontend build directory: $dir"
        
        # Get total size
        if command -v du >/dev/null 2>&1; then
            TOTAL_SIZE=$(du -sh "$dir" 2>/dev/null | cut -f1)
            echo "  Total size: $TOTAL_SIZE"
        fi
        
        # Count files
        FILE_COUNT=$(find "$dir" -type f 2>/dev/null | wc -l | xargs)
        echo "  Total files: $FILE_COUNT"
        
        # Check for large files (>500KB)
        echo "  Large files (>500KB):"
        find "$dir" -type f -size +500k 2>/dev/null | while read -r large_file; do
            if command -v stat >/dev/null 2>&1; then
                FILE_SIZE=$(stat -f%z "$large_file" 2>/dev/null || stat -c%s "$large_file" 2>/dev/null || echo "0")
                FILE_SIZE_MB=$(echo "scale=2; $FILE_SIZE/1024/1024" | bc -l 2>/dev/null || echo "0")
                printf "    %-50s %8s MB" "$(basename "$large_file")" "$FILE_SIZE_MB"
                
                # File size warnings for deployment
                if [ "$FILE_SIZE" -gt 2097152 ]; then  # 2MB
                    echo -e " ${RED}🚨 Very Large (may cause timeout)${NC}"
                elif [ "$FILE_SIZE" -gt 1048576 ]; then  # 1MB
                    echo -e " ${YELLOW}⚠️  Large (watch for timeout)${NC}"
                else
                    echo -e " ${GREEN}✅ OK${NC}"
                fi
            fi
        done
        
        # Check for common problematic file types
        echo "  Asset type breakdown:"
        for ext in png jpg jpeg gif svg js css html wasm; do
            COUNT=$(find "$dir" -name "*.$ext" -type f 2>/dev/null | wc -l | xargs)
            if [ "$COUNT" -gt 0 ]; then
                TOTAL_EXT_SIZE=$(find "$dir" -name "*.$ext" -type f -exec stat -f%z {} + 2>/dev/null | awk '{sum+=$1} END {print sum/1024/1024}' 2>/dev/null || echo "0")
                printf "    %-10s: %3d files (%s MB)\n" "$ext" "$COUNT" "$TOTAL_EXT_SIZE"
            fi
        done
        
        break  # Use first found directory
    fi
done

if [ $ASSETS_FOUND -eq 0 ]; then
    print_warning "No frontend build directory found - run build command first"
fi

# DEPLOYMENT CONFIGURATION CHECKS
echo ""
print_subheader "DEPLOYMENT CONFIGURATION"

# Check dfx.json
if [ -f "dfx.json" ]; then
    echo "✅ dfx.json found"
    
    # Check for asset canister configuration
    if jq -e '.canisters | to_entries[] | select(.value.type == "assets")' dfx.json >/dev/null 2>&1; then
        echo "✅ Asset canister configured"
        
        # Check asset source directory
        ASSET_SOURCE=$(jq -r '.canisters | to_entries[] | select(.value.type == "assets") | .value.source[]?' dfx.json 2>/dev/null | head -1)
        if [ -n "$ASSET_SOURCE" ] && [ -d "$ASSET_SOURCE" ]; then
            echo "✅ Asset source directory exists: $ASSET_SOURCE"
        else
            print_warning "Asset source directory not found or not configured"
        fi
    fi
else
    print_error "dfx.json not found"
fi

# Check .ic-assets.json5 for security policy
if [ -f ".ic-assets.json5" ]; then
    echo "✅ .ic-assets.json5 found"
    if grep -q "disable_security_policy_warning" .ic-assets.json5 2>/dev/null; then
        echo "✅ Security policy warning disabled"
    fi
else
    print_warning ".ic-assets.json5 not found - may see security warnings"
    echo "  Create with: echo '{\"disable_security_policy_warning\": true}' > .ic-assets.json5"
fi

# DEPLOYMENT ENVIRONMENT CHECKS
echo ""
print_subheader "DEPLOYMENT ENVIRONMENT"

# Check environment variables that affect deployment
ENV_VARS=("DFX_ASSET_UPLOAD_TIMEOUT" "DFX_ASSET_BATCH_SIZE" "DFX_WARNING")
for var in "${ENV_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        echo "✅ $var = ${!var}"
    else
        case $var in
            "DFX_ASSET_UPLOAD_TIMEOUT")
                print_info "$var not set (default: 300s) - set higher for large assets"
                ;;
            "DFX_ASSET_BATCH_SIZE")
                print_info "$var not set (default: 30) - set lower for timeout issues"
                ;;
            "DFX_WARNING")
                print_info "$var not set - may see plaintext identity warnings"
                ;;
        esac
    fi
done

# DEPLOYMENT RECOMMENDATIONS
echo ""
print_subheader "DEPLOYMENT RECOMMENDATIONS"

# Analyze and provide recommendations
RECOMMENDATIONS=()

# Check for large assets
LARGE_ASSETS=$(find dist build .next out 2>/dev/null -type f -size +1M 2>/dev/null | wc -l | xargs)
if [ "$LARGE_ASSETS" -gt 0 ]; then
    RECOMMENDATIONS+=("Found $LARGE_ASSETS files >1MB - consider compression or CDN")
    RECOMMENDATIONS+=("Set DFX_ASSET_UPLOAD_TIMEOUT=600 for large assets")
    RECOMMENDATIONS+=("Set DFX_ASSET_BATCH_SIZE=5 to reduce timeout risk")
fi

# Check total asset size
for dir in dist build .next out; do
    if [ -d "$dir" ]; then
        TOTAL_SIZE_BYTES=$(find "$dir" -type f -exec stat -f%z {} + 2>/dev/null | awk '{sum+=$1} END {print sum}' 2>/dev/null || echo "0")
        if [ "$TOTAL_SIZE_BYTES" -gt 10485760 ]; then  # 10MB
            RECOMMENDATIONS+=("Total assets >10MB - expect longer deployment times")
        fi
        break
    fi
done

# Check for missing .ic-assets.json5
if [ ! -f ".ic-assets.json5" ]; then
    RECOMMENDATIONS+=("Create .ic-assets.json5 to suppress security warnings")
fi

# Output recommendations
if [ ${#RECOMMENDATIONS[@]} -gt 0 ]; then
    for rec in "${RECOMMENDATIONS[@]}"; do
        echo -e "${YELLOW}• $rec${NC}"
    done
else
    print_success "No deployment issues detected"
fi

# CANISTER DISCOVERY - Show all available canisters first
print_header "PROJECT CANISTERS OVERVIEW"

CANISTER_FILES=("./canister_ids.json" "./.dfx/ic/canister_ids.json" "./.dfx/local/canister_ids.json")
for CANISTER_FILE in "${CANISTER_FILES[@]}"; do
    if [ -f "$CANISTER_FILE" ]; then
        echo "Found canister configuration: $CANISTER_FILE"
        echo ""
        
        while IFS= read -r line; do
            NAME=$(echo "$line" | cut -d' ' -f1)
            CID=$(echo "$line" | cut -d' ' -f2)
            
            if [ -n "$CID" ] && [ "$CID" != "null" ] && [ "$CID" != "" ]; then
                printf "  ${BOLD}%-12s${NC} %s\n" "[$NAME]" "$CID"
                
                # Quick status check
                if dfx canister --network ic status "$CID" >/dev/null 2>&1; then
                    echo "    ✅ Deployed on IC mainnet"
                else
                    echo "    ❌ Not found on IC mainnet"
                fi
                
                if dfx canister --network local status "$CID" >/dev/null 2>&1; then
                    echo "    ✅ Deployed on local network"
                else
                    echo "    ❌ Not found on local network"
                fi
                echo ""
            fi
        done < <(jq -r 'to_entries[] | "\(.key) \(.value.ic // .value.local // "")"' "$CANISTER_FILE" 2>/dev/null || echo "")
        
        break
    fi
done

# IDENTITY DISCOVERY & SCANNING
IDENTITIES=$(dfx identity list)
TOTAL_IDENTITIES=$(echo "$IDENTITIES" | wc -l)

print_header "SCANNING $TOTAL_IDENTITIES IDENTITIES"

# GLOBAL AGGREGATION - Cross-identity totals
TOTAL_CANISTERS_ALL=0
TOTAL_CYCLES_ALL=0
TOTAL_ICP_ALL=0
IDENTITIES_WITH_WALLETS=0
IDENTITIES_WITH_CANISTERS=0
ALL_CRITICAL_CANISTERS=0
ALL_LOW_CANISTERS=0
INSECURE_IDENTITIES=0
UNREACHABLE_CANISTERS=0
RUNNING_CANISTERS=0
STOPPED_CANISTERS=0

# Store recommendations for final report
declare -a ICP_RECOMMENDATIONS
declare -a CYCLE_RECOMMENDATIONS
declare -a SECURITY_RECOMMENDATIONS
declare -a CRITICAL_ACTIONS

for IDENTITY in $IDENTITIES; do
    print_subheader "IDENTITY: $IDENTITY"
    
    # PER-IDENTITY DATA COLLECTION
    # Security check first
    echo -n "Security: "
    if ! check_identity_security "$IDENTITY"; then
        INSECURE_IDENTITIES=$((INSECURE_IDENTITIES + 1))
        SECURITY_RECOMMENDATIONS+=("Create secure identity to replace $IDENTITY: dfx identity new ${IDENTITY}-secure")
    fi
    
    # Switch to identity - Continue on errors (robust scanning)
    if ! dfx identity use "$IDENTITY" >/dev/null 2>&1; then
        print_error "Failed to switch to identity $IDENTITY"
        continue
    fi
    
    # Get principal and account ID
    if PRINCIPAL=$(dfx identity get-principal 2>/dev/null); then
        echo "Principal: $PRINCIPAL"
    else
        print_error "Cannot get principal for $IDENTITY"
        continue
    fi
    
    if ACCOUNT_ID=$(dfx ledger account-id --network ic 2>/dev/null); then
        echo "Account ID: $ACCOUNT_ID"
    else
        print_error "Cannot get account ID for $IDENTITY"
        continue
    fi
    
    # ICP BALANCE CHECK
    if ICP_BALANCE=$(dfx ledger --network ic balance 2>/dev/null); then
        echo "ICP Balance: $ICP_BALANCE"
        ICP_AMOUNT=$(parse_icp_amount "$ICP_BALANCE")
        TOTAL_ICP_ALL=$(echo "$TOTAL_ICP_ALL + $ICP_AMOUNT" | bc -l 2>/dev/null || echo "$TOTAL_ICP_ALL")
        
        # Flag unused ICP - Warning if > 0.1 ICP
        if (( $(echo "$ICP_AMOUNT > 0.1" | bc -l 2>/dev/null || echo 0) )); then
            print_warning "Has $ICP_AMOUNT ICP unused"
            ICP_RECOMMENDATIONS+=("Convert $ICP_AMOUNT ICP to cycles for $IDENTITY: dfx ledger --network ic create-canister --amount $ICP_AMOUNT")
        fi
    else
        echo "ICP Balance: Unable to fetch"
    fi
    
    # WALLET ANALYSIS - Check both IC and local networks
    IDENTITY_CYCLES=0
    
    # Check IC network wallet
    if WALLET_ID=$(dfx identity --network ic get-wallet 2>/dev/null); then
        IDENTITIES_WITH_WALLETS=$((IDENTITIES_WITH_WALLETS + 1))
        echo "IC Wallet ID: $WALLET_ID"
        
        if CYCLES_RAW=$(dfx wallet --network ic balance 2>/dev/null); then
            echo "IC Wallet Cycles: $CYCLES_RAW"
            CYCLES_NUM=$(parse_cycles "$CYCLES_RAW")
            IDENTITY_CYCLES=$CYCLES_NUM
            TOTAL_CYCLES_ALL=$((TOTAL_CYCLES_ALL + CYCLES_NUM))
            
            # Status warnings
            if [ $CYCLES_NUM -gt $WALLET_HIGH_THRESHOLD ]; then
                print_warning "High unused cycles in IC wallet: $(format_cycles $CYCLES_NUM) - Suggest redistribution"
                CYCLE_RECOMMENDATIONS+=("Redistribute high wallet cycles for $IDENTITY: dfx wallet --network ic send <canister-id> $(format_cycles $((CYCLES_NUM / 2)))")
            elif [ $CYCLES_NUM -lt $LOW_THRESHOLD ]; then
                print_warning "Low IC wallet cycles: $(format_cycles $CYCLES_NUM) - Warning level"
            fi
        else
            echo "IC Wallet Cycles: Unable to fetch"
        fi
    else
        echo "IC Wallet: Not found"
    fi
    
    # Check local network wallet
    if LOCAL_WALLET_ID=$(dfx identity --network local get-wallet 2>/dev/null); then
        echo "Local Wallet ID: $LOCAL_WALLET_ID"
        
        if LOCAL_CYCLES_RAW=$(dfx wallet --network local balance 2>/dev/null); then
            echo "Local Wallet Cycles: $LOCAL_CYCLES_RAW"
            LOCAL_CYCLES_NUM=$(parse_cycles "$LOCAL_CYCLES_RAW")
            IDENTITY_CYCLES=$((IDENTITY_CYCLES + LOCAL_CYCLES_NUM))
            
            if [ $LOCAL_CYCLES_NUM -gt 0 ]; then
                print_info "Local development wallet has $(format_cycles $LOCAL_CYCLES_NUM)"
            fi
        else
            echo "Local Wallet Cycles: Unable to fetch"
        fi
    else
        # Try to create local wallet if it doesn't exist
        if dfx wallet --network local balance >/dev/null 2>&1; then
            LOCAL_WALLET_BALANCE=$(dfx wallet --network local balance 2>/dev/null)
            echo "Local Wallet: $LOCAL_WALLET_BALANCE"
        else
            echo "Local Wallet: Not found"
        fi
    fi
    
    # CANISTER OWNERSHIP DETECTION
    IDENTITY_CANISTERS=0
    IDENTITY_CANISTER_CYCLES=0
    IDENTITY_CRITICAL_CANISTERS=0
    IDENTITY_LOW_CANISTERS=0
    
    echo "Checking all project canisters..."
    
    # Check multiple possible canister_ids.json locations
    CANISTER_FILES=("./canister_ids.json" "./.dfx/ic/canister_ids.json" "./.dfx/local/canister_ids.json")
    
    for CANISTER_FILE in "${CANISTER_FILES[@]}"; do
        if [ -f "$CANISTER_FILE" ]; then
            echo "Found canister file: $CANISTER_FILE"
            
            # Parse canister IDs from the file
            while IFS= read -r line; do
                NAME=$(echo "$line" | cut -d' ' -f1)
                CID=$(echo "$line" | cut -d' ' -f2)
                
                if [ -n "$CID" ] && [ "$CID" != "null" ] && [ "$CID" != "" ]; then
                    echo ""
                    printf "  ${BOLD}%-12s${NC} %s\n" "[$NAME]" "$CID"
                    
                    # Check IC network status
                    if STATUS=$(dfx canister --network ic status "$CID" 2>/dev/null); then
                        # Check if this identity controls the canister
                        if CONTROLLERS=$(dfx canister --network ic info "$CID" 2>/dev/null | grep "Controllers:" | grep "$PRINCIPAL"); then
                            IDENTITY_CANISTERS=$((IDENTITY_CANISTERS + 1))
                            TOTAL_CANISTERS_ALL=$((TOTAL_CANISTERS_ALL + 1))
                            
                            # Parse cycles and status
                            CANISTER_STATUS=$(echo "$STATUS" | grep "Status:" | cut -d: -f2 | xargs)
                            CYCLES_RAW=$(echo "$STATUS" | grep "Balance:" | cut -d: -f2 | xargs)
                            CYCLES_NUM=$(parse_cycles "$CYCLES_RAW")
                            CYCLES_FORMATTED=$(format_cycles $CYCLES_NUM)
                            IDENTITY_CANISTER_CYCLES=$((IDENTITY_CANISTER_CYCLES + CYCLES_NUM))
                            TOTAL_CYCLES_ALL=$((TOTAL_CYCLES_ALL + CYCLES_NUM))
                            
                            printf "    IC Network - Status: %-8s Cycles: %s" "$CANISTER_STATUS" "$CYCLES_FORMATTED"
                            
                            # Categorize: Critical/Low/OK
                            if [ $CYCLES_NUM -lt $CRITICAL_THRESHOLD ]; then
                                ALL_CRITICAL_CANISTERS=$((ALL_CRITICAL_CANISTERS + 1))
                                IDENTITY_CRITICAL_CANISTERS=$((IDENTITY_CRITICAL_CANISTERS + 1))
                                echo -e " ${RED}🚨 CRITICAL${NC}"
                                CRITICAL_ACTIONS+=("URGENT: Top up $NAME ($CID) - only $(format_cycles $CYCLES_NUM) remaining: dfx canister --network ic deposit-cycles 1000000000000 $CID")
                            elif [ $CYCLES_NUM -lt $LOW_THRESHOLD ]; then
                                ALL_LOW_CANISTERS=$((ALL_LOW_CANISTERS + 1))
                                IDENTITY_LOW_CANISTERS=$((IDENTITY_LOW_CANISTERS + 1))
                                echo -e " ${YELLOW}⚠️  LOW${NC}"
                            else
                                echo -e " ${GREEN}✅ OK${NC}"
                            fi
                            
                            # Count running vs stopped
                            if [[ "$CANISTER_STATUS" == *"Running"* ]]; then
                                RUNNING_CANISTERS=$((RUNNING_CANISTERS + 1))
                            elif [[ "$CANISTER_STATUS" == *"Stopped"* ]]; then
                                STOPPED_CANISTERS=$((STOPPED_CANISTERS + 1))
                            fi
                        else
                            echo "    IC Network - Not controlled by this identity"
                        fi
                    else
                        echo "    IC Network - Unable to fetch status"
                    fi
                    
                    # Check local network status if available
                    if LOCAL_STATUS=$(dfx canister --network local status "$CID" 2>/dev/null); then
                        LOCAL_CANISTER_STATUS=$(echo "$LOCAL_STATUS" | grep "Status:" | cut -d: -f2 | xargs)
                        LOCAL_CYCLES_RAW=$(echo "$LOCAL_STATUS" | grep "Balance:" | cut -d: -f2 | xargs)
                        LOCAL_CYCLES_FORMATTED=$(format_cycles $(parse_cycles "$LOCAL_CYCLES_RAW"))
                        printf "    Local Network - Status: %-8s Cycles: %s\n" "$LOCAL_CANISTER_STATUS" "$LOCAL_CYCLES_FORMATTED"
                    else
                        echo "    Local Network - Not deployed or unreachable"
                    fi
                fi
            done < <(jq -r 'to_entries[] | "\(.key) \(.value.ic // .value.local // "")"' "$CANISTER_FILE" 2>/dev/null || echo "")
            
            break  # Use first found canister file
        fi
    done
    
    if [ $IDENTITY_CANISTERS -eq 0 ]; then
        echo "No project canisters found or controlled by this identity"
    fi
    
    # COMPREHENSIVE CANISTER DISCOVERY - Find ALL canisters owned by this identity
    echo ""
    echo "Discovering ALL canisters owned by this identity..."
    
    # Method 1: Check if identity has a wallet and list wallet-created canisters
    if [ -n "$WALLET_ID" ]; then
        echo "Checking wallet-managed canisters..."
        if WALLET_CANISTERS=$(dfx wallet --network ic list-canisters 2>/dev/null); then
            if [ -n "$WALLET_CANISTERS" ] && [ "$WALLET_CANISTERS" != "[]" ]; then
                echo "Wallet-managed canisters found:"
                echo "$WALLET_CANISTERS" | jq -r '.[] | "  \(.name // "unnamed"): \(.canister_id)"' 2>/dev/null || echo "$WALLET_CANISTERS"
            else
                echo "  No wallet-managed canisters found"
            fi
        else
            echo "  Unable to list wallet canisters (wallet may be empty or unreachable)"
        fi
    fi
    
    # Method 1.5: Try alternative wallet listing method
    if [ -n "$WALLET_ID" ]; then
        echo "Trying alternative wallet canister discovery..."
        # Try to get wallet info which might show managed canisters
        if WALLET_INFO=$(dfx canister --network ic info "$WALLET_ID" 2>/dev/null); then
            echo "  Wallet canister info retrieved successfully"
            # The wallet itself is a canister this identity controls
            if echo "$WALLET_INFO" | grep -q "$PRINCIPAL"; then
                echo "  Wallet canister $WALLET_ID is controlled by this identity"
            fi
        fi
    fi
    
    # Method 2: Try to discover canisters by checking common canister ID patterns
    # This is a more advanced discovery method
    echo "Scanning for additional owned canisters..."
    
    # Check if there are any other canister_ids.json files in subdirectories
    find . -name "canister_ids.json" -type f 2>/dev/null | while read -r canister_file; do
        if [ "$canister_file" != "./canister_ids.json" ]; then
            echo "Found additional canister file: $canister_file"
            
            while IFS= read -r line; do
                NAME=$(echo "$line" | cut -d' ' -f1)
                CID=$(echo "$line" | cut -d' ' -f2)
                
                if [ -n "$CID" ] && [ "$CID" != "null" ] && [ "$CID" != "" ]; then
                    # Check if this identity controls this canister
                    if dfx canister --network ic info "$CID" 2>/dev/null | grep "Controllers:" | grep -q "$PRINCIPAL"; then
                        echo "  Additional canister found: [$NAME] $CID"
                        
                        if STATUS=$(dfx canister --network ic status "$CID" 2>/dev/null); then
                            CANISTER_STATUS=$(echo "$STATUS" | grep "Status:" | cut -d: -f2 | xargs)
                            CYCLES_RAW=$(echo "$STATUS" | grep "Balance:" | cut -d: -f2 | xargs)
                            CYCLES_FORMATTED=$(format_cycles $(parse_cycles "$CYCLES_RAW"))
                            echo "    Status: $CANISTER_STATUS, Cycles: $CYCLES_FORMATTED"
                        fi
                    fi
                fi
            done < <(jq -r 'to_entries[] | "\(.key) \(.value.ic // .value.local // "")"' "$canister_file" 2>/dev/null || echo "")
        fi
    done
    
    # Method 3: Check for .dfx directories in subdirectories (other projects)
    find . -name ".dfx" -type d 2>/dev/null | while read -r dfx_dir; do
        if [ "$dfx_dir" != "./.dfx" ]; then
            echo "Found additional .dfx directory: $dfx_dir"
            
            for network in ic local; do
                canister_file="$dfx_dir/$network/canister_ids.json"
                if [ -f "$canister_file" ]; then
                    echo "  Checking $network network canisters in $canister_file"
                    
                    while IFS= read -r line; do
                        NAME=$(echo "$line" | cut -d' ' -f1)
                        CID=$(echo "$line" | cut -d' ' -f2)
                        
                        if [ -n "$CID" ] && [ "$CID" != "null" ] && [ "$CID" != "" ]; then
                            if dfx canister --network ic info "$CID" 2>/dev/null | grep "Controllers:" | grep -q "$PRINCIPAL"; then
                                echo "    Additional canister: [$NAME] $CID (from $dfx_dir)"
                                
                                if STATUS=$(dfx canister --network ic status "$CID" 2>/dev/null); then
                                    CANISTER_STATUS=$(echo "$STATUS" | grep "Status:" | cut -d: -f2 | xargs)
                                    CYCLES_RAW=$(echo "$STATUS" | grep "Balance:" | cut -d: -f2 | xargs)
                                    CYCLES_FORMATTED=$(format_cycles $(parse_cycles "$CYCLES_RAW"))
                                    echo "      Status: $CANISTER_STATUS, Cycles: $CYCLES_FORMATTED"
                                fi
                            fi
                        fi
                    done < <(jq -r 'to_entries[] | "\(.key) \(.value.ic // .value.local // "")"' "$canister_file" 2>/dev/null || echo "")
                fi
            done
        fi
    done
    
    # Method 4: Check common locations for other dfx projects
    echo "Checking for other dfx projects in common locations..."
    
    # Check parent directories and common project locations
    for search_dir in .. ../.. ~ ~/projects ~/dev ~/code; do
        if [ -d "$search_dir" ]; then
            find "$search_dir" -maxdepth 3 -name "dfx.json" -type f 2>/dev/null | head -5 | while read -r dfx_json; do
                project_dir=$(dirname "$dfx_json")
                if [ "$project_dir" != "$(pwd)" ]; then
                    echo "  Found dfx project: $project_dir"
                    
                    # Check if this project has deployed canisters
                    for canister_file in "$project_dir/canister_ids.json" "$project_dir/.dfx/ic/canister_ids.json"; do
                        if [ -f "$canister_file" ]; then
                            echo "    Checking canisters in $canister_file"
                            
                            while IFS= read -r line; do
                                NAME=$(echo "$line" | cut -d' ' -f1)
                                CID=$(echo "$line" | cut -d' ' -f2)
                                
                                if [ -n "$CID" ] && [ "$CID" != "null" ] && [ "$CID" != "" ]; then
                                    if dfx canister --network ic info "$CID" 2>/dev/null | grep "Controllers:" | grep -q "$PRINCIPAL"; then
                                        echo "      Found owned canister: [$NAME] $CID (from $project_dir)"
                                        
                                        if STATUS=$(dfx canister --network ic status "$CID" 2>/dev/null); then
                                            CANISTER_STATUS=$(echo "$STATUS" | grep "Status:" | cut -d: -f2 | xargs)
                                            CYCLES_RAW=$(echo "$STATUS" | grep "Balance:" | cut -d: -f2 | xargs)
                                            CYCLES_FORMATTED=$(format_cycles $(parse_cycles "$CYCLES_RAW"))
                                            echo "        Status: $CANISTER_STATUS, Cycles: $CYCLES_FORMATTED"
                                        fi
                                    fi
                                fi
                            done < <(jq -r 'to_entries[] | "\(.key) \(.value.ic // .value.local // "")"' "$canister_file" 2>/dev/null || echo "")
                            
                            break  # Only check first found canister file per project
                        fi
                    done
                fi
            done
        fi
    done
    
    # Count wallets and canisters
    if [ $IDENTITY_CANISTERS -gt 0 ]; then
        IDENTITIES_WITH_CANISTERS=$((IDENTITIES_WITH_CANISTERS + 1))
        print_success "Owns $IDENTITY_CANISTERS canister(s)"
        echo "Canister cycles: $(format_cycles $IDENTITY_CANISTER_CYCLES)"
        
        if [ $IDENTITY_CRITICAL_CANISTERS -gt 0 ]; then
            print_critical "$IDENTITY_CRITICAL_CANISTERS canister(s) in critical state"
        elif [ $IDENTITY_LOW_CANISTERS -gt 0 ]; then
            print_warning "$IDENTITY_LOW_CANISTERS canister(s) running low on cycles"
        fi
    else
        echo "Canisters owned: 0"
    fi
    
    echo "Total cycles: $(format_cycles $((IDENTITY_CYCLES + IDENTITY_CANISTER_CYCLES)))"
    echo ""
done

# CLEANUP & RESTORATION - Switch back to original identity
dfx identity use "$ORIGINAL_IDENTITY" >/dev/null 2>&1

# GLOBAL SUMMARY - Deployment overview
print_header "COMPLETE DEPLOYMENT OVERVIEW"
echo "Total Identities Scanned: $TOTAL_IDENTITIES"
echo "Identities with Wallets: $IDENTITIES_WITH_WALLETS"
echo "Identities with Canisters: $IDENTITIES_WITH_CANISTERS"
echo "Insecure Identities: $INSECURE_IDENTITIES"
echo "Total Deployed Canisters: $TOTAL_CANISTERS_ALL"
echo "  - Running: $RUNNING_CANISTERS"
echo "  - Stopped: $STOPPED_CANISTERS"
echo "  - Unreachable: $UNREACHABLE_CANISTERS"
echo "Total ICP Across All Identities: ${TOTAL_ICP_ALL} ICP"
echo "Total Cycles Across All Identities: $(format_cycles $TOTAL_CYCLES_ALL)"

# HEALTH ASSESSMENT
print_header "HEALTH ASSESSMENT"

# Security audit
if [ $INSECURE_IDENTITIES -gt 0 ]; then
    print_critical "$INSECURE_IDENTITIES identities are stored insecurely (plaintext)"
fi

# Critical detection
if [ $ALL_CRITICAL_CANISTERS -gt 0 ]; then
    print_critical "$ALL_CRITICAL_CANISTERS canister(s) critically low on cycles (<50B)!"
fi

# Low cycles warning
if [ $ALL_LOW_CANISTERS -gt 0 ]; then
    print_warning "$ALL_LOW_CANISTERS canister(s) running low on cycles (<200B)"
fi

# REPORTING & RECOMMENDATIONS
if [ ${#CRITICAL_ACTIONS[@]} -gt 0 ]; then
    print_header "🚨 IMMEDIATE ACTIONS REQUIRED"
    for action in "${CRITICAL_ACTIONS[@]}"; do
        echo -e "${RED}• $action${NC}"
    done
fi

if [ ${#SECURITY_RECOMMENDATIONS[@]} -gt 0 ]; then
    print_header "🔒 SECURITY IMPROVEMENTS"
    for rec in "${SECURITY_RECOMMENDATIONS[@]}"; do
        echo -e "${YELLOW}• $rec${NC}"
    done
fi

if [ ${#ICP_RECOMMENDATIONS[@]} -gt 0 ]; then
    print_header "💰 ICP CONVERSION SUGGESTIONS"
    for rec in "${ICP_RECOMMENDATIONS[@]}"; do
        echo -e "${BLUE}• $rec${NC}"
    done
fi

if [ ${#CYCLE_RECOMMENDATIONS[@]} -gt 0 ]; then
    print_header "🔄 CYCLE DISTRIBUTION SUGGESTIONS"
    for rec in "${CYCLE_RECOMMENDATIONS[@]}"; do
        echo -e "${CYAN}• $rec${NC}"
    done
fi

# STATUS CLASSIFICATION & FINAL REPORT
echo ""
if [ $ALL_CRITICAL_CANISTERS -gt 0 ]; then
    print_critical "OVERALL STATUS: CRITICAL - Immediate attention required!"
elif [ $ALL_LOW_CANISTERS -gt 0 ] || [ $INSECURE_IDENTITIES -gt 0 ]; then
    print_warning "OVERALL STATUS: WARNING - Monitor closely"
elif [ $TOTAL_CANISTERS_ALL -eq 0 ]; then
    print_info "OVERALL STATUS: NO DEPLOYMENTS - Ready to deploy"
else
    print_success "OVERALL STATUS: HEALTHY - All systems operational"
fi

echo -e "\n${BOLD}${PURPLE}╔══════════════════════════════════════════════════════════╗"
echo "║                    SCAN COMPLETE                          ║"
echo "║              Switched back to: $ORIGINAL_IDENTITY$(printf '%*s' $((18 - ${#ORIGINAL_IDENTITY})) '')║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"