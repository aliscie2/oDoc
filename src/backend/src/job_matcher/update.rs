
use super::pallet::{Job, Match, Category};
use ic_cdk_macros::update;
use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use serde::Serialize;


#[derive(PartialOrd, PartialEq, Clone, Debug, Serialize, CandidType, Deserialize)]
pub struct JobUpdate {
    pub updates: Vec<(String, String)>,
    pub active: Option<bool>,
    pub required_match_score: Option<f32>,
    pub category: Option<Category>,
    pub matches: Option<Vec<Match>>,
}


#[update]
fn update_job(id: String, update: JobUpdate) -> Result<(), String> {
    let mut job = match Job::get(&id) {
        Some(job) => job,
        None => return Err("Job not found".to_string()),
    };

    if job.user_id != ic_cdk::caller().to_string() {
        return Err("Permission denied".to_string());
    }

    // Handle regular field updates
    for (field, data) in update.updates {
        job.update(&field, data);
    }

    // Handle optional fields
    if let Some(active) = update.active {
        job.active = active;
    }

    if let Some(score) = update.required_match_score {
        job.required_match_score = score;
    }

    // Handle category update
    if let Some(category) = update.category {
        job.category = category;
    }

    // Handle matches update
    if let Some(matches) = update.matches {
        Job::update_matches(id.clone(), matches)?;
    }

    job.save();
    Ok(())
}

#[update]
fn delete_job(id: String) -> Result<(), String> {
    let jobs = Job::get_my_jobs();
    if jobs.len() >1 {
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
