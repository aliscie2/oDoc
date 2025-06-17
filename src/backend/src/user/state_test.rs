#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn get_current_time() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
    }

    #[test]
    fn test_user_state_creation() {
        let subscription = Subscription {
            tier: "basic".to_string(),
            start_date: get_current_time(),
            end_date: get_current_time() + 30 * 24 * 60 * 60, // 30 days
        };

        let user_state = UserState::new(subscription.clone());
        assert_eq!(user_state.is_transfering, false);
        assert_eq!(user_state.ai_credits, 0.0);
        assert_eq!(user_state.subscription.tier, subscription.tier);
        assert_eq!(user_state.is_ai_free_tier, true);
        assert_eq!(user_state.cycle_ledger.total_cycles_consumed, 0);
        assert!(user_state.cycle_ledger.operation_cycles.is_empty());
    }

    #[test]
    fn test_cycle_recording() {
        let subscription = Subscription {
            tier: "basic".to_string(),
            start_date: get_current_time(),
            end_date: get_current_time() + 30 * 24 * 60 * 60,
        };

        let mut user_state = UserState::new(subscription);

        // Record cycles for different operations
        user_state.record_cycles("file_upload", 1000);
        user_state.record_cycles("chat_message", 500);
        user_state.record_cycles("file_upload", 2000); // Update existing operation

        // Test total cycles
        assert_eq!(user_state.get_total_cycles_consumed(), 3000);

        // Test individual operation cycles
        assert_eq!(user_state.get_operation_cycles("file_upload"), 2000);
        assert_eq!(user_state.get_operation_cycles("chat_message"), 500);
        assert_eq!(user_state.get_operation_cycles("nonexistent"), 0);
    }

    #[test]
    fn test_cycle_ledger_serialization() {
        let subscription = Subscription {
            tier: "basic".to_string(),
            start_date: get_current_time(),
            end_date: get_current_time() + 30 * 24 * 60 * 60,
        };

        let mut user_state = UserState::new(subscription);
        user_state.record_cycles("test_operation", 1000);

        // Test serialization
        let bytes = user_state.to_bytes();
        let deserialized = UserState::from_bytes(bytes);

        assert_eq!(deserialized.get_total_cycles_consumed(), 1000);
        assert_eq!(deserialized.get_operation_cycles("test_operation"), 1000);
    }
} 