run_fe:
	yarn run start
run_be:
	dfx deploy backend

start:
	chmod +x ./scripts/start.sh
	./scripts/start.sh

kill:
	kill -INT $(lsof -t -i :8080)

kill_dfx:
	killall dfx replica


get_all_localhost:
	lsof -i 4 -P -n | grep '127.0.0.1'

get_any_port:
	lsof -i :8080

run_gateway_on_special_port:
	cargo run -- --gateway-address 0.0.0.0:8084 --ic-network-url http://127.0.0.1:8080

generate_candid_file:
	sh scripts/did.sh
	sh scripts/deploy_ic_siwe_provider.sh
	sh scripts/deploy_canister.sh
	sh scripts/deploy_ledger.sh
	dfx generate

add_balance:
	dfx wallet --network ic redeem-faucet-coupon 64FCF-75653-A9433
	dfx ledger --network ic balance
	dfx wallet --network ic balance
	dfx canister --network ic balance

topup_cycles:
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


# deploy-provider:
# 	dfx deploy ic_siwe_provider --argument "( \
# 	    record { \
# 	        domain = \"127.0.0.1\"; \
# 	        uri = \"http://127.0.0.1:5173\"; \
# 	        salt = \"salt\"; \
# 	        chain_id = opt 1; \
# 	        scheme = opt \"http\"; \
# 	        statement = opt \"Login to the SIWE/IC demo app\"; \
# 	        sign_in_expires_in = opt 300000000000; /* 5 minutes */ \
# 	        session_expires_in = opt 604800000000000; /* 1 week */ \
# 	        targets = opt vec { \
# 	            \"$$(dfx canister id ic_siwe_provider)\"; \
# 	            \"$$(dfx canister id backend)\"; \
# 	        }; \
# 	    } \
# 	)"
# 	dfx generate ic_siwe_provider

deploy-all: 
	dfx killall
	dfx stop
	dfx start --background --clean
	dfx canister create --all
	sh scripts/did.sh backend
	dfx generate backend
	dfx deploy backend
	sh scripts/deploy_ledger.sh
	dfx deploy internet_identity
	sh scripts/set_env.sh

	
	
upgrade-backend: 
	sh scripts/did.sh backend
	dfx generate backend
	dfx deploy backend

# call it before each commit please.
frontend-format:
	yarn run lint
	prettier --write ./src/frontend
	npx tsc --noUnusedLocals --noUnusedParameters --noEmit --skipLibCheck
	npx ts-unused-exports tsconfig.json

backend-format:
	cargo fmt
	cargo clippy


getting_pulls:
	git fetch origin pull/<pr_number>/head:pr-<pr_number>