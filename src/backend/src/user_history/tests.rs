use super::types::Rating;
use candid::Principal;

#[test]
fn test_calic() {
    let rating: Rating = Rating {
        id: "1".to_string(),
        rating: 5.0,
        comment: "good".to_string(),
        user_id: Principal::anonymous(),
        date: 0.0,
    };
    let total_rate: Vec<Rating> = vec![rating.clone(), rating.clone()];
    let total_actions_rate: Vec<Rating> = vec![];

    let total_rate_sum: f64 = total_rate.iter().map(|r| r.rating as f64).sum();
    let total_actions_rate_sum: f64 = total_actions_rate.iter().map(|r| r.rating as f64).sum();

    let others_rate = total_rate_sum / total_rate.len() as f64;

    // Check if total__actions_rate is not empty before performing the division
    let actions_rate = if total_actions_rate.is_empty() {
        0.0
    } else {
        total_actions_rate_sum / total_actions_rate.len() as f64
    };

    println!("others_rate: {:?}", others_rate);
    println!(
        "total_rate: {:?}",
        (others_rate * 0.4) + (actions_rate * 0.6)
    );
    // user.save();
}
