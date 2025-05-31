use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use ic_cdk::{caller, print};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::{BTreeMap, Storable};
use std::borrow::Cow;
use std::cell::{Ref, RefCell};
use std::collections::HashMap;
use std::sync::atomic::Ordering;
use super::{UserState,Subscprtion};
type DateTime = f32;




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

// Thread-local storage for user states
thread_local! {
    static CURRENT_USER_STATE_STORE: RefCell<HashMap<String, UserState>> = RefCell::new(HashMap::new());
}

impl UserState {
    pub fn is_transfering() -> bool {
        let current_user = caller().to_string();
        CURRENT_USER_STATE_STORE.with(|store| {
            let states = store.borrow();
            states.get(&current_user)
                .map(|state| state.is_transfering)
                .unwrap_or(false)
        })
    }

    pub fn set_is_transfering() {
        let current_user = caller().to_string();
        CURRENT_USER_STATE_STORE.with(|store| {
            let mut states = store.borrow_mut();
            let user_state = states.entry(current_user).or_insert_with(UserState::default);
            user_state.is_transfering = true;
        });
    }

    pub fn unset_is_transfering() {
        let current_user = caller().to_string();
        CURRENT_USER_STATE_STORE.with(|store| {
            let mut states = store.borrow_mut();
            let user_state = states.entry(current_user).or_insert_with(UserState::default);
            user_state.is_transfering = false;
        });
    }

    pub fn add_credits(amount: f32) {
        let current_user = caller().to_string();
        CURRENT_USER_STATE_STORE.with(|store| {
            let mut states = store.borrow_mut();
            let user_state = states.entry(current_user).or_insert_with(UserState::default);
            user_state.ai_credits += amount;
        });
    }

    pub fn set_credits(amount: f32) {
        let current_user = caller().to_string();
        CURRENT_USER_STATE_STORE.with(|store| {
            let mut states = store.borrow_mut();
            let user_state = states.entry(current_user).or_insert_with(UserState::default);
            
            user_state.ai_credits = amount;
        });
    }


    // pub fn remove_credits(amount: f32) {
    //     let current_user = caller().to_string();
    //     CURRENT_USER_STATE_STORE.with(|store| {
    //         let mut states = store.borrow_mut();
    //         let user_state = states.entry(current_user).or_insert_with(UserState::default);
            
    //         if user_state.ai_credits >= amount {
    //             user_state.ai_credits -= amount;
    //         } else {
    //             user_state.ai_credits = 0.0;
    //         }
    //     });
    // }

    // Helper method to get current user's full state
    pub fn get_current_user_state() -> UserState {
        let current_user = caller().to_string();
        CURRENT_USER_STATE_STORE.with(|store| {
            let states = store.borrow();
            states.get(&current_user)
                .cloned()
                .unwrap_or_default()
        })
    }

    // Helper method to get credits for current user
    pub fn get_credits() -> f32 {
        let current_user = caller().to_string();
        CURRENT_USER_STATE_STORE.with(|store| {
            let states = store.borrow();
            states.get(&current_user)
                .map(|state| state.ai_credits)
                .unwrap_or(0.0)
        })
    }

    // Helper method to update subscription
    pub fn set_subscription(subscription: Subscprtion) {
        let current_user = caller().to_string();
        CURRENT_USER_STATE_STORE.with(|store| {
            let mut states = store.borrow_mut();
            let user_state = states.entry(current_user).or_insert_with(UserState::default);
            user_state.subscprtion = subscription;
        });
    }


    // Check if current user exists in the store
    pub fn is_user_exists() -> bool {
        let current_user = caller().to_string();
        CURRENT_USER_STATE_STORE.with(|store| {
            let states = store.borrow();
            states.contains_key(&current_user)
        })
    }

    pub fn set_free_ai(is_free: bool) -> bool {
        let current_user = caller().to_string();
        CURRENT_USER_STATE_STORE.with(|store| {
            let mut states = store.borrow_mut();
            let user_state = states.entry(current_user).or_insert_with(UserState::default);
            user_state.is_ai_free_tier = is_free;
            is_free
        })
    }
    

    pub fn is_free_ai() -> bool {
        let current_user = caller().to_string();
        CURRENT_USER_STATE_STORE.with(|store| {
            let states = store.borrow();
            states.get(&current_user)
                .map(|state| state.is_ai_free_tier)
                .unwrap_or(false)
        })
    }
    
}