dfx identity new minter
dfx identity use minter
MINTER_PRINCIPAL=$(dfx identity --identity minter get-principal)
export MINTER_ACCOUNT_ID=$(dfx ledger account-id)


dfx identity use default
export USER_PRINCIPAL=$(dfx identity get-principal)
export USER_ACCOUNT_ID=$(dfx ledger account-id)



dfx deploy ckusdc_ledger --argument "(variant {
  Init = record {
    decimals = opt 6;
    token_symbol = \"ckUSDC\";
    token_name = \"ckUSDC\";
    transfer_fee = 10_000;
    metadata = vec {};
    minting_account = record { owner = principal \"$MINTER_PRINCIPAL\"; };
    initial_balances = vec {};
    archive_options = record {
      num_blocks_to_archive = 1000;
      trigger_threshold = 2000;
      max_message_size_bytes = null;
      cycles_for_archive_creation = opt 100_000_000_000_000;
      node_max_memory_size_bytes = opt 3_221_225_472;
      controller_id = principal \"2vxsx-fae\"
    };
    max_memo_length = opt 80;
    feature_flags = opt record { icrc2 = true };
  }
})" --mode=reinstall -y



