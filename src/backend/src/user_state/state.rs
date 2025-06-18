use ic_stable_structures::Storable;
use std::borrow::Cow;
use std::collections::HashMap;

#[derive(Default, Clone, bincode::Encode, bincode::Decode)]
pub struct UserState {
    pub last_active: u64,
    pub is_online: bool,
    pub cycles_consumed: HashMap<String, u64>,  // operation -> cycles
    pub subscription: Option<String>,  // Add subscription field
}

impl UserState {
    pub fn new() -> Self {
        Self {
            last_active: ic_cdk::api::time(),
            is_online: false,
            cycles_consumed: HashMap::new(),
            subscription: None,
        }
    }

    #[allow(dead_code)]
    pub fn with_subscription(subscription: String) -> Self {
        Self {
            last_active: ic_cdk::api::time(),
            is_online: false,
            cycles_consumed: HashMap::new(),
            subscription: Some(subscription),
        }
    }

    pub fn record_cycles(&mut self, operation: String, cycles: u64) {
        self.cycles_consumed.insert(operation, cycles);
    }

    pub fn get_total_cycles_consumed(&self) -> u64 {
        self.cycles_consumed.values().sum()
    }

    pub fn get_operation_cycles(&self, operation: String) -> u64 {
        *self.cycles_consumed.get(&operation).unwrap_or(&0)
    }
}

impl Storable for UserState {
    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(bincode::encode_to_vec(self, bincode::config::standard()).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        bincode::decode_from_slice(&bytes, bincode::config::standard()).unwrap_or_default().0
    }
} 