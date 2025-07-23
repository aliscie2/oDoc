cargo build --release --target wasm32-unknown-unknown --package icp_payment_backend

candid-extractor target/wasm32-unknown-unknown/release/icp_payment_backend.wasm > src/icp_payment_backend/icp_payment_backend.did

dfx identity use default

dfx start  --background --clean  --host 127.0.0.1:4943 

dfx deploy --network local icp_payment_backend --mode=reinstall -y
