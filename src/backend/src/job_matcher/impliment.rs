use super::pallet::{Category, Job, Match};
use ic_cdk::caller;

impl Job {
    pub fn new(id: String) -> Self {
        let now = ic_cdk::api::time() as f64;

        Job {
            notification_id: String::new(),
            notification_username: String::new(),
            id,
            user_id: caller().to_string(),
            skills: Vec::new(),
            education: Vec::new(),
            experience: Vec::new(),
            certifications: Vec::new(),
            job_titles: Vec::new(),
            description: String::new(),
            proficiency_level: String::new(),
            date_created: now,
            date_updated: now,
            active: false,
            matches: Vec::new(),
            required_match_score: 0.0,
            category: Category::Job,
            links: Vec::new(),
            trust_score: String::new(),
            trust_note: String::new(),
            emails: Vec::new(),
            contacts: Vec::new(),
        }
    }

    pub fn update(&mut self, field_name: &str, data: Vec<String>) {
        match field_name {
            "skills" => self.skills = data,
            "education" => self.education = data,
            "experience" => self.experience = data,
            "certifications" => self.certifications = data,
            "job_titles" => self.job_titles = data,
            "links" => self.links = data,
            "emails" => self.emails = data,
            "contacts" => self.contacts = data,
            "description" => self.description = data[0].clone(),
            "proficiency_level" => self.proficiency_level = data[0].clone(),
            "trust_score" => self.trust_score = data[0].clone(),
            "trust_note" => self.trust_note = data[0].clone(),
            _ => (),
        }
    }

    // You are looking for a talent with these skills
    // You are looking for a job with these requried skills
    // When catagory is Talent then skills are required skills
    // When catagory is Job then skills are skills you have
    // mismatches are list of skillks required in a job but not found in talent

    pub fn get_matches(skills: Vec<String>, category: Category) -> Vec<Job> {
        crate::JOBS_MATCH_STORE.with(|store| {
            let mut matches: Vec<(usize, Job)> = store
                .borrow()
                .iter()
                .filter(|(_, job)| {
                    job.user_id != caller().to_string() && job.category == category && job.active
                }) // Added active check
                .map(|(_, job)| {
                    let mismatches = job.get_mismatches(skills.clone());
                    (mismatches.len(), job.clone())
                })
                .collect();

            // Sort by mismatch count (ascending)
            matches.sort_by(|a, b| a.0.cmp(&b.0));

            // Take top 10 and return just the jobs
            matches.into_iter().map(|(_, job)| job).collect()
        })
    }

    // fn create_matched_candidate(&self, candidate: &Job, score: f32) -> Job {
    //     let mut matched_candidate = candidate.clone();
    //     matched_candidate.matches.push(Match {
    //         score,
    //         user_id: self.user_id.clone(),
    //         matching_skills: self.skills.iter()
    //             .filter(|s| candidate.skills.contains(s))
    //             .cloned()
    //             .collect(),
    //         date_updated: SystemTime::now()
    //             .duration_since(UNIX_EPOCH)
    //             .unwrap()
    //             .as_secs(),
    //     });
    //     matched_candidate
    // }

    // fn sort_and_limit_matches(&self, mut matches: Vec<(usize, Job)>) -> Vec<Job> {
    //     matches.sort_by(|a, b| a.0.cmp(&b.0));
    //     matches.into_iter()
    //         .take(10)
    //         .map(|(_, candidate)| candidate)
    //         .collect()
    // }

    pub fn save(&self) {
        crate::JOBS_MATCH_STORE.with(|store| {
            store.borrow_mut().insert(self.id.clone(), self.clone());
        });
    }

    pub fn get_my_jobs() -> Vec<Job> {
        let caller_id = caller().to_string();
        crate::JOBS_MATCH_STORE.with(|store| {
            store
                .borrow()
                .iter()
                .filter(|(_, job)| job.user_id == caller_id)
                .map(|(_, job)| job.clone())
                .collect()
        })
    }

    pub fn get_jobs_by_ids(ids: Vec<String>) -> Vec<Job> {
        crate::JOBS_MATCH_STORE.with(|store| {
            let store = store.borrow();
            ids.into_iter()
                .filter_map(|id| store.get(&id))
                .collect()
        })
    }

    pub fn get(job_id: &String) -> Option<Job> {
        crate::JOBS_MATCH_STORE.with(|store| store.borrow().get(job_id))
    }

