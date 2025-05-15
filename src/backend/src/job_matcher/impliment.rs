// use super::pallet::{Job, Match, Category};
// use std::time::{SystemTime, UNIX_EPOCH};
// use ic_cdk::caller;

// impl Job {
//     pub fn new(
//         notification_id: String,
//         notification_username: String,
//         id: String,
//         user_id: String,
//         skills: Vec<String>,
//         education: Vec<String>,
//         experience: Vec<String>,
//         certifications: Vec<String>,
//         job_titles: Vec<String>,
//         description: String,
//         proficiency_level: String,
//         active: bool,
//         required_match_score: f32,
//         category: Category,
//     ) -> Result<Self, String> {
//         // Check existing jobs count based on category
//         crate::JOBS_MATCH_STORE.with(|store| {
//             let store = store.borrow();
//             let user_jobs_count = store.iter()
//                 .filter(|(_, job)| job.user_id == user_id && job.category == category)
//                 .count();

//             match category {
//                 Category::Talent if user_jobs_count >= 1 => {
//                     Err("User can only have one Talent profile".to_string())
//                 },
//                 Category::Job if user_jobs_count >= 3 => {
//                     Err("User can only have up to 3 Job posts".to_string())
//                 },
//                 _ => Ok(())
//             }
//         });

//         let now = SystemTime::now()
//             .duration_since(UNIX_EPOCH)
//             .unwrap()
//             .as_secs();

//         Ok(Job {
//             notification_id,
//             notification_username,
//             id,
//             user_id,
//             skills,
//             education,
//             experience,
//             certifications,
//             job_titles,
//             descrption: description,
//             proficiency_level,
//             date_created: now,
//             date_updated: now,
//             active,
//             matches: Vec::new(),
//             required_match_score,
//             category,
//         })
//     }

//     pub fn update(&mut self, field_name: &str, data: String) {
//         self.date_updated = SystemTime::now()
//             .duration_since(UNIX_EPOCH)
//             .unwrap()
//             .as_secs();

//         match field_name {
//             "skills" => self.skills = vec![data],
//             "education" => self.education = vec![data],
//             "experience" => self.experience = vec![data],
//             "certifications" => self.certifications = vec![data],
//             "job_titles" => self.job_titles = vec![data],
//             "description" => self.descrption = data,
//             "proficiency_level" => self.proficiency_level = data,
//             "active" => self.active = data.parse().unwrap_or(false),
//             "required_match_score" => self.required_match_score = data.parse().unwrap_or(0.0),
//             _ => (),
//         }
//     }

//     pub fn get_matches(&self) -> Vec<Job> {
//         let mut matches = Vec::new();

//         crate::JOBS_MATCH_STORE.with(|store| {
//             let store = store.borrow();

//             for (_, candidate) in store.iter().filter(|(_, c)| c.category != self.category) {
//                 if let Some(matched_candidate) = self.process_candidate(&candidate) {
//                     matches.push(matched_candidate);
//                 }
//             }
//         });

//         self.sort_and_limit_matches(matches)
//     }

//     fn process_candidate(&self, candidate: &Job) -> Option<(usize, Job)> {
//         if self.user_id == candidate.user_id {
//             return None;
//         }

//         let mismatches = self.calculate_mismatches(
//             matches!(self.category, Category::Talent),
//             candidate
//         );
//         let score = self.calculate_match_score(&mismatches);

//         if score >= self.required_match_score {
//             Some((mismatches.len(), self.create_matched_candidate(candidate, score)))
//         } else {
//             None
//         }
//     }

//     fn calculate_mismatches(&self, search_for_jobs: bool, candidate: &Job) -> Vec<String> {
//         if search_for_jobs {
//             self.skills.iter()
//                 .filter(|skill| !candidate.skills.contains(skill))
//                 .cloned()
//                 .collect()
//         } else {
//             candidate.skills.iter()
//                 .filter(|skill| !self.skills.contains(skill))
//                 .cloned()
//                 .collect()
//         }
//     }

//     fn calculate_match_score(&self, mismatches: &[String]) -> f32 {
//         1.0 - (mismatches.len() as f32 / self.skills.len().max(1) as f32)
//     }

//     fn create_matched_candidate(&self, candidate: &Job, score: f32) -> Job {
//         let mut matched_candidate = candidate.clone();
//         matched_candidate.matches.push(Match {
//             score,
//             user_id: self.user_id.clone(),
//             matching_skills: self.skills.iter()
//                 .filter(|s| candidate.skills.contains(s))
//                 .cloned()
//                 .collect(),
//             date_updated: SystemTime::now()
//                 .duration_since(UNIX_EPOCH)
//                 .unwrap()
//                 .as_secs(),
//         });
//         matched_candidate
//     }

//     fn sort_and_limit_matches(&self, mut matches: Vec<(usize, Job)>) -> Vec<Job> {
//         matches.sort_by(|a, b| a.0.cmp(&b.0));
//         matches.into_iter()
//             .take(10)
//             .map(|(_, candidate)| candidate)
//             .collect()
//     }

//     pub fn save(&self) {
//         crate::JOBS_MATCH_STORE.with(|store| {
//             store.borrow_mut().insert(self.id.clone(), self.clone());
//         });
//     }
// }
