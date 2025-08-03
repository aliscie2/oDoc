use crate::ckusdc_index_types::GetTransactions;
use crate::current_user_state::types::TransferGuard;
use crate::current_user_state::UserState;
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

async fn get_user_balance() -> Result<Nat, String> {
    let args = Account {
        owner: caller(),
        subaccount: None,
    };
    let res = ic_cdk::call::<(Account,), (Nat,)>(
        Principal::from_text("xevnm-gaaaa-aaaar-qafnq-cai").unwrap(),
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

async fn get_fee() -> Nat {
    let res = ic_cdk::call::<(), (Nat,)>(
        Principal::from_text("xevnm-gaaaa-aaaar-qafnq-cai").unwrap(),
        "icrc1_fee",
        (),
    )
    .await
    .map_err(|(_, message)| Error::IcCdkError { message });
    res.unwrap().0
}

#[update]
async fn check_external_transactions(max_results: Nat) -> Result<GetTransactions, Error> {
    let args = GetAccountTransactionsArgs {
        max_results,
        start: None,
        account: Index_Account {
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

async fn transfer_from(amount: Nat, from: Principal, to: Principal) -> Result<BlockIndex, Error> {
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
        Principal::from_text("xevnm-gaaaa-aaaar-qafnq-cai").unwrap(),
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

// #[update]
// async fn get_local_balance() -> Result<Nat, String> {
//     get_user_balance().await
// }

#[update]
async fn deposit_ckusdt() -> Result<Wallet, Error> {
    let _guard = TransferGuard::new()?;
    let mut wallet = Wallet::get(caller());
    let balance = get_user_balance().await.map_err(|e| Error::IcCdkError {
        message: format!("{:?}", e),
    })?;

    if balance <= 3000000_u64 {
        return Err(Error::IcCdkError {
            message: "Minimum deposit should be 0.1 USD".to_string(),
        });
    }

    let fee = get_fee().await;
    transfer_from(balance - fee.clone(), caller(), ic_cdk::id()).await?;
    wallet
        .deposit(
            nat_to_u64((balance - fee) / Nat::from(1000000_u64)) as f64,
            "ExternalWallet".to_string(),
            ExchangeType::Deposit,
        )
        .map_err(|e| Error::IcCdkError {
            message: format!("{:?}", e),
        })?;

    Ok(wallet)
}

#[update]
async fn withdraw_ckusdt(amount: u64, address: String) -> Result<Wallet, Error> {
    let _guard = TransferGuard::new()?;
    let balance = get_user_balance().await.map_err(|e| Error::IcCdkError {
        message: format!("{:?}", e),
    })?;

    let mut wallet = Wallet::get(caller());
    wallet
        .withdraw(amount as f64, address.clone(), ExchangeType::Withdraw)
        .map_err(|e| Error::IcCdkError {
            message: format!("wallet error: {:?}", e),
        })?;

    if amount >= balance {
        transfer_from(
            Nat::from(amount * 1000000),
            ic_cdk::id(),
            Principal::from_text(address).unwrap(),
        )
        .await?;
    }
    Ok(wallet)
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
