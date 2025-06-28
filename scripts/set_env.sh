#!/bin/bash

# Check if .env file exists
if [ -f ".env" ]; then
    echo ".env file exists. Updating..."
    
    # Update existing variables or add new ones
    grep -q "VITE_DFX_NETWORK=" .env && sed -i "s/VITE_DFX_NETWORK=.*/VITE_DFX_NETWORK=local/" .env || echo "VITE_DFX_NETWORK=local" >> .env
    grep -q "VITE_DFX_PORT=" .env && sed -i "s/VITE_DFX_PORT=.*/VITE_DFX_PORT=4943/" .env || echo "VITE_DFX_PORT=4943" >> .env
    grep -q "VITE_IC_HOST=" .env && sed -i "s|VITE_IC_HOST=.*|VITE_IC_HOST=http://localhost:4943|" .env || echo "VITE_IC_HOST=http://localhost:4943" >> .env
    
    # Get canister IDs
    II_ID=$(dfx canister id internet_identity 2>/dev/null)
    BACKEND_ID=$(dfx canister id backend 2>/dev/null)
    FRONTEND_ID=$(dfx canister id frontend 2>/dev/null)
    
    # Update canister ID variables
    if [ -n "$II_ID" ]; then
        grep -q "VITE_INTERNET_IDENTITY=" .env && sed -i "s/VITE_INTERNET_IDENTITY=.*/VITE_INTERNET_IDENTITY=$II_ID/" .env || echo "VITE_INTERNET_IDENTITY=$II_ID" >> .env
    else
        echo "Warning: internet_identity canister ID not found"
    fi
    
    if [ -n "$BACKEND_ID" ]; then
        grep -q "VITE_BACKEND_CANISTER_ID=" .env && sed -i "s/VITE_BACKEND_CANISTER_ID=.*/VITE_BACKEND_CANISTER_ID=$BACKEND_ID/" .env || echo "VITE_BACKEND_CANISTER_ID=$BACKEND_ID" >> .env
    else
        echo "Warning: backend canister ID not found"
    fi
    
    if [ -n "$FRONTEND_ID" ]; then
        grep -q "VITE_FRONTEND_CANISTER_ID=" .env && sed -i "s/VITE_FRONTEND_CANISTER_ID=.*/VITE_FRONTEND_CANISTER_ID=$FRONTEND_ID/" .env || echo "VITE_FRONTEND_CANISTER_ID=$FRONTEND_ID" >> .env
    else
        echo "Warning: frontend canister ID not found"
    fi
    
    echo ".env file updated successfully."
else
    echo ".env file does not exist. Creating a new one..."
    
    # Get canister IDs
    II_ID=$(dfx canister id internet_identity 2>/dev/null)
    BACKEND_ID=$(dfx canister id backend 2>/dev/null)
    FRONTEND_ID=$(dfx canister id frontend 2>/dev/null)
    DFX_PORT=$(dfx info webserver-port)
    # Create new .env file with all variables
        cat > .env <<EOF
    VITE_DFX_NETWORK=local
    VITE_DFX_PORT=$DFX_PORT
    VITE_IC_HOST=http://localhost:4943
    EOF
        
    # Add canister IDs if they exist
    if [ -n "$II_ID" ]; then
        echo "VITE_INTERNET_IDENTITY=$II_ID" >> .env
    else
        echo "Warning: internet_identity canister ID not found"
    fi
    
    if [ -n "$BACKEND_ID" ]; then
        echo "VITE_BACKEND_CANISTER_ID=$BACKEND_ID" >> .env
    else
        echo "Warning: backend canister ID not found"
    fi
    
    if [ -n "$FRONTEND_ID" ]; then
        echo "VITE_FRONTEND_CANISTER_ID=$FRONTEND_ID" >> .env
    else
        echo "Warning: frontend canister ID not found"
    fi
    
    echo ".env file created successfully."
fi