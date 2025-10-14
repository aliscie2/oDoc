use ic_cdk_macros::query;

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
fn search_matches(skills: &[String], category: Category) -> Vec<Job> {
    let ids = if category == Category::Job {
        inverted_index::search_for_job(skills.to_owned())
    } else {
        inverted_index::search_for_talent(skills.to_owned())
    };

    let caller_id = ic_cdk::caller().to_string();
    let jobs = Job::get_jobs_by_ids(ids);

    let filtered: Vec<Job> = jobs
        .into_iter()
        .filter(|job| {
            let is_different_user = job.user_id != caller_id;
            let is_active = job.active;
            is_different_user && is_active
        })
        .collect();

    filtered
}

#[query]
fn get_matches(current_job_id: String, skills: Vec<String>, category: Category) -> Vec<Job> {
    let current_job = Job::get(&current_job_id);
    let all_matching_jobs = search_matches(&skills, category);

    let filtered_jobs: Vec<Job> = if let Some(ref curr_job) = current_job {
        all_matching_jobs
            .into_iter()
            .filter(|job| should_include_job(job, curr_job))
            .collect()
    } else {
        all_matching_jobs
    };

    filter_and_limit_jobs(filtered_jobs, &skills, current_job.as_ref())
}

fn should_include_job(job: &Job, current_job: &Job) -> bool {
    // If current job has been updated since we last matched, include all jobs again
    if let Some(existing_match) = current_job.matches.iter().find(|m| m.job_id == job.id) {
        // Re-match if: job was updated OR current job was updated (new category/skills/etc)
        job.date_updated > existing_match.date_updated
            || current_job.date_updated > existing_match.date_updated
    } else {
        true
    }
}

fn filter_and_limit_jobs(
    jobs: Vec<Job>,
    current_skills: &[String],
    _current_job: Option<&Job>,
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

fn has_good_skill_overlap(job: &Job, current_skills: &[String]) -> bool {
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
