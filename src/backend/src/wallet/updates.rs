use crate::ckusdc_index_types::GetTransactions;
use crate::current_user_state::types::TransferGuard;
use crate::wallet::error::Error;
use crate::workspaces::nat_to_u64;
use crate::{CPayment, ExchangeType, PaymentStatus, Wallet};
use candid::{Nat, Principal};
use ic_cdk::caller;
use ic_cdk_macros::update;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::BlockIndex;

use icrc_ledger_types::icrc2::transfer_from::{TransferFromArgs, TransferFromError};

// use std::time;
use crate::ckusdc_index_types::*;

// Token ledger canister IDs - centralized for easy management
const CKUSDC_LEDGER: &str = "xevnm-gaaaa-aaaar-qafnq-cai";
const CKUSDT_LEDGER: &str = "cngnf-vqaaa-aaaar-qag4q-cai";
// Future tokens can be added here:
// const ICP_LEDGER: &str = "ryjl3-tyaaa-aaaaa-aaaba-cai";
// const CKBTC_LEDGER: &str = "mxzaz-hqaaa-aaaar-qaada-cai";

/// Generic function to get user balance from any ICRC-1 ledger
async fn get_user_balance_from_ledger(ledger_canister: &str) -> Result<Nat, String> {
    let args = Account {
        owner: caller(),
        subaccount: None,
    };
    let res = ic_cdk::call::<(Account,), (Nat,)>(
        Principal::from_text(ledger_canister).unwrap(),
        "icrc1_balance_of",
        (args,),
    )
    .await
    .map_err(|(_, message)| Error::IcCdkError { message });
    if let Ok(x) = res {
        Ok(x.0)
    } else {
        let b = format!("{:?}", res);
        Err(b)
    }
}

/// Generic function to get fee from any ICRC-1 ledger
async fn get_fee_from_ledger(ledger_canister: &str) -> Nat {
    let res = ic_cdk::call::<(), (Nat,)>(
        Principal::from_text(ledger_canister).unwrap(),
        "icrc1_fee",
        (),
    )
    .await
    .map_err(|(_, message)| Error::IcCdkError { message });
    res.unwrap().0
}

// Legacy functions removed - use generic versions instead

#[update]
async fn check_external_transactions(max_results: Nat) -> Result<GetTransactions, Error> {
    let args = GetAccountTransactionsArgs {
        max_results,
        start: None,
        account: IndexAccount {
            owner: caller(),
            subaccount: None,
        },
    };

    let res = ic_cdk::call::<
        (GetAccountTransactionsArgs,),
        (Result<GetTransactions, GetTransactionsErr>,),
    >(
        Principal::from_text("xrs4b-hiaaa-aaaar-qafoa-cai").unwrap(),
        "get_account_transactions",
        (args,),
    )
    .await
    .map_err(|(_, message)| Error::IcCdkError { message })?
    .0
    .map_err(|e| Error::IcCdkError {
        message: format!("{:?}", e.message),
    })?;

    let mut wallet = Wallet::get(caller());
    for transaction in &res.transactions {
        if let Some(t) = &transaction.transaction.transfer {
            if t.to.owner == ic_cdk::id() {
                wallet
                    .deposit(
                        nat_to_u64(t.amount.clone()) as f64,
                        "ExternalWallet".to_string(),
                        ExchangeType::Deposit,
                    )
                    .map_err(|e| Error::IcCdkError {
                        message: format!("{:?}", e),
                    })?;
            }
        }

        if let Some(t) = &transaction.transaction.transfer {
            if t.from.owner == ic_cdk::id() {
                wallet
                    .withdraw(
                        nat_to_u64(t.amount.clone()) as f64,
                        "ExternalWallet".to_string(),
                        ExchangeType::Withdraw,
                    )
                    .map_err(|e| Error::IcCdkError {
                        message: format!("{:?}", e),
                    })?;
            }
        }
    }

    Ok(res)
}

