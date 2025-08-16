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
	dfx generate

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

get_logs:
	dfx canister logs backend  --network ic

deploy-all:
	dfx killall 2>/dev/null || true
	dfx stop 2>/dev/null || true
	dfx start  --background --clean  --host 127.0.0.1:4943 
	dfx deploy internet_identity || error "Internet Identity deployment failed"

	sh scripts/first_time_run.sh
	bash scripts/did.sh backend
	dfx generate backend
	sh scripts/deploy_ledger.sh
	sh scripts/set_env.sh
	
	gzip -fk target/wasm32-unknown-unknown/release/backend.wasm
	mv target/wasm32-unknown-unknown/release/backend.wasm.gz ./tests/backend/
	wget -nc -P ./test/backend/ https://github.com/dfinity/ic/releases/download/ledger-suite-icrc-2025-06-10/ic-icrc1-ledger.wasm.gz

	yarn start

	
	
upgrade-backend:
	bash scripts/did.sh backend
	dfx generate backend
	dfx deploy backend
	gzip -fk target/wasm32-unknown-unknown/release/backend.wasm
	mv target/wasm32-unknown-unknown/release/backend.wasm.gz ./tests/backend/

# call it before each commit please.
frontend-format:
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


dummy_deposit:
	# replace lqv7v-5z3de-ldfue-z4rrf-u6opp-npwa5-e2us3-fkbx7-yjtwu-gh7x3-yae with the wanted user
	dfx canister --identity minter call ckusdc_ledger icrc1_transfer '(record {to = record { owner = principal "rhlwg-3ybpc-uxtly-55zob-5cyjy-u5jmz-4zgjk-n7po6-hz5rl-4xeam-fae"; }; amount = 300_000_000; })'
