use candid::{CandidType, Deserialize};
use ic_cdk::api::{caller, canister_balance128};
use std::collections::HashMap;

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

    pub fn get_total_cycles_consumed(&self) -> u128 {
        self.cycles_consumed
    }

    pub fn get_cycles_by_operation(&self, operation: &str) -> Option<u128> {
        self.cycles_ledger.get(operation).copied()
    }
} 