use candid::Principal;
use ic_cdk_macros::query;
use crate::user_state::{get_total_cycles, get_operation_cycles};

#[query]
fn get_total_cycles() -> Result<u64, String> {
    let caller = ic_cdk::caller();
    get_total_cycles(caller)
}

#[query]
fn get_operation_cycles(operation: String) -> Result<u64, String> {
    let caller = ic_cdk::caller();
    get_operation_cycles(caller, &operation)
} 