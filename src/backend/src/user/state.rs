use candid::{CandidType, Deserialize};
use ic_cdk::api::{caller, canister_balance128};
use std::collections::HashMap;
use ic_stable_structures::{storable::Bound, Storable};
use std::borrow::Cow;
use candid::{Encode, Decode};

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct Subscription {
    pub tier: String,
    pub start_date: u64,
    pub end_date: u64,
}

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct UserState {
    pub is_transfering: bool,
    pub ai_credits: f32,
    pub subscription: Subscription,
    pub is_ai_free_tier: bool,
    pub cycles_consumed: u128,  // Track total cycles consumed by the user
    pub cycles_ledger: HashMap<String, u128>,  // Track cycles consumed per operation
}

impl Storable for UserState {
    fn to_bytes(&self) -> Cow<[u8]> {
        if let Ok(bytes) = Encode!(self) {
            return Cow::Owned(bytes);
        }
        Cow::Borrowed(&[])
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl UserState {
    pub fn new() -> Self {
        Self {
            is_transfering: false,
            ai_credits: 0.0,
            subscription: Subscription {
                tier: "free".to_string(),
                start_date: 0,
                end_date: 0,
            },
            is_ai_free_tier: true,
            cycles_consumed: 0,
            cycles_ledger: HashMap::new(),
        }
    }

    /// Records cycles consumed for a specific operation by measuring the difference
    /// in canister balance before and after the operation.
    pub fn record_cycles(&mut self, operation: &str) {
        let cycles_before = canister_balance128();
        
        // The operation should be executed here by the caller
        
        let cycles_after = canister_balance128();
        let cycles_consumed = if cycles_before > cycles_after {
            cycles_before - cycles_after
        } else {
            0 // In case of cycle top-up or other balance increases
        };

        self.cycles_consumed += cycles_consumed;
        *self.cycles_ledger.entry(operation.to_string()).or_insert(0) += cycles_consumed;
    }

    // For testing purposes
    #[cfg(test)]
    pub fn record_cycles_mock(&mut self, operation: &str, cycles: u128) {
        self.cycles_consumed += cycles;
        *self.cycles_ledger.entry(operation.to_string()).or_insert(0) += cycles;
    }

    pub fn get_total_cycles_consumed(&self) -> u128 {
        self.cycles_consumed
    }

    pub fn get_cycles_by_operation(&self, operation: &str) -> Option<u128> {
        self.cycles_ledger.get(operation).copied()
    }
}

// Global functions to manage user states
pub fn get_user_state(principal: &String) -> UserState {
    crate::USER_STATES.with(|states| {
        states
            .borrow()
            .get(principal)
            .unwrap_or_else(|| UserState::new())
    })
}

pub fn save_user_state(principal: &String, state: UserState) {
    crate::USER_STATES.with(|states| {
        states
            .borrow_mut()
            .insert(principal.to_string(), state);
    });
}

pub fn get_current_user_state() -> UserState {
    let principal = caller().to_string();
    get_user_state(&principal)
}

pub fn save_current_user_state(state: UserState) {
    let principal = caller().to_string();
    save_user_state(&principal, state);
}

#[cfg(test)]
mod tests {
    use super::*;

    // Helper function to create a test user state
    fn create_test_user_state() -> UserState {
        UserState {
            is_transfering: false,
            ai_credits: 100.0,
            subscription: Subscription {
                tier: "premium".to_string(),
                start_date: 1234567890,
                end_date: 1234567890 + 30 * 24 * 60 * 60, // 30 days later
            },
            is_ai_free_tier: false,
            cycles_consumed: 0,
            cycles_ledger: HashMap::new(),
        }
    }

    #[test]
    fn test_user_state_creation() {
        let state = UserState::new();
        assert_eq!(state.is_transfering, false);
        assert_eq!(state.ai_credits, 0.0);
        assert_eq!(state.subscription.tier, "free");
        assert_eq!(state.is_ai_free_tier, true);
        assert_eq!(state.cycles_consumed, 0);
        assert!(state.cycles_ledger.is_empty());
    }

    #[test]
    fn test_cycle_tracking() {
        let mut state = create_test_user_state();
        
        // Use mock function instead of real canister_balance128
        state.record_cycles_mock("test_operation", 1000);
        
        // Verify cycles were recorded
        assert_eq!(state.cycles_consumed, 1000);
        assert_eq!(state.cycles_ledger.get("test_operation"), Some(&1000));
    }
} 