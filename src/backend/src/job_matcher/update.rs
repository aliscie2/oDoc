use crate::job_matcher::inverted_index;

use super::pallet::{Category, Job, Match};
use crate::current_user_state::UserState;
use candid::{CandidType, Deserialize, Principal};
use ic_cdk_macros::update;
use serde::Serialize;

#[derive(PartialOrd, PartialEq, Clone, Debug, Serialize, CandidType, Deserialize)]
pub struct Update {
    pub field: String,
    pub values: Vec<String>,
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

fn add_to_search(skills: &[String], job_id: &str, category: &Category) {
    if *category == Category::Job {
        inverted_index::add_new_job(skills.to_owned(), job_id.to_owned())
    } else {
        inverted_index::add_new_talent(skills.to_owned(), job_id.to_owned())
    }
}

#[derive(PartialOrd, PartialEq, Clone, Debug, Serialize, CandidType, Deserialize)]
pub struct JobUpdate {
    pub id: String,
    pub updates: Vec<Update>,
    pub active: Option<bool>,
    pub required_match_score: Option<f32>,
    pub category: Option<Category>,
}

#[derive(PartialOrd, PartialEq, Clone, Debug, Serialize, CandidType, Deserialize)]
pub struct MatchChanges {
    pub current_job_id: String,
    pub delete_matches: Vec<String>,
    pub updates: Vec<Match>,
    pub add: Vec<Match>,
    pub reset: Option<Vec<Match>>,
}

#[update]
fn update_job(updates: Vec<JobUpdate>, _ai_credits: Option<f32>) -> Result<(), String> {
    if ic_cdk::caller().to_string() == Principal::anonymous().to_string() {
        return Err("Permission denied (anonymous)".to_string());
    }

    if let Some(credits) = _ai_credits {
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

        if let Some(active) = update.active {
            job.active = active;
            needs_update = true;
        }
        if let Some(score) = update.required_match_score {
            if !(0.0..=1.0).contains(&score) {
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
    }
    Ok(())
}

#[update]
fn update_matches(match_changes: MatchChanges, _ai_credits: Option<f32>) -> Result<(), String> {
    if ic_cdk::caller().to_string() == Principal::anonymous().to_string() {
        return Err("Permission denied (anonymous)".to_string());
    }


    if let Some(credits) = _ai_credits {
        UserState::set_credits(credits);
    }

    crate::JOBS_MATCH_STORE.with(|store| {
        let mut store = store.borrow_mut();
        let mut job = store
            .get(&match_changes.current_job_id)
            .ok_or("Job not found")?;

        if job.user_id != ic_cdk::caller().to_string() {
            return Err("Permission denied (not owner)".to_string());
        }

        if let Some(reset_matches) = match_changes.reset {
            for m in &reset_matches {
                if m.score < 0.0 || m.score > 1.0 {
                    return Err("Match score must be between 0.0 and 1.0".to_string());
                }
            }
            job.matches = reset_matches;
        } else {
            job.matches
                .retain(|m| !match_changes.delete_matches.contains(&m.job_id));

            for update in match_changes.updates {
                if update.score < 0.0 || update.score > 1.0 {
                    return Err("Match score must be between 0.0 and 1.0".to_string());
                }
                if let Some(existing) = job.matches.iter_mut().find(|m| m.job_id == update.job_id) {
                    *existing = update;
                }
            }

            for add in match_changes.add {
                job.matches.retain(|m| m.job_id != add.job_id);
                job.matches.push(add);
                // if add.score < 0.0 || add.score > 1.0 {
                //     return Err("Match score must be between 0.0 and 1.0".to_string());
                // }
                // if !job.matches.iter().any(|m| m.job_id == add.job_id) {
                //     job.matches.push(add);
                // }
            }
        }

        let now = ic_cdk::api::time() as f64;
        // Only update match date_updated, NOT job.date_updated
        // Updating job.date_updated causes infinite re-matching loops
        // job.date_updated = now;

        for match_item in &job.matches {
            if let Some(mut other_job) = store.get(&match_item.job_id) {
                let reciprocal = Match {
                    score: match_item.score,
                    job_id: match_changes.current_job_id.clone(),
                    user_id: other_job.user_id.clone(),
                    missmatching_skills: match_item.missmatching_skills.clone(),
                    date_updated: now,
                    is_connected: match_item.is_connected,
                    cover_letter: match_item.cover_letter.clone(),
                };

                other_job
                    .matches
                    .retain(|m| m.job_id != match_changes.current_job_id);
                other_job.matches.push(reciprocal);
                store.insert(match_item.job_id.clone(), other_job);
            }
        }

        store.insert(match_changes.current_job_id.clone(), job);
        Ok(())
    })
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
