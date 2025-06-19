use ic_cdk_macros::query;
use super::pallet::{Job, Category};

#[query]
fn get_my_jobs() -> Vec<Job> {
    let mut jobs = Job::get_my_jobs();
    let mut all_jobs = Vec::new();
    
    for job in jobs.iter() {
        job.matches.iter()
            .filter_map(|m| Job::get(&m.job_id))
            .for_each(|job| all_jobs.push(job));
        // let category = match job.category { Category::Talent => Category::Job, _ => Category::Talent };
        // let matching_jobs = Job::get_matches(job.skills.clone(), category);
        // all_jobs.extend(matching_jobs);
    }
    
    jobs.extend(all_jobs);
    jobs
}

// Don't get confused category is what you are looking for.
// Not what you are now.
#[query]
fn get_matches(skills: Vec<String>, category: Category) -> Vec<Job> {
    Job::get_matches(skills, category)
}