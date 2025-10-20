use crate::{
    contracts::{CPayment, PaymentStatus},
    Wallet,
};
use ic_cdk::caller;

pub struct ValidationRule {
    pub name: &'static str,
    pub validator: fn(&CPayment, Option<&CPayment>) -> Result<(), String>,
    pub actions: &'static [&'static str],
}

impl ValidationRule {
    pub fn applies_to_action(&self, action: &str) -> bool {
        self.actions.contains(&action)
    }

    pub fn validate(
        &self,
        payment: &CPayment,
        old_payment: Option<&CPayment>,
    ) -> Result<(), String> {
        (self.validator)(payment, old_payment)
    }
}

pub const VALIDATION_RULES: &[ValidationRule] = &[
    ValidationRule {
        name: "sender_receiver_not_same",
        validator: |payment, _| {
            if payment.sender == payment.receiver {
                Err("Sender and receiver cannot be the same person".to_string())
            } else {
                Ok(())
            }
        },
        actions: &["create", "update"],
    },
    ValidationRule {
        name: "sender_can_release",
        validator: |payment, _| {
            if matches!(payment.status, PaymentStatus::Released) && payment.sender != caller() {
                Err("Only sender can release payment".to_string())
            } else {
                Ok(())
            }
        },
        actions: &["create", "update"],
    },
    ValidationRule {
        name: "receiver_can_confirm",
        validator: |payment, _| {
            if matches!(payment.status, PaymentStatus::Confirmed) && payment.receiver != caller() {
                Err("Only receiver can confirm payment".to_string())
            } else {
                Ok(())
            }
        },
        actions: &["update"],
    },
    ValidationRule {
        name: "receiver_can_approve",
        validator: |payment, _| {
            if matches!(payment.status, PaymentStatus::ApproveHighPromise)
                && payment.receiver != caller()
            {
                Err("Only receiver can approve high promise".to_string())
            } else {
                Ok(())
            }
        },
        actions: &["update"],
    },
    ValidationRule {
        name: "receiver_can_object",
        validator: |payment, _| {
            if matches!(payment.status, PaymentStatus::Objected(_)) && payment.receiver != caller()
            {
                Err("Only receiver can object to payment".to_string())
            } else {
                Ok(())
            }
        },
        actions: &["update"],
    },
    ValidationRule {
        name: "sender_can_request_cancellation",
        validator: |payment, old_payment| {
            if matches!(payment.status, PaymentStatus::RequestCancellation) {
                if payment.sender != caller() {
                    return Err("Only sender can request cancellation".to_string());
                }
                if let Some(old) = old_payment {
                    if !matches!(
                        old.status,
                        PaymentStatus::Confirmed | PaymentStatus::ApproveHighPromise
                    ) {
                        return Err(
                            "You can only request cancellation for confirmed or approved promises"
                                .to_string(),
                        );
                    }
                }
            }
            Ok(())
        },
        actions: &["update"],
    },
    ValidationRule {
        name: "receiver_can_confirm_cancellation",
        validator: |payment, _| {
            if matches!(payment.status, PaymentStatus::ConfirmedCancellation)
                && payment.receiver != caller()
            {
                Err("Only receiver can confirm cancellation".to_string())
            } else {
                Ok(())
            }
        },
        actions: &["update"],
    },
    ValidationRule {
        name: "sender_can_create_high_promise",
        validator: |payment, _| {
            if matches!(payment.status, PaymentStatus::HighPromise) && payment.sender != caller() {
                Err("Only sender can create high promise".to_string())
            } else {
                Ok(())
            }
        },
        actions: &["create", "update"],
    },
    ValidationRule {
        name: "sender_can_delete_own",
        validator: |payment, _| {
            if payment.sender != caller() {
                Err("You can only delete your own promises".to_string())
            } else {
                Ok(())
            }
        },
        actions: &["delete"],
    },
    ValidationRule {
        name: "no_update_objected_promise",
        validator: |payment, old_payment| {
            if let Some(old) = old_payment {
                if matches!(old.status, PaymentStatus::Objected(_)) && payment.sender == caller() {
                    return Err(
                        "Cannot update objected promises. Only receiver can resolve objections"
                            .to_string(),
                    );
                }
            }
            Ok(())
        },
        actions: &["update"],
    },
    ValidationRule {
        name: "no_delete_objected",
        validator: |payment, _| {
            if matches!(payment.status, PaymentStatus::Objected(_)) {
                Err("Cannot delete objected promises. Resolve objection first".to_string())
            } else {
                Ok(())
            }
        },
        actions: &["delete"],
    },
    ValidationRule {
        name: "no_update_cancellation_requested",
        validator: |payment, old_payment| {
            if let Some(old) = old_payment {
                if matches!(old.status, PaymentStatus::RequestCancellation)
                    && payment.sender == caller()
                {
                    // Allow status change to Released (sender fulfilling promise instead of canceling)
                    if !matches!(payment.status, PaymentStatus::Released) {
                        return Err("Cannot update promise with pending cancellation request. Wait for receiver's response or release the payment".to_string());
                    }
                }
            }
            Ok(())
        },
        actions: &["update"],
    },
    ValidationRule {
        name: "no_delete_cancellation_requested",
        validator: |payment, _| {
            if matches!(payment.status, PaymentStatus::RequestCancellation) {
                Err("Cannot delete promise with pending cancellation request. Wait for receiver's response".to_string())
            } else {
                Ok(())
            }
        },
        actions: &["delete"],
    },
    ValidationRule {
        name: "no_update_confirmed_by_sender",
        validator: |payment, old_payment| {
            if let Some(old) = old_payment {
                if matches!(
                    old.status,
                    PaymentStatus::Confirmed | PaymentStatus::ApproveHighPromise
                ) && payment.sender == caller()
                {
                    // Allow only status changes to RequestCancellation or Released
                    if !matches!(
                        payment.status,
                        PaymentStatus::RequestCancellation | PaymentStatus::Released
                    ) {
                        return Err("Cannot update confirmed promises. Only status change to cancellation request or release is allowed".to_string());
                    }
                }
            }
            Ok(())
        },
        actions: &["update"],
    },
    ValidationRule {
        name: "no_delete_confirmed",
        validator: |payment, _| {
            if matches!(
                payment.status,
                PaymentStatus::Confirmed | PaymentStatus::ApproveHighPromise
            ) {
                Err(
                    "Cannot delete confirmed promises. Use cancellation process instead"
                        .to_string(),
                )
            } else {
                Ok(())
            }
        },
        actions: &["delete"],
    },
    ValidationRule {
        name: "no_delete_released",
        validator: |payment, _| {
            if matches!(payment.status, PaymentStatus::Released) {
                Err("Released payments cannot be deleted".to_string())
            } else {
                Ok(())
            }
        },
        actions: &["delete"],
    },
    ValidationRule {
        name: "sufficient_balance",
        validator: |payment, _| {
            let sender_wallet: Wallet = Wallet::get(payment.sender);
            if payment.amount > sender_wallet.balance {
                Err("Insufficient balance".to_string())
            } else {
                Ok(())
            }
        },
        actions: &["create", "update"],
    },
];

pub fn validate_payment(
    payment: &CPayment,
    old_payment: Option<&CPayment>,
    action: &str,
) -> Result<(), String> {
    for rule in VALIDATION_RULES {
        if rule.applies_to_action(action) {
            rule.validate(payment, old_payment)?;
        }
    }
    Ok(())
}

// Helper function to get rules for a specific action (for debugging/inspection)
pub fn get_rules_for_action(action: &str) -> Vec<&'static ValidationRule> {
    VALIDATION_RULES
        .iter()
        .filter(|rule| rule.applies_to_action(action))
        .collect()
}
