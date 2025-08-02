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
    };
    if let Some(credits) = ai_credits {
        UserState::set_credits(credits);
    }

    let updates: Vec<JobUpdate> = updates
        .into_iter()
        .map(|mut update| {
            update.updates = update
                .updates
                .into_iter()
                .map(|mut u| {
                    if u.field == "skills" {
                        u.values = u.values.into_iter().map(|s| s.to_lowercase()).collect();
                    }
                    u
                })
                .collect();
            update
        })
        .collect();

    for update in updates {
        let mut job = match Job::get(&update.id) {
            Some(job) => job,
            None => Job::new(update.id.clone()),
        };

        if job.user_id != ic_cdk::caller().to_string() {
            return Err("Permission denied (not aowner)".to_string());
        }

        let mut job_updated = !update.updates.is_empty();

        for d in update.updates {
            if &d.field == "skills" {
                delete_from_search(job.id.clone());
                let category = update.category.as_ref().unwrap_or(&job.category);
                add_to_search(&d.values, &job.id, category);
            }
            job.update(&d.field, d.values);
        }

        if let Some(active) = update.active {
            job.active = active;
            job_updated = true;
        }
        if let Some(score) = update.required_match_score {
            job.required_match_score = score;
            job_updated = true;
        }
        if let Some(category) = update.category.clone() {
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