    pub fn clear_fields(job_id: String) -> Result<(), String> {
        crate::JOBS_MATCH_STORE.with(|store| {
            let mut store = store.borrow_mut();
            match store.get(&job_id) {
                Some(job) if job.user_id != caller().to_string() => {
                    Err("Permission denied".to_string())
                }
                Some(job) => {
                    let mut updated_job = job.clone();
                    updated_job.skills = Vec::new();
                    updated_job.education = Vec::new();
                    updated_job.experience = Vec::new();
                    updated_job.certifications = Vec::new();
                    updated_job.job_titles = Vec::new();
                    updated_job.description = String::new();
                    updated_job.proficiency_level = String::new();
                    updated_job.contacts = Vec::new();
                    updated_job.active = false;
                    updated_job.required_match_score = 0.0;
                    updated_job.date_updated = ic_cdk::api::time() as f64;
                    updated_job.matches = Vec::new();
                    updated_job.active = false;
                    store.insert(job_id, updated_job);
                    Ok(())
                }
                None => Err("Job not found".to_string()),
            }
        })
    }

    pub fn delete(job_id: String) -> Result<(), String> {
        crate::JOBS_MATCH_STORE.with(|store| {
            let mut store = store.borrow_mut();
            match store.get(&job_id) {
                Some(job) if job.user_id != caller().to_string() => {
                    Err("Permission denied".to_string())
                }
                Some(_) => {
                    store.remove(&job_id);
                    Ok(())
                }
                None => Err("Job not found".to_string()),
            }
        })
    }

    pub fn get_mismatches(&self, skills: Vec<String>) -> Vec<String> {
        match self.category {
            Category::Job => self
                .skills
                .iter()
                .filter(|skill| !skills.contains(skill))
                .cloned()
                .collect(),

            Category::Talent => skills
                .iter()
                .filter(|skill| !self.skills.contains(skill))
                .cloned()
                .collect(),
        }
    }

    pub fn update_matches(job_id: String, matches: Vec<Match>) -> Result<(), String> {
        crate::JOBS_MATCH_STORE.with(|store| {
            let mut store = store.borrow_mut();

            // Get the job we're updating matches for
            let mut job = match store.get(&job_id) {
                Some(j) => j.clone(),
                None => return Err("Job not found".to_string()),
            };

            // Update the job's matches
            job.matches = matches;
            // job.date_updated = ic_cdk::api::time() as f64;

            // Save the updated job
            store.insert(job_id.clone(), job.clone());

            // Create reciprocal matches for other jobs
            for match_item in &job.matches {
                if let Some(mut other_job) = store.get(&match_item.job_id) {
                    // Create reciprocal match
                    let reciprocal_match = Match {
                        score: match_item.score,
                        job_id: job_id.clone(),
                        user_id: job.user_id.clone(),
                        missmatching_skills: match_item.missmatching_skills.clone(),
                        date_updated: ic_cdk::api::time() as f64,
                        is_connected: match_item.is_connected,
                        cover_letter: match_item.cover_letter.clone(),
                    };

                    // Remove existing match if it exists
                    other_job.matches.retain(|m| m.job_id != job_id);

                    // Add the new reciprocal match
                    // other_job.date_updated = ic_cdk::api::time() as f64;
                    other_job.matches.push(reciprocal_match);

                    // Save the other job
                    store.insert(match_item.job_id.clone(), other_job);
                }
            }

            Ok(())
        })
    }

    pub fn get_all_user_emails() -> Vec<String> {
        crate::JOBS_MATCH_STORE.with(|store| {
            store
                .borrow()
                .iter()
                .filter_map(|(_, job)| {
                    // Only get the first email if the vector is not empty
                    if !job.emails.is_empty() {
                        Some(job.emails[0].clone())
                    } else {
                        None // Skip users with empty emails
                    }
                })
                .collect()
        })
    }
    pub fn get_jobs_count() -> usize {
        crate::JOBS_MATCH_STORE.with(|store| {
            store
                .borrow()
                .iter()
                .filter(|(_, job)| job.category == Category::Job)
                .count()
        })
    }

    pub fn get_talents_count() -> usize {
        crate::JOBS_MATCH_STORE.with(|store| {
            store
                .borrow()
                .iter()
                .filter(|(_, job)| job.category == Category::Talent)
                .count()
        })
    }
}
