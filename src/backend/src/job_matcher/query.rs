use ic_cdk_macros::query;
use ic_cdk::caller;

use crate::job_matcher::inverted_index;

use super::pallet::{Category, Job, Match};
use candid::{CandidType, Deserialize};
use serde::Serialize;

#[derive(PartialOrd, PartialEq, Clone, Debug, Serialize, CandidType, Deserialize)]
pub struct GetJobs {
    pub jobs: Vec<Job>,
    pub matching_jobs: Vec<Job>,
}

#[query]
fn get_my_jobs() -> GetJobs {
    let jobs = Job::get_my_jobs();
    let mut matching_jobs = Vec::new();

    for job in jobs.iter() {
        let good_matches = job
            .matches
            .iter()
            .filter(|saved_match| is_match_score_good_enough(saved_match, job))
            .collect::<Vec<_>>();

        for saved_match in good_matches {
            if let Some(matched_job) = Job::get(&saved_match.job_id) {
                if matched_job.active {
                    matching_jobs.push(matched_job);
                }
            }
        }
    }

    GetJobs {
        jobs,
        matching_jobs,
    }
}

fn search_matches(skills: &Vec<String>, category: Category) -> Vec<Job> {
    let mut ids: Vec<String> = Vec::new();
    if category == Category::Job {
        ids = inverted_index::search_for_job(skills.clone())
    } else {
        ids = inverted_index::search_for_talent(skills.clone())
    }
    
    // Get jobs and filter by active status and exclude current user
    let caller_id = ic_cdk::caller().to_string();
    Job::get_jobs_by_ids(ids)
        .into_iter()
        .filter(|job| job.user_id != caller_id && job.active)
        .collect()
}

#[query]
fn get_matches(current_job_id: String, skills: Vec<String>, category: Category) -> Vec<Job> {
    let curr = Job::get(&current_job_id);
    let all_matching_jobs = search_matches(&skills, category);

    if curr.is_none() {
        return filter_and_limit_jobs(all_matching_jobs, &skills, None);
    }

    let current_job = curr.unwrap();
    
    // Filter jobs based on saved matches and update times
    let filtered_jobs: Vec<Job> = all_matching_jobs
        .into_iter()
        .filter(|job| should_include_job(job, &current_job))
        .collect();
    filter_and_limit_jobs(filtered_jobs, &skills, Some(&current_job))
}

fn should_include_job(job: &Job, current_job: &Job) -> bool {
    // Check if this job was already saved in matches
    if let Some(saved_match) = current_job.matches.iter().find(|m| m.job_id == job.id) {
        // If the job was updated after it was saved in matches, include it again
        job.date_updated > saved_match.date_updated
    } else {
        // Not in saved matches, so include it
        true
    }
}

fn filter_and_limit_jobs(
    jobs: Vec<Job>,
    current_skills: &Vec<String>,
    current_job: Option<&Job>,
) -> Vec<Job> {
    let mut filtered_jobs: Vec<Job> = jobs
        .into_iter()
        .filter(is_job_recent)
        .filter(|job| has_good_skill_overlap(job, current_skills))
        .collect();

    // Limit to 10 jobs
    if filtered_jobs.len() > 10 {
        filtered_jobs = filtered_jobs[..10].to_vec();
    }

    filtered_jobs
}

fn is_job_recent(job: &Job) -> bool {
    let fifty_days_in_nanoseconds = 50.0 * 24.0 * 60.0 * 60.0 * 1000000000.0;
    let fifty_days_ago = (ic_cdk::api::time() as f64) - fifty_days_in_nanoseconds;

    job.date_updated > fifty_days_ago
}

fn has_good_skill_overlap(job: &Job, current_skills: &Vec<String>) -> bool {
    // Count how many skills match
    let matching_skills = job
        .skills
        .iter()
        .filter(|skill| current_skills.contains(skill))
        .count();

    let current_skill_count = current_skills.len();
    let job_skill_count = job.skills.len();
    let larger_skill_count = current_skill_count.max(job_skill_count);

    if larger_skill_count == 0 {
        return false;
    }

    // Need at least 30% of skills to match
    let overlap_percentage = matching_skills as f32 / larger_skill_count as f32;
    overlap_percentage >= 0.3
}

fn is_match_score_good_enough(saved_match: &Match, job: &Job) -> bool {
    // Direct comparison since all scores are now validated to be in 0.0-1.0 range
    saved_match.score >= job.required_match_score
}

#[query]
fn get_job(job_id: String) -> Option<Job> {
    Job::get(&job_id)
}