/// Generic transfer_from function that works with any ICRC-2 ledger
async fn transfer_from_ledger(
    ledger_canister: &str,
    amount: Nat,
    from: Principal,
    to: Principal,
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
        created_at_time: None,
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

// Legacy function removed - use transfer_from_ledger instead

/// Generic deposit function that works with any ICRC-2 stablecoin ledger
/// This function can be reused for ckUSDC, ckUSDT, and future stablecoins
async fn deposit_from_ledger(
    ledger_canister: &str,
    min_deposit: u64,
    token_name: &str,
) -> Result<Wallet, Error> {
    let _guard = TransferGuard::new()?;
    let mut wallet = Wallet::get(caller());
    
    let balance = get_user_balance_from_ledger(ledger_canister)
        .await
        .map_err(|e| Error::IcCdkError {
            message: format!("{:?}", e),
        })?;

    if balance <= min_deposit {
        return Err(Error::IcCdkError {
            message: format!("Minimum deposit should be more than {} {}", min_deposit as f64 / 1_000_000.0, token_name),
        });
    }

    let fee = get_fee_from_ledger(ledger_canister).await;
    transfer_from_ledger(
        ledger_canister,
        balance.clone() - fee.clone(),
        caller(),
        ic_cdk::id(),
    )
    .await?;
    
    wallet
        .deposit(
            nat_to_u64((balance - fee) / Nat::from(1000000_u64)) as f64,
            format!("ExternalWallet-{}", token_name),
            ExchangeType::Deposit,
        )
        .map_err(|e| Error::IcCdkError {
            message: format!("{:?}", e),
        })?;

    Ok(wallet)
}

/// Deposit ckUSDC
#[update]
async fn deposit_ckusdc() -> Result<Wallet, Error> {
    deposit_from_ledger(CKUSDC_LEDGER, 100_000, "ckUSDC").await
}

/// Deposit ckUSDT
#[update]
async fn deposit_ckusdt() -> Result<Wallet, Error> {
    deposit_from_ledger(CKUSDT_LEDGER, 100_000, "ckUSDT").await
}

/// Auto-detect and deposit from both ckUSDC and ckUSDT if available
/// This is the most user-friendly approach
#[update]
async fn deposit_stablecoins() -> Result<Wallet, Error> {
    let _guard = TransferGuard::new()?;
    let mut wallet = Wallet::get(caller());
    let mut total_deposited = 0f64;
    let mut deposits = Vec::new();

    // Try ckUSDC
    match get_user_balance_from_ledger(CKUSDC_LEDGER).await {
        Ok(balance) if balance > 100_000_u64 => {
            let fee = get_fee_from_ledger(CKUSDC_LEDGER).await;
            if let Ok(_) = transfer_from_ledger(
                CKUSDC_LEDGER,
                balance.clone() - fee.clone(),
                caller(),
                ic_cdk::id(),
            )
            .await
            {
                let amount = nat_to_u64((balance - fee) / Nat::from(1000000_u64)) as f64;
                total_deposited += amount;
                deposits.push(format!("{} ckUSDC", amount));
            }
        }
        _ => {}
    }

    // Try ckUSDT
    match get_user_balance_from_ledger(CKUSDT_LEDGER).await {
        Ok(balance) if balance > 100_000_u64 => {
            let fee = get_fee_from_ledger(CKUSDT_LEDGER).await;
            if let Ok(_) = transfer_from_ledger(
                CKUSDT_LEDGER,
                balance.clone() - fee.clone(),
                caller(),
                ic_cdk::id(),
            )
            .await
            {
                let amount = nat_to_u64((balance - fee) / Nat::from(1000000_u64)) as f64;
                total_deposited += amount;
                deposits.push(format!("{} ckUSDT", amount));
            }
        }
        _ => {}
    }

    if total_deposited == 0.0 {
        return Err(Error::IcCdkError {
            message: "No deposits found. Minimum 0.1 USD required for each token.".to_string(),
        });
    }

    wallet
        .deposit(
            total_deposited,
            format!("ExternalWallet ({})", deposits.join(" + ")),
            ExchangeType::Deposit,
        )
        .map_err(|e| Error::IcCdkError {
            message: format!("{:?}", e),
        })?;

    Ok(wallet)
}

/// Generic withdraw function for any ICRC-2 token
async fn withdraw_from_ledger(
    ledger_canister: &str,
    amount: u64,
    address: String,
    token_name: &str,
) -> Result<Wallet, Error> {
    let _guard = TransferGuard::new()?;
    
    // Validate address format
    let destination_principal = Principal::from_text(&address).map_err(|_| Error::IcCdkError {
        message: format!("Invalid withdrawal address: '{}'. Please provide a valid principal address.", address),
    })?;
    
    // Prevent withdrawing to yourself (user's own principal)
    let user_principal = caller();
    if destination_principal == user_principal {
        return Err(Error::IcCdkError {
            message: "Cannot withdraw to yourself. Please provide an external wallet address.".to_string(),
        });
    }
    
    // Get backend canister's token balance (liquidity)
    let canister_balance = ic_cdk::call::<(Account,), (Nat,)>(
        Principal::from_text(ledger_canister).unwrap(),
        "icrc1_balance_of",
        (Account {
            owner: ic_cdk::id(),
            subaccount: None,
        },),
    )
    .await
    .map_err(|(_, message)| Error::IcCdkError { message })?
    .0;

    // Check if backend canister has enough liquidity
    let amount_with_decimals = Nat::from(amount * 1_000_000);
    if canister_balance < amount_with_decimals {
        return Err(Error::IcCdkError {
            message: format!(
                "Insufficient {} liquidity in backend canister. Available: {}, Requested: {}",
                token_name,
                nat_to_u64(canister_balance.clone()) / 1_000_000,
                amount
            ),
        });
    }

    // Check if user has enough wallet balance BEFORE transferring
    let wallet = Wallet::get(caller());
    if wallet.balance < amount as f64 {
        return Err(Error::IcCdkError {
            message: format!(
                "Insufficient wallet balance. Available: {}, Requested: {}",
                wallet.balance,
                amount
            ),
        });
    }

    // Transfer tokens from backend canister to user's address FIRST
    // This ensures if transfer fails, wallet balance is not affected
    transfer_from_ledger(
        ledger_canister,
        amount_with_decimals,
        ic_cdk::id(),
        destination_principal,
    )
    .await?;

    // Only deduct from wallet balance AFTER successful transfer
    let mut wallet = Wallet::get(caller());
    wallet
        .withdraw(
            amount as f64,
            format!("{}-{}", address.clone(), token_name),
            ExchangeType::Withdraw,
        )
        .map_err(|e| Error::IcCdkError {
            message: format!("Failed to update wallet after successful transfer: {:?}", e),
        })?;

    Ok(wallet)
}

/// Withdraw ckUSDC
#[update]
async fn withdraw_ckusdc(amount: u64, address: String) -> Result<Wallet, Error> {
    withdraw_from_ledger(CKUSDC_LEDGER, amount, address, "ckUSDC").await
}

/// Withdraw ckUSDT
#[update]
async fn withdraw_ckusdt(amount: u64, address: String) -> Result<Wallet, Error> {
    withdraw_from_ledger(CKUSDT_LEDGER, amount, address, "ckUSDT").await
}

#[update]
pub fn internal_transaction(
    amount: f64,
    receiver: String,
    _type: ExchangeType,
) -> Result<(), String> {
    // let mut wallet = Wallet::get(caller());
    let payment = CPayment {
        contract_id: "none".to_string(),
        id: ic_cdk::api::time().to_string(),
        amount,
        sender: caller(),
        receiver: Principal::from_text(receiver.clone()).unwrap(),
        date_created: ic_cdk::api::time() as f64,
        date_released: ic_cdk::api::time() as f64,
        status: PaymentStatus::Released,
        cells: vec![],
    };
    payment.pay()?;
    Ok(())

    // if wallet.balance >= amount {
    //     let new_exchange = Exchange {
    //         from: wallet.owner.clone(),
    //         to: receiver.clone(),
    //         amount,
    //         _type,
    //         date_created: ic_cdk::api::time() as f64,
    //     };
    //
    //     wallet.exchanges.push(new_exchange);
    //     wallet.balance -= amount.clone();
    //
    //     wallet.save();
    //
    //     return Ok(());
    // } else {
    //     return Err(String::from("Insufficient balance"));
    // }

    // let res = payment.pay()?;
    // return Ok(());
}
