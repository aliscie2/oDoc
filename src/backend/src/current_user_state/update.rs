use ic_cdk::caller;

use super::UserState;
use candid::Principal;
use ic_cdk_macros::update;

use crate::contracts::{CPayment, PaymentStatus};

#[update]
fn buy_ai_credits(amount: f64) -> Result<(), String> {
    if caller().to_string() == Principal::anonymous().to_string() {
        return Err("Permission denied (anonymous)".to_string());
    }

    if UserState::get_credits() > 4.9 {
        return Err("You already have enough credits".to_string());
    }

    if !(1.0..=5.0).contains(&amount) {
        return Err("Amount must be in range 1 to 5".to_string());
    }

    let receiver = Principal::from_text(
        "tgwpc-6xuon-k3a6y-ey7lt-xksjs-qx22h-ikhbt-4yp3a-6stco-rymbe-pqe",
    );

    if receiver.is_err() {
        return Err("Invalid receiver".to_string());
    }

    let payment = CPayment {
        contract_id: "none".to_string(),
        id: ic_cdk::api::time().to_string(),
        amount,
        sender: caller(),
        receiver: receiver.unwrap(),
        date_created: ic_cdk::api::time() as f64,
        date_released: ic_cdk::api::time() as f64,
        status: PaymentStatus::Released,
        cells: vec![],
    };
    payment.pay()?;
    let added_amount = amount * 0.8;
    UserState::add_credits(added_amount as f32); // we take 2%
    UserState::set_free_ai(false); // we take 2%

    Ok(())
}

#[update]
fn drop_free_credits() -> Result<(), String> {
    if UserState::is_user_exists() {
        return Err("You already got free drop before".to_string());
    }
    UserState::add_credits(1.0);
    Ok(())
}
