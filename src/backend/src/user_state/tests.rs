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
        let mut state = UserState::new();
        assert_eq!(state.cycles_used, 0);
        assert_eq!(state.get_total_cycles_consumed(), 0);
        assert!(state.cycles_consumed.is_empty());
    }

    #[test]
    fn test_cycle_recording() {
        let mut state = UserState::new();
        state.record_cycles("file_upload".to_string(), 1000);
        state.record_cycles("chat_message".to_string(), 500);
        state.record_cycles("file_upload".to_string(), 2000); // Update existing operation
        assert_eq!(state.get_total_cycles_consumed(), 2500);
        assert_eq!(state.get_operation_cycles("file_upload".to_string()), 2000);
        assert_eq!(state.get_operation_cycles("chat_message".to_string()), 500);
        assert_eq!(state.get_operation_cycles("nonexistent".to_string()), 0);
    }

    #[test]
    fn test_cycles_used_persistence() {
        let mut state = UserState::new();
        state.record_cycles("test".to_string(), 1000);
        let encoded = state.to_bytes();
        let decoded = UserState::from_bytes(encoded);
        assert_eq!(decoded.cycles_used, 1000);
        assert_eq!(decoded.get_operation_cycles("test".to_string()), 1000);
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