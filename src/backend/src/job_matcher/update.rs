use crate::{current_user_state::UserState, job_matcher::inverted_index};

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

fn delete_from_search(id: String) {
    let curr_job = Job::get(&id);
    if let Some(job) = curr_job {
        if job.category == Category::Job {
            inverted_index::delete_job_search(job.skills, job.id)
        } else {
            inverted_index::delete_talent_search(job.skills, job.id)
        }
    }
}

fn add_to_search(skills: &Vec<String>, job_id: &String, category: &Category) {
    if *category == Category::Job {
        inverted_index::add_new_job(skills.clone(), job_id.clone())
    } else {
        inverted_index::add_new_talent(skills.clone(), job_id.clone())
    }
}

#[update]
fn update_job(updates: Vec<JobUpdate>, ai_credits: Option<f32>) -> Result<(), String> {
    if ic_cdk::caller().to_string() == Principal::anonymous().to_string() {
        return Err("Permission denied (anonymous)".to_string());
    }

    if let Some(credits) = ai_credits {
        UserState::set_credits(credits);
    }

    let caller_id = ic_cdk::caller().to_string();
    let current_time = ic_cdk::api::time() as f64;

    for update in updates {
        let mut job = Job::get(&update.id).unwrap_or_else(|| Job::new(update.id.clone()));

        if job.user_id != caller_id {
            return Err("Permission denied (not owner)".to_string());
        }

        let mut needs_update = false;

        // Process field updates
        for mut field_update in update.updates {
            if field_update.field == "skills" {
                delete_from_search(job.id.clone());
                field_update.values = field_update
                    .values
                    .into_iter()
                    .map(|s| s.to_lowercase())
                    .collect();
                let category = update.category.as_ref().unwrap_or(&job.category);
                add_to_search(&field_update.values, &job.id, category);
            }
            job.update(&field_update.field, field_update.values);
            needs_update = true;
        }

        // Handle other updates
        if let Some(active) = update.active {
            job.active = active;
            needs_update = true;
        }
        if let Some(score) = update.required_match_score {
            // Strict validation: only accept scores in 0.0-1.0 range
            if score < 0.0 || score > 1.0 {
                return Err("Required match score must be between 0.0 and 1.0".to_string());
            }
            job.required_match_score = score;
            needs_update = true;
        }
        if let Some(category) = update.category {
            job.category = category;
            needs_update = true;
        }

        if needs_update {
            job.date_updated = current_time;
            job.save();
        }

        if let Some(matches) = update.matches {
            Job::update_matches(update.id, matches)?;
        }
    }
    Ok(())
}

#[update]
fn delete_job(id: String) -> Result<(), String> {
    let jobs = Job::get_my_jobs();
    delete_from_search(id.clone());
    if jobs.len() > 1 {
        Job::delete(id.clone())?
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
