use candid::Principal;
use ic_cdk_macros::update;
use crate::user_state::record_cycles;

#[update]
fn record_cycles(operation: String, cycles: u64) -> Result<(), String> {
    let caller = ic_cdk::caller();
    record_cycles(caller, &operation, cycles)
} 