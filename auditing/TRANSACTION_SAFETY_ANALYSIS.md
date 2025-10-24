# Transaction Safety: The Phantom Success Problem

## Current Protection

✅ **TransferGuard** - Prevents reentrancy (concurrent transfers by same user)
❌ **Does NOT prevent** - Network failures after successful transfer

## 🚨 The Problem

```rust
let _guard = TransferGuard::new()?;  // ✅ Prevents reentrancy
transfer_from_ledger(...).await?;     // Succeeds on ledger
// Network fails here ⚡
wallet.withdraw(...)?;                // Never executes
```

**Result:** User gets tokens but wallet balance NOT deducted = Free money 💰

The guard prevents **concurrent** transfers but not **phantom success** (transfer succeeds but we think it failed).

## ✅ Quick Fix (Recommended)

Add `created_at_time` to prevent duplicates + verify on error:

```rust
async fn withdraw_from_ledger(
    ledger_canister: &str,
    amount: u64,
    address: String,
    token_name: &str,
) -> Result<Wallet, Error> {
    let _guard = TransferGuard::new()?;

    // ... validation code ...

    // Generate unique transaction ID based on user, amount, time
    let created_at_time = ic_cdk::api::time();
    let amount_with_decimals = Nat::from(amount * 1_000_000);

    // Check wallet balance
    let wallet = Wallet::get(caller());
    if wallet.balance < amount as f64 {
        return Err(Error::IcCdkError {
            message: format!(
                "Insufficient wallet balance. Available: {}, Requested: {}",
                wallet.balance, amount
            ),
        });
    }

    // Attempt transfer with deduplication
    let transfer_result = transfer_from_ledger_idempotent(
        ledger_canister,
        amount_with_decimals,
        ic_cdk::id(),
        destination_principal,
        Some(created_at_time),
    )
    .await;

    match transfer_result {
        Ok(block_index) => {
            // Transfer definitely succeeded, update wallet
            let mut wallet = Wallet::get(caller());
            wallet.withdraw(
                amount as f64,
                format!("{}-{}-block:{}", address, token_name, block_index),
                ExchangeType::Withdraw,
            )?;
            Ok(wallet)
        }
        Err(e) => {
            // Transfer might have succeeded or failed
            // Check if transaction exists on ledger
            match verify_transfer_on_ledger(
                ledger_canister,
                ic_cdk::id(),
                destination_principal,
                amount_with_decimals,
                created_at_time,
            )
            .await
            {
                Ok(Some(block_index)) => {
                    // Transfer DID succeed! Update wallet
                    let mut wallet = Wallet::get(caller());
                    wallet.withdraw(
                        amount as f64,
                        format!("{}-{}-block:{}", address, token_name, block_index),
                        ExchangeType::Withdraw,
                    )?;
                    Ok(wallet)
                }
                Ok(None) => {
                    // Transfer definitely failed
                    Err(e)
                }
                Err(verify_err) => {
                    // Can't verify - return original error
                    Err(Error::IcCdkError {
                        message: format!(
                            "Transfer status unknown. Original error: {:?}, Verification error: {:?}. Please check your wallet balance.",
                            e, verify_err
                        ),
                    })
                }
            }
        }
    }
}

// Helper function with idempotency
async fn transfer_from_ledger_idempotent(
    ledger_canister: &str,
    amount: Nat,
    from: Principal,
    to: Principal,
    created_at_time: Option<u64>,
) -> Result<BlockIndex, Error> {
    let args = TransferFromArgs {
        spender_subaccount: None,
        from: Account {
            owner: from,
            subaccount: None,
        },
        to: Account {
            owner: to,
            subaccount: None,
        },
        amount,
        fee: None,
        memo: None,
        created_at_time,  // ✅ Enables deduplication
    };

    ic_cdk::call::<(TransferFromArgs,), (Result<BlockIndex, TransferFromError>,)>(
        Principal::from_text(ledger_canister).unwrap(),
        "icrc2_transfer_from",
        (args,),
    )
    .await
    .map_err(|(_, message)| Error::IcCdkError { message })?
    .0
    .map_err(|e| Error::IcCdkError {
        message: format!("{:?}", e),
    })
}

// Verify if transfer exists on ledger
async fn verify_transfer_on_ledger(
    ledger_canister: &str,
    from: Principal,
    to: Principal,
    amount: Nat,
    created_at_time: u64,
) -> Result<Option<BlockIndex>, Error> {
    // Query recent transactions from ledger
    let transactions = ic_cdk::call::<(GetAccountTransactionsArgs,), (Result<GetTransactions, GetTransactionsErr>,)>(
        Principal::from_text(ledger_canister).unwrap(),
        "get_account_transactions",
        (GetAccountTransactionsArgs {
            max_results: Nat::from(100u64),
            start: None,
            account: IndexAccount {
                owner: from,
                subaccount: None,
            },
        },),
    )
    .await
    .map_err(|(_, message)| Error::IcCdkError { message })?
    .0
    .map_err(|e| Error::IcCdkError {
        message: format!("{:?}", e),
    })?;

    // Look for matching transaction
    for tx in transactions.transactions {
        if let Some(transfer) = &tx.transaction.transfer {
            if transfer.from.owner == from
                && transfer.to.owner == to
                && transfer.amount == amount
                && tx.transaction.created_at_time == Some(created_at_time)
            {
                return Ok(Some(tx.transaction.index));
            }
        }
    }

    Ok(None)
}
```

## 🔧 For Production (Later)

Consider tracking pending withdrawals with a background verification job. See full implementation in git history if needed.
