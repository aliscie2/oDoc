run_fe:
	yarn start

run_be:
	dfx start  --background --host 127.0.0.1:4943
	dfx deploy backend

start:
	chmod +x ./scripts/start.sh
	./scripts/start.sh

kill:
	kill -INT $(lsof -t -i :8080)
	kill -INT $(lsof -t -i :4943)
	

kill_dfx:
	killall dfx replica


get_all_localhost:
	lsof -i 4 -P -n | grep '127.0.0.1'

get_any_port:
	lsof -i :4943
	

run_gateway_on_special_port:
	cargo run -- --gateway-address 0.0.0.0:8084 --ic-network-url http://127.0.0.1:8080

generate_candid_file:
	bash scripts/did.sh
	sh scripts/deploy_ic_siwe_provider.sh
	sh scripts/deploy_ledger.sh
	@echo "Generating declarations..."
	dfx generate backend
	dfx generate ckusdc_ledger || echo "Warning: ckusdc_ledger not deployed yet"
	dfx generate ckusdt_ledger || echo "Warning: ckusdt_ledger not deployed yet"

generate_ledger_declarations:
	@echo "Generating ledger declarations (ledgers must be deployed first)..."
	dfx generate ckusdc_ledger
	dfx generate ckusdt_ledger
	@echo "Ledger declarations generated successfully!"

add_balance:
	dfx wallet --network ic redeem-faucet-coupon 64FCF-75653-A9433
	dfx ledger --network ic balance
	dfx wallet --network ic balance
	dfx canister --network ic balance

topup_cycles:
	dfx identity use default
	dfx ledger account-id --network=ic
	#then send icp to ur address
	dfx ledger balance --network=ic
	dfx identity --network=ic get-wallet
	dfx ledger --network=ic top-up --amount=0.5 2nvlk-tyaaa-aaaal-ab5ya-cai
	dfx wallet send lwdq3-vqaaa-aaaal-acwda-cai 1000000000000 --network=ic
	dfx wallet send lrcwp-yiaaa-aaaal-acwdq-cai 1000000000000 --network=ic
	dfx canister status lrcwp-yiaaa-aaaal-acwdq-cai --network=ic

topup_backend:
	@echo "Converting ICP to cycles and topping up backend..."
	dfx identity use default
	@echo "Current ICP balance:"
	dfx ledger balance --network=ic
	@echo "Topping up wallet with 1 ICP..."
	dfx ledger --network=ic top-up --amount=1.0 2nvlk-tyaaa-aaaal-ab5ya-cai
	@echo "Sending 5T cycles to backend..."
	dfx wallet send lrcwp-yiaaa-aaaal-acwdq-cai 5000000000000 --network=ic
	@echo "Backend status:"
	dfx canister status lrcwp-yiaaa-aaaal-acwdq-cai --network=ic

deploy-ic:
	@echo "Compressing frontend assets..."
	@find build -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.svg" -o -name "*.json" \) -exec gzip -9fk {} \;
	export DFX_WARNING=-mainnet_plaintext_identity && \
	export DFX_ASSET_UPLOAD_TIMEOUT=600 && \
	export DFX_ASSET_BATCH_SIZE=5 && \
	dfx deploy backend --network ic && \
	dfx deploy frontend --network ic || \
	(echo "Retrying frontend deployment..." && sleep 10 && dfx deploy frontend --network ic)

get_logs:
	dfx canister logs backend  --network ic

deploy-all:
	dfx killall 2>/dev/null || true
	dfx stop 2>/dev/null || true
	dfx start  --background --clean  --host 127.0.0.1:4943 
	dfx deploy internet_identity || error "Internet Identity deployment failed"

	sh scripts/first_time_run.sh
	bash scripts/did.sh backend
	sh scripts/deploy_ledger.sh
	dfx generate backend
	dfx generate ckusdc_ledger
	dfx generate ckusdt_ledger
	sh scripts/set_env.sh
	
	gzip -fk target/wasm32-unknown-unknown/release/backend.wasm
	mv target/wasm32-unknown-unknown/release/backend.wasm.gz ./tests/backend/
	wget -nc -P ./tests/backend/ https://github.com/dfinity/ic/releases/download/ledger-suite-icrc-2025-06-10/ic-icrc1-ledger.wasm.gz

	yarn start

