use ic_cdk_macros::query;
use ic_cdk::caller;




use super::pallet::{Job, Match, Category};
use ic_cdk_macros::update;
use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use serde::Serialize;


#[derive(PartialOrd, PartialEq, Clone, Debug, Serialize, CandidType, Deserialize)]
pub struct  GetJobs {
    pub jobs: Vec<Job>,
    pub matching_jobs: Vec<Job>,
}

#[query]
fn get_my_jobs() -> GetJobs {


    let mut jobs = Job::get_my_jobs();
    let mut matching_jobs = Vec::new();
    
    for job in jobs.iter() {
        job.matches.iter()
            .filter_map(|m| Job::get(&m.job_id))
            .for_each(|job| matching_jobs.push(job));
        // let category = match job.category { Category::Talent => Category::Job, _ => Category::Talent };
        // let matching_jobs = Job::get_matches(job.skills.clone(), category);
        // all_jobs.extend(matching_jobs);
    }
    
    GetJobs{
        jobs,
        matching_jobs,
    }
}

// Don't get confused category is what you are looking for.
// Not what you are now.
#[query]
fn get_matches(current_job_id:String, skills: Vec<String>, category: Category) -> Vec<Job> {
    let curr = Job::get(&current_job_id);
    let machig_jobs: Vec<Job> = Job::get_matches(skills, category);

    if curr.is_none() {
        return machig_jobs.into_iter()
        .take(10)
        .collect();;
    }
    
    let curr = curr.unwrap();
    let mut filtered_jobs = machig_jobs.iter()
       .filter(|job| {
           !curr.matches.iter().any(|m| 
               m.job_id == job.id  
               && job.date_updated >= m.date_updated
           )
       })
       .cloned()
       .collect::<Vec<Job>>();

    if filtered_jobs.len() > 10 {
        filtered_jobs = filtered_jobs[..10].to_vec();
    }
    filtered_jobs
}

//TODO
//  In the future allow users to ignore some jobs Ignore { job_id, date}
//  to filter out jobs that job.id == job_id && job.date_updated < date