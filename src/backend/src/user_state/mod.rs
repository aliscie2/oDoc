use candid::Principal;
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use std::cell::RefCell;

mod state;
use state::UserState;

thread_local! {
    static USER_STATE_STORE: RefCell<StableBTreeMap<Principal, UserState, DefaultMemoryImpl>> = RefCell::new(
        StableBTreeMap::init(DefaultMemoryImpl::default())
    );
}

pub fn update_user_state(principal: Principal, is_online: bool) {
    USER_STATE_STORE.with(|store| {
        let mut store = store.borrow_mut();
        let mut state = store.get(&principal).unwrap_or_else(|| UserState::new());
        state.is_online = is_online;
        state.last_active = ic_cdk::api::time();
        store.insert(principal, state);
    });
}

pub fn get_user_state(principal: Principal) -> Option<UserState> {
    USER_STATE_STORE.with(|store| {
        store.borrow().get(&principal)
    })
}

pub fn record_user_cycles(principal: Principal, operation: &str, cycles: u64) -> Result<(), String> {
    USER_STATE_STORE.with(|store| {
        let mut store = store.borrow_mut();
        let mut state = store.get(&principal).unwrap_or_else(|| UserState::new());
        state.record_cycles(operation.to_string(), cycles);
        store.insert(principal, state);
    });
    Ok(())
}

pub fn get_user_total_cycles(principal: Principal) -> Result<u64, String> {
    USER_STATE_STORE.with(|store| {
        let store = store.borrow();
        let state = store.get(&principal).unwrap_or_else(|| UserState::new());
        Ok(state.get_total_cycles_consumed())
    })
}

pub fn get_user_operation_cycles(principal: Principal, operation: &str) -> Result<u64, String> {
    USER_STATE_STORE.with(|store| {
        let store = store.borrow();
        let state = store.get(&principal).unwrap_or_else(|| UserState::new());
        Ok(state.get_operation_cycles(operation.to_string()))
    })
}

pub fn create_user_state(user_id: Principal, _subscription: String) -> UserState {
    let state = UserState::new();
    save_user_state(user_id, state.clone());
    state
}

fn save_user_state(user_id: Principal, state: UserState) {
    USER_STATE_STORE.with(|store| {
        store.borrow_mut().insert(user_id, state);
    });
} 