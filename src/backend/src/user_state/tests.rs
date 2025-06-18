#[cfg(test)]
mod tests {
    use super::*;
    use candid::Principal;
    use ic_cdk::api::time;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn get_test_principal() -> Principal {
        Principal::from_text("2vxsx-fae").unwrap()
    }

    fn create_test_subscription() -> Subscription {
        Subscription {
            tier: "test".to_string(),
            start_date: time(),
            end_date: time() + 30 * 24 * 60 * 60 * 1_000_000_000, // 30 days
        }
    }

    #[test]
    fn test_user_state_creation() {
        let user_id = get_test_principal();
        let subscription = create_test_subscription();
        
        let state = create_user_state(user_id, subscription.clone());
        assert_eq!(state.subscription.tier, subscription.tier);
        assert_eq!(state.cycle_ledger.total_cycles_consumed, 0);
    }

    #[test]
    fn test_cycle_recording() {
        let user_id = get_test_principal();
        let subscription = create_test_subscription();
        
        // Create initial state
        let _ = create_user_state(user_id, subscription);
        
        // Record cycles for different operations
        record_cycles(user_id, "file_upload", 1000).unwrap();
        record_cycles(user_id, "chat_message", 500).unwrap();
        record_cycles(user_id, "file_upload", 2000).unwrap(); // Update existing operation
        
        // Test total cycles
        let total = get_total_cycles(user_id).unwrap();
        assert_eq!(total, 3000);
        
        // Test individual operation cycles
        let file_upload = get_operation_cycles(user_id, "file_upload").unwrap();
        let chat_message = get_operation_cycles(user_id, "chat_message").unwrap();
        let nonexistent = get_operation_cycles(user_id, "nonexistent").unwrap();
        
        assert_eq!(file_upload, 2000);
        assert_eq!(chat_message, 500);
        assert_eq!(nonexistent, 0);
    }

    #[test]
    fn test_nonexistent_user() {
        let user_id = get_test_principal();
        
        // Test getting cycles for nonexistent user
        let result = get_total_cycles(user_id);
        assert!(result.is_err());
        
        // Test recording cycles for nonexistent user
        let result = record_cycles(user_id, "test", 1000);
        assert!(result.is_err());
    }

    #[test]
    fn test_cycle_ledger_persistence() {
        let user_id = get_test_principal();
        let subscription = create_test_subscription();
        
        // Create initial state
        let _ = create_user_state(user_id, subscription);
        
        // Record some cycles
        record_cycles(user_id, "test", 1000).unwrap();
        
        // Get state and verify persistence
        let state = get_user_state(user_id).unwrap();
        assert_eq!(state.cycle_ledger.total_cycles_consumed, 1000);
        assert_eq!(state.cycle_ledger.operation_cycles.get("test").unwrap(), &1000);
    }
} 