use crate::current_user_state::UserState;

use super::pallet::{Category, Job, Match};
use candid::{CandidType, Deserialize, Principal};
use ic_cdk_macros::update;
use serde::Serialize;

#[derive(PartialOrd, PartialEq, Clone, Debug, Serialize, CandidType, Deserialize)]
pub struct Update {
    pub field: String,
    pub values: Vec<String>,
}

#[derive(PartialOrd, PartialEq, Clone, Debug, Serialize, CandidType, Deserialize)]
pub struct JobUpdate {
    pub id: String,
    pub updates: Vec<Update>,
    // pub updates: Vec<(String, Vec<String>)>,
    pub active: Option<bool>,
    pub required_match_score: Option<f32>,
    pub category: Option<Category>,
    pub matches: Option<Vec<Match>>,
}

#[update]
fn update_job(updates: Vec<JobUpdate>, ai_credits: Option<f32>) -> Result<(), String> {
    if ic_cdk::caller().to_string() == Principal::anonymous().to_string() {
        return Err("Permission denied (anonymous)".to_string());
    };
    // TODO this can be a security isssue.
    if let Some(credits) = ai_credits {
        UserState::set_credits(credits);
    }

    for update in updates {
        let mut job = match Job::get(&update.id) {
            Some(job) => job,
            None => Job::new(update.id.clone()),
        };

        if job.user_id != ic_cdk::caller().to_string() {
            return Err("Permission denied (not aowner)".to_string());
        }

        let mut job_updated = update.updates.len() > 0;

        // Handle regular field updates
        for d in update.updates {
            job.update(&d.field, d.values);
        }

        // Handle optional fields using if let chains
        if let Some(active) = update.active {
            job.active = active;
            job_updated = true;
        }
        if let Some(score) = update.required_match_score {
            job.required_match_score = score;
            job_updated = true;
        }
        if let Some(category) = update.category {
            job.category = category;
            job_updated = true;
        }

        if job_updated {
            job.date_updated = ic_cdk::api::time() as f64;
        }

        job.save();

        if let Some(matches) = update.matches {
            Job::update_matches(update.id.clone(), matches)?;
        }
    }
    Ok(())
}

#[update]
fn delete_job(id: String) -> Result<(), String> {
    let jobs = Job::get_my_jobs();
    if jobs.len() > 1 {
        Job::delete(id)?
    } else {
        Job::clear_fields(id)?
    }
    Ok(())
}

// #[update]
// fn set_telegram_code(notification_id:String){
//     // First chack caller is not anonymus
//     // From crate::JOBS_MATCH_STORE.with find job with user_id == caller().to_string()
//     // Then set job.notification_id =notification_id
// }

// #[update]
// fn verify_telegram_code(code:String, notification_id:String,notification_username:String,){
//     // First chack caller is not anonymus
//     // From crate::JOBS_MATCH_STORE.with find job with user_id == caller().to_string()
//     // Then set job.notification_id =notification_id
// }
