use ic_cdk::caller;
use ic_cdk_macros::update;

use crate::contracts::custom_contract::utils::notify_about_promise;
use crate::contracts::custom_contract::validation_promise_rules::validate_payment;
use crate::user_history::UserHistory;
use crate::websocket::PaymentAction;
use crate::CustomContract;
use crate::{CPayment, PaymentStatus, Wallet};

// #[update]
// fn release_c_payment(c_payment: CPayment) -> Result<(), String> {
//     if self.promises.contains(&c_payment) {
//         c_payment.clone().pay();
//         self.promises.retain(|payment| payment.id != c_payment.id);
//         self.payments.push(c_payment);
//         self.clone().save()?;
//         Ok(())
//     } else {
//         Err("Payment not found".to_string())
//     }
// }
#[update]
fn confirmed_c_payment(promise: CPayment) -> Result<(), String> {
    // Try to get contract from both sender and receiver perspectives
    let mut contract = CustomContract::get_for_user(promise.contract_id.clone(), promise.sender)
        .or_else(|| CustomContract::get_for_user(promise.contract_id.clone(), promise.receiver))
        .ok_or_else(|| String::from("Contract not found"))?;

    let mut promise_found = false;
    contract.promises = contract
        .promises
        .iter_mut()
        .map(|payment| {
            if payment.id == promise.id {
                promise_found = true;

                // Only the receiver can confirm a promise
                if payment.receiver != caller() {
                    return Err("Only receiver can confirm promise".to_string());
                }

                // Check if already confirmed
                if payment.status == PaymentStatus::Confirmed {
                    return Err("Already confirmed".to_string());
                }

                // Prevent confirmation of already released or cancelled promises
                match payment.status {
                    PaymentStatus::Released => {
                        return Err("Cannot confirm already released payment".to_string());
                    }
                    PaymentStatus::ConfirmedCancellation => {
                        return Err("Cannot confirm cancelled promise".to_string());
                    }
                    _ => {} // Allow confirmation for other statuses
                }

                payment.status = PaymentStatus::Confirmed;
                notify_about_promise(payment.clone(), PaymentAction::Accepted);

                let mut user_history = UserHistory::get(promise.sender);
                user_history.payment_action(payment.clone());
                user_history.save();
            }
            Ok(payment.clone())
        })
        .collect::<Result<Vec<_>, String>>()?;

    if !promise_found {
        return Err("Promise not found".to_string());
    }

    contract.save()?;
    Ok(())
}

#[update]
fn confirmed_cancellation(c_payment: CPayment) -> Result<(), String> {
    // Try to get contract from both sender and receiver perspectives
    let mut contract =
        CustomContract::get_for_user(c_payment.contract_id.clone(), c_payment.sender)
            .or_else(|| {
                CustomContract::get_for_user(c_payment.contract_id.clone(), c_payment.receiver)
            })
            .ok_or_else(|| String::from("Contract not found"))?;

    let mut promise_found = false;
    contract.promises = contract
        .promises
        .iter_mut()
        .map(|payment| {
            if payment.id == c_payment.id {
                promise_found = true;

                // Only the receiver can confirm cancellation
                if payment.receiver != caller() {
                    return Err("Only receiver can confirm cancellation".to_string());
                }

                // Check valid statuses for cancellation confirmation
                match payment.status {
                    PaymentStatus::RequestCancellation => {
                        payment.status = PaymentStatus::ConfirmedCancellation;
                        notify_about_promise(payment.clone(), PaymentAction::Cancelled);

                        let wallet = Wallet::get(c_payment.sender);
                        let _ = wallet.remove_dept(payment.id.clone());

                        let mut user_history = UserHistory::get(c_payment.sender);
                        user_history.confirm_cancellation(payment.clone());
                        user_history.save();

                        Ok(payment.clone())
                    }
                    PaymentStatus::ConfirmedCancellation => {
                        Err("Cancellation already confirmed".to_string())
                    }
                    PaymentStatus::Released => {
                        Err("Cannot cancel already released payment".to_string())
                    }
                    _ => Err("Invalid status for cancellation confirmation".to_string()),
                }
            } else {
                Ok(payment.clone())
            }
        })
        .collect::<Result<Vec<_>, String>>()?;

    if !promise_found {
        return Err("Promise not found".to_string());
    }

    contract.save()?;
    Ok(())
}

#[update]
fn approve_high_promise(c_payment: CPayment) -> Result<(), String> {
    // Try to get contract from both sender and receiver perspectives
    let mut contract =
        CustomContract::get_for_user(c_payment.contract_id.clone(), c_payment.sender)
            .or_else(|| {
                CustomContract::get_for_user(c_payment.contract_id.clone(), c_payment.receiver)
            })
            .ok_or_else(|| String::from("Contract not found"))?;

    let mut promise_found = false;
    contract.promises = contract
        .promises
        .iter_mut()
        .map(|payment| {
            if payment.id == c_payment.id {
                promise_found = true;

                // Only the receiver can approve high promise
                if payment.receiver != caller() {
                    return Err("Only receiver can approve high promise".to_string());
                }

                // Only HighPromise status can be approved
                if payment.status != PaymentStatus::HighPromise {
                    return Err("Promise is not a high promise".to_string());
                }

                payment.status = PaymentStatus::ApproveHighPromise;
                notify_about_promise(payment.clone(), PaymentAction::Accepted);

                let wallet = Wallet::get(c_payment.sender);
                let _ = wallet.add_dept(payment.amount, payment.id.clone());

                let mut user_history = UserHistory::get(c_payment.sender);
                user_history.payment_action(payment.clone());
                user_history.save();
            }
            Ok(payment.clone())
        })
        .collect::<Result<Vec<_>, String>>()?;

    if !promise_found {
        return Err("Promise not found".to_string());
    }

    contract.save()?;
    Ok(())
}

#[update]
fn object_on_cancel(c_payment: CPayment, reason: String) -> Result<(), String> {
    // Try to get contract from both sender and receiver perspectives
    let mut contract =
        CustomContract::get_for_user(c_payment.contract_id.clone(), c_payment.sender)
            .or_else(|| {
                CustomContract::get_for_user(c_payment.contract_id.clone(), c_payment.receiver)
            })
            .ok_or_else(|| String::from("Contract not found"))?;

    let mut promise_found = false;
    contract.promises = contract
        .promises
        .iter_mut()
        .map(|payment| {
            if payment.id == c_payment.id {
                promise_found = true;

                // Only the receiver can object
                if payment.receiver != caller() {
                    return Err("Only receiver can object to promise".to_string());
                }

                payment.status = PaymentStatus::Objected(reason.clone());
                notify_about_promise(payment.clone(), PaymentAction::Objected);

                let wallet = Wallet::get(c_payment.sender);
                let _ = wallet.add_dept(payment.amount, payment.id.clone());

                let mut user_history = UserHistory::get(c_payment.sender);
                user_history.payment_action(payment.clone());
                user_history.save();
            }
            Ok(payment.clone())
        })
        .collect::<Result<Vec<_>, String>>()?;

    if !promise_found {
        return Err("Promise not found".to_string());
    }

    contract.save()?;
    Ok(())
}


#[update]
fn delete_custom_contract(id: String) -> Result<(), String> {
    let contract = CustomContract::get(&id, &caller().to_string())
        .ok_or("Not found")?;
    
    contract.promises.iter()
        .try_for_each(|p| validate_payment(p, None, "delete")
            .map_err(|e| format!("Cannot delete: {}", e)))?;
    
    contract.delete()
}