redpley:
	dfx killall 2>/dev/null || true
	dfx stop 2>/dev/null || true
	rm -rf .dfx/state 2>/dev/null || true
	dfx start  --background  --host 127.0.0.1:4943 
	sleep 3
	dfx deploy internet_identity

	sh scripts/first_time_run.sh
	bash scripts/did.sh backend
	dfx generate backend
	dfx generate ckusdc_ledger
	dfx generate ckusdt_ledger
	sh scripts/set_env.sh
	
	gzip -fk target/wasm32-unknown-unknown/release/backend.wasm
	mv target/wasm32-unknown-unknown/release/backend.wasm.gz ./tests/backend/
	wget -nc -P ./tests/backend/ https://github.com/dfinity/ic/releases/download/ledger-suite-icrc-2025-06-10/ic-icrc1-ledger.wasm.gz

	yarn start
	
	
upgrade-backend:
	bash scripts/did.sh backend
	dfx generate backend
	dfx deploy backend
	gzip -fk target/wasm32-unknown-unknown/release/backend.wasm
	mv target/wasm32-unknown-unknown/release/backend.wasm.gz ./tests/backend/

# call it before each commit please.
frontend-format:
	# npx tsc --listFiles --noEmit | grep -E "(error|cannot find)"
	yarn run lint
	prettier --write ./src/frontend
	npx tsc --noUnusedLocals --noUnusedParameters --noEmit --skipLibCheck
	npx ts-unused-exports tsconfig.json
	# install npm-check globally npm install npm-check -g
	npm-check
	

pretty:
	prettier --write ./src/frontend
	prettier --write ./tests

backend-format:
	cargo fmt
	cargo clippy --fix


getting_pulls:
	git fetch origin pull/<pr_number>/head:pr-<pr_number>


debug-loading-time:
	npm run start -- --debug hmr
	# yarn run start -- --debug hmr
	

test-e2e:
	# login app.zerostep.com and get ur token
	# export ZEROSTEP_TOKEN="your_token_here"
	lsof -ti:5173 | xargs kill -9 || true
	dfx deploy backend --mode reinstall --yes
	yarn start &
	sleep 5
	yarn playwright test
	lsof -ti:5173 | xargs kill -9 || true


dummy_ckusdc_deposit:
	# replace principal with the wanted user
	dfx canister --identity minter call ckusdc_ledger icrc1_transfer '(record {to = record { owner = principal "rhlwg-3ybpc-uxtly-55zob-5cyjy-u5jmz-4zgjk-n7po6-hz5rl-4xeam-fae"; }; amount = 300_000_000; })'


dummy_ckusdt_deposit:
	# replace principal with the wanted user
	dfx canister --identity minter call ckusdt_ledger icrc1_transfer '(record {to = record { owner = principal "rhlwg-3ybpc-uxtly-55zob-5cyjy-u5jmz-4zgjk-n7po6-hz5rl-4xeam-fae"; }; amount = 300_000_000; })'

generate_icons:
	npx pwa-asset-generator ./public/logo.jpg ./public/icons --background "#000000" --manifest ./public/manifest.json --index ./index.html

testing_thumbnails:
	cloudflared tunnel --url http://localhost:5173
# 	addd this in in server: in  vite.config.ts allowedHosts: [ ".trycloudflare.com"],

code_review:
	git diff HEAD~1 HEAD -- src/frontend/pages/jobs

get_typescript_issues:
	npx tsc --noEmit --pretty 2>&1 | grep -A 5 "agreementView.tsx"