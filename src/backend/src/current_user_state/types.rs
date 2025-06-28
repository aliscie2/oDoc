use super::{Subscprtion, UserState};
use crate::wallet::error::Error;
use ic_cdk::caller;

impl Default for UserState {
    fn default() -> Self {
        Self {
            is_transfering: false,
            ai_credits: 0.0,
            subscprtion: Subscprtion::None,
            is_ai_free_tier: true,
        }
    }
}

impl UserState {
    pub fn is_transfering() -> bool {
        let current_user = caller().to_string();
        crate::CURRENT_USER_STATE_STORE.with(|store| {
            let states = store.borrow();
            states
                .get(&current_user)
                .map(|state| state.is_transfering)
                .unwrap_or(false)
        })
    }

    pub fn set_is_transfering() -> Result<(), Error> {
        if Self::is_transfering() {
            // erro ralready set

            return Err(Error::IcCdkError {
                message: format!(
                    "{:?}",
                    "Already trenasfering, please wait few seconds".to_string()
                ),
            });
        }
        let current_user = caller().to_string();
        crate::CURRENT_USER_STATE_STORE.with(|store| {
            let mut states = store.borrow_mut();
            let mut user_state = states.get(&current_user).unwrap_or_default();
            user_state.is_transfering = true;
            states.insert(current_user, user_state);
        });
        Ok(())
    }

    pub fn unset_is_transfering() {
        let current_user: String = caller().to_string();
        crate::CURRENT_USER_STATE_STORE.with(|store| {
            let mut states = store.borrow_mut();
            let mut user_state = states.get(&current_user).unwrap_or_default();
            user_state.is_transfering = false;
            states.insert(current_user, user_state);
        });
    }

    pub fn add_credits(amount: f32) {
        let current_user = caller().to_string();
        crate::CURRENT_USER_STATE_STORE.with(|store| {
            let mut states = store.borrow_mut();
            let mut user_state = states.get(&current_user).unwrap_or_default();
            user_state.ai_credits += amount;
            states.insert(current_user, user_state);
        });
    }

    pub fn set_credits(amount: f32) {
        let current_user = caller().to_string();
        crate::CURRENT_USER_STATE_STORE.with(|store| {
            let mut states = store.borrow_mut();
            let mut user_state = states.get(&current_user).unwrap_or_default();
            user_state.ai_credits = amount;
            states.insert(current_user, user_state);
        });
    }

    // Helper method to get current user's full state
    pub fn get_current_user_state() -> UserState {
        let current_user = caller().to_string();
        crate::CURRENT_USER_STATE_STORE.with(|store| {
            let states = store.borrow();
            states.get(&current_user).unwrap_or_default()
        })
    }

    // Helper method to get credits for current user
    pub fn get_credits() -> f32 {
        let current_user = caller().to_string();
        crate::CURRENT_USER_STATE_STORE.with(|store| {
            let states = store.borrow();
            states
                .get(&current_user)
                .map(|state| state.ai_credits)
                .unwrap_or(0.0)
        })
    }

    // Helper method to update subscription
    pub fn set_subscription(subscription: Subscprtion) {
        let current_user = caller().to_string();
        crate::CURRENT_USER_STATE_STORE.with(|store| {
            let mut states = store.borrow_mut();
            let mut user_state = states.get(&current_user).unwrap_or_default();
            user_state.subscprtion = subscription;
            states.insert(current_user, user_state);
        });
    }

    // Check if current user exists in the store
    pub fn is_user_exists() -> bool {
        let current_user = caller().to_string();
        crate::CURRENT_USER_STATE_STORE.with(|store| {
            let states = store.borrow();
            states.contains_key(&current_user)
        })
    }

    pub fn set_free_ai(is_free: bool) -> bool {
        let current_user = caller().to_string();
        crate::CURRENT_USER_STATE_STORE.with(|store| {
            let mut states = store.borrow_mut();
            let mut user_state = states.get(&current_user).unwrap_or_default();
            user_state.is_ai_free_tier = is_free;
            states.insert(current_user, user_state);
            is_free
        })
    }

    pub fn is_free_ai() -> bool {
        let current_user = caller().to_string();
        crate::CURRENT_USER_STATE_STORE.with(|store| {
            let states = store.borrow();
            states
                .get(&current_user)
                .map(|state| state.is_ai_free_tier)
                .unwrap_or(false)
        })
    }
}
