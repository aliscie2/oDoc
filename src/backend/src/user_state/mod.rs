use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use ic_cdk::api::call;
use ic_stable_structures::{storable::Bound, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::HashMap;

mod state;
pub use state::*;

thread_local! {
    static USER_STATES: RefCell<StableBTreeMap<String, UserState>> = RefCell::new(
        StableBTreeMap::init(
            crate::MEMORY_MANAGER.with(|m| m.borrow().get(crate::MemoryId::new(10))),
        )
    );
}

pub fn get_user_state(user_id: Principal) -> Option<UserState> {
    USER_STATES.with(|states| {
        states
            .borrow()
            .get(&user_id.to_string())
    })
}

pub fn save_user_state(user_id: Principal, state: UserState) {
    USER_STATES.with(|states| {
        states
            .borrow_mut()
            .insert(user_id.to_string(), state);
    });
}

pub fn create_user_state(user_id: Principal, subscription: Subscription) -> UserState {
    let state = UserState::new(subscription);
    save_user_state(user_id, state.clone());
    state
}

pub fn record_cycles(user_id: Principal, operation: &str, cycles: u64) -> Result<(), String> {
    let mut state = get_user_state(user_id).ok_or("User state not found")?;
    state.record_cycles(operation, cycles);
    save_user_state(user_id, state);
    Ok(())
}

pub fn get_total_cycles(user_id: Principal) -> Result<u64, String> {
    let state = get_user_state(user_id).ok_or("User state not found")?;
    Ok(state.get_total_cycles_consumed())
}

pub fn get_operation_cycles(user_id: Principal, operation: &str) -> Result<u64, String> {
    let state = get_user_state(user_id).ok_or("User state not found")?;
    Ok(state.get_operation_cycles(operation))
} 