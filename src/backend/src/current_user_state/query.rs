use super::UserState;
use ic_cdk_macros::query;

#[query]
fn get_ai_credits() -> Result<f32, String> {
    if !UserState::is_user_exists() {
        return Err("User does not exist".to_string());
    }
    Ok(UserState::get_credits())
}

#[query]
fn is_ai_free_tier() -> Result<bool, String> {
    if !UserState::is_user_exists() {
        return Err("User does not exist".to_string());
    }
    Ok(UserState::is_free_ai())
}
