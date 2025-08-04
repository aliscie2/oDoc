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
	yarn start

	
	
upgrade-backend: 
	bash scripts/did.sh backend
	dfx generate backend
	dfx deploy backend

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





# Staging deployment with clear error handling and debugging

check-staging-requirements:
	@echo "=== Checking Staging Requirements ==="
	@echo "ICP Balance: $$(dfx ledger balance --network staging 2>/dev/null || echo 'ERROR: Cannot check ICP balance')"
	@echo "Cycles Balance: $$(dfx cycles balance --network staging 2>/dev/null || echo 'ERROR: Cannot check cycles balance')"
	@echo "Account ID: $$(dfx ledger account-id --network staging 2>/dev/null || echo 'ERROR: Cannot get account ID')"
	@echo "Principal: $$(dfx identity get-principal 2>/dev/null || echo 'ERROR: Cannot get principal')"
	@echo "Network Status: $$(dfx ping staging 2>/dev/null && echo 'OK' || echo 'ERROR: Cannot reach staging network')"

fund-staging-smart:
	@echo "=== Smart Staging Funding ==="
	@ICP_BALANCE=$$(dfx ledger balance --network staging | cut -d' ' -f1); \
	CYCLES_BALANCE=$$(dfx cycles balance --network staging | cut -d' ' -f1); \
	echo "Current ICP: $$ICP_BALANCE"; \
	echo "Current Cycles: $$CYCLES_BALANCE TC"; \
	if [ "$$(echo "$$ICP_BALANCE < 0.001" | bc -l)" = "1" ]; then \
		echo "❌ ERROR: Insufficient ICP ($$ICP_BALANCE). Need at least 0.001 ICP"; \
		echo "💡 Solution: Send ICP to: $$(dfx ledger account-id --network staging)"; \
		exit 1; \
	fi; \
	if [ "$$(echo "$$CYCLES_BALANCE < 0.3" | bc -l)" = "1" ]; then \
		echo "⚠️  Low cycles ($$CYCLES_BALANCE TC). Converting ICP to cycles..."; \
		CONVERT_AMOUNT=$$(echo "$$ICP_BALANCE - 0.001" | bc -l); \
		echo "Converting $$CONVERT_AMOUNT ICP to cycles..."; \
		dfx cycles convert --amount=$$CONVERT_AMOUNT --network staging || exit 1; \
		echo "✅ Cycles topped up: $$(dfx cycles balance --network staging)"; \
	else \
		echo "✅ Sufficient cycles ($$CYCLES_BALANCE TC)"; \
	fi

deploy-staging-safe:
	@echo "=== Safe Staging Deployment ==="
	@make check-staging-requirements
	@CYCLES_BALANCE=$$(dfx cycles balance --network staging | cut -d' ' -f1); \
	if [ "$$(echo "$$CYCLES_BALANCE < 0.3" | bc -l)" = "1" ]; then \
		echo "❌ ERROR: Insufficient cycles ($$CYCLES_BALANCE TC). Need at least 0.3 TC"; \
		echo "💡 Solution: Run 'make fund-staging-smart' first"; \
		exit 1; \
	fi; \
	echo "✅ Sufficient cycles ($$CYCLES_BALANCE TC). Proceeding with deployment..."
	@echo "=== Cleaning old canister IDs ==="
	rm -f .dfx/staging/canister_ids.json
	@echo "=== Creating canisters ==="
	dfx canister create backend --network staging --no-wallet || { \
		echo "❌ ERROR: Failed to create backend canister"; \
		echo "💡 Check cycles balance: $$(dfx cycles balance --network staging)"; \
		exit 1; \
	}
	dfx canister create frontend --network staging --no-wallet || { \
		echo "❌ ERROR: Failed to create frontend canister"; \
		exit 1; \
	}
	@echo "=== Deploying canisters ==="
	dfx deploy backend --network staging --no-wallet || { \
		echo "❌ ERROR: Backend deployment failed"; \
		exit 1; \
	}
	dfx deploy frontend --network staging --no-wallet || { \
		echo "❌ ERROR: Frontend deployment failed"; \
		exit 1; \
	}
	@echo "✅ Staging deployment successful!"
	@echo "Backend ID: $$(dfx canister id backend --network staging)"
	@echo "Frontend ID: $$(dfx canister id frontend --network staging)"

debug-staging-failure:
	@echo "=== Debugging Staging Deployment Failure ==="
	@echo "Network connectivity:"
	@dfx ping staging && echo "✅ Network OK" || echo "❌ Network FAILED"
	@echo "Balances:"
	@echo "  ICP: $$(dfx ledger balance --network staging 2>/dev/null || echo 'ERROR')"
	@echo "  Cycles: $$(dfx cycles balance --network staging 2>/dev/null || echo 'ERROR')"
	@echo "Canister status:"
	@dfx canister status backend --network staging 2>/dev/null || echo "  Backend: NOT FOUND"
	@dfx canister status frontend --network staging 2>/dev/null || echo "  Frontend: NOT FOUND"
	@echo "Canister IDs file:"
	@cat .dfx/staging/canister_ids.json 2>/dev/null || echo "  No staging canister IDs found"

clean-staging:
	@echo "=== Cleaning Staging Environment ==="
	rm -rf .dfx/staging/
	@echo "✅ Staging environment cleaned"

# Updated existing commands
topup_cycles_staging:
	@make fund-staging-smart

deploy-staging:
	@make deploy-staging-safe

check_staging_balance:
	@make check-staging-requirements