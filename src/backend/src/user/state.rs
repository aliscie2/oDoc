use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use ic_cdk::api::call;
use ic_stable_structures::{storable::Bound, Storable};
use std::borrow::Cow;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Subscription {
    pub tier: String,
    pub start_date: u64,
    pub end_date: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct CycleLedger {
    pub total_cycles_consumed: u64,
    pub operation_cycles: HashMap<String, u64>,
    pub last_updated: u64,
}

impl Default for CycleLedger {
    fn default() -> Self {
        Self {
            total_cycles_consumed: 0,
            operation_cycles: HashMap::new(),
            last_updated: ic_cdk::api::time(),
        }
    }
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UserState {
    pub is_transfering: bool,
    pub ai_credits: f32,
    pub subscription: Subscription,
    pub is_ai_free_tier: bool,
    pub cycle_ledger: CycleLedger,
}

impl Storable for UserState {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 999999,
        is_fixed_size: false,
    };
}

impl UserState {
    pub fn new(subscription: Subscription) -> Self {
        Self {
            is_transfering: false,
            ai_credits: 0.0,
            subscription,
            is_ai_free_tier: true,
            cycle_ledger: CycleLedger::default(),
        }
    }

    pub fn record_cycles(&mut self, operation: &str, cycles: u64) {
        self.cycle_ledger.total_cycles_consumed += cycles;
        self.cycle_ledger.operation_cycles.insert(operation.to_string(), cycles);
        self.cycle_ledger.last_updated = ic_cdk::api::time();
    }

    pub fn get_operation_cycles(&self, operation: &str) -> u64 {
        *self.cycle_ledger.operation_cycles.get(operation).unwrap_or(&0)
    }

    pub fn get_total_cycles_consumed(&self) -> u64 {
        self.cycle_ledger.total_cycles_consumed
    }
} 