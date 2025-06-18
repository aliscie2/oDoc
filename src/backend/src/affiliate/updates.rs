use candid::Principal;
use ic_cdk::caller;
use ic_cdk_macros::*;

use crate::affiliate::{Affiliate, ReferredUser};
// Import user history related types and traits
use crate::user_history::UserHistory;

// Only have this one update function as the public API
#[update]
pub fn get_affiliate_data(id: String) -> Result<Affiliate, String> {
    let mut affiliate = get_or_create_affiliate(&id)?;
    check_and_update_users(&mut affiliate)?;
    Ok(affiliate)
}

// All helper functions are private to this module
fn get_or_create_affiliate(id: &String) -> Result<Affiliate, String> {
    let affiliate = Affiliate::get(id);
    if affiliate.is_none() {
        let new_affiliate = Affiliate::register_affiliate(id.clone());
        return Ok(new_affiliate);
    }
    return Ok(affiliate.unwrap());
}

fn check_and_update_users(affiliate: &mut Affiliate) -> Result<(), String> {
    let mut total_new_payments = 0.0;
    let mut updates_needed = false;

    for user in &mut affiliate.users {
        if let Ok(user_principal) = Principal::from_text(&user.id) {
            if let Some(payment) = process_user(&user_principal, user) {
                total_new_payments += payment;
                updates_needed = true;
            }
        }
    }

    if total_new_payments > 0.0 {
        affiliate.add_payment(total_new_payments);
    }

    if updates_needed {
        affiliate.update_trusted_users()?;
        affiliate.save()
    }

    Ok(())
}

fn process_user(principal: &Principal, user: &mut ReferredUser) -> Option<f64> {
    let user_history = UserHistory::get(*principal);
    user.trust_score = user_history.actions_rate;

    if user_history.actions_rate >= 3.0 {
        let mut _should_pay = false;

        if !user.verified {
            user.verified = true;
            _should_pay = true;
        }

        if !user.payment_processed {
            user.payment_processed = true;
            _should_pay = true;
            return Some(Affiliate::TRUSTED_USER_REWARD);
        }
    }
    None
}

pub fn add_new_referral(affiliate_id: String, user_id: String) -> Result<(), String> {
    let _caller_id = caller().to_text();
    let mut affiliate = Affiliate::get(&affiliate_id).ok_or("affiliate_id not found")?;
    if affiliate.users.iter().any(|user| user.id == user_id) {
        return Err("User already referred".to_string());
    }
    affiliate.add_referral_with_trust();
    Ok(())
}
