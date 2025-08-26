#[test]
fn test_calic() {
    use crate::user_history::types::Rating;
    use candid::Principal;
    let rating: Rating = Rating {
        id: "1".to_string(),
        rating: 5.0,
        comment: "good".to_string(),
        user_id: Principal::anonymous(),
        date: 0.0,
    };
    let total_rate: Vec<Rating> = vec![rating.clone(), rating.clone()];
    let total_actions_rate: Vec<Rating> = vec![];

    let total_rate_sum: f64 = total_rate.iter().map(|r| r.rating).sum();
    let total_actions_rate_sum: f64 = total_actions_rate.iter().map(|r| r.rating).sum();

    let _others_rate = total_rate_sum / total_rate.len() as f64;

    // Check if total__actions_rate is not empty before performing the division
    let _actions_rate = if total_actions_rate.is_empty() {
        0.0
    } else {
        total_actions_rate_sum / total_actions_rate.len() as f64
    };

    // user.save();
}
