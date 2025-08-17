use candid::{CandidType, Decode, Deserialize, Encode};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use serde::Serialize;
use std::borrow::Cow;

#[derive(PartialOrd, PartialEq, Clone, Debug, Serialize, CandidType, Deserialize)]
pub struct Match {
    pub score: f32, // Must be between 0.0 and 1.0
    pub job_id: String,
    pub user_id: String,
    pub missmatching_skills: Vec<String>,
    pub date_updated: f64,
    pub is_connected: bool,
    pub cover_letter: String,
}

impl Match {
    /// Validates and normalizes the match score to be between 0.0 and 1.0
    pub fn normalize_score(score: f32) -> f32 {
        if score < 0.0 {
            0.0
        } else if score <= 1.0 {
            score // Already in 0-1 range
        } else if score <= 10.0 {
            score / 10.0 // Convert from 0-10 to 0-1
        } else if score <= 100.0 {
            score / 100.0 // Convert from 0-100 to 0-1
        } else {
            1.0 // Cap at 1.0 for any value above 100
        }
    }

    /// Creates a new Match with normalized score
    pub fn new(
        score: f32,
        job_id: String,
        user_id: String,
        missmatching_skills: Vec<String>,
        date_updated: f64,
        is_connected: bool,
        cover_letter: String,
    ) -> Self {
        Self {
            score: Self::normalize_score(score),
            job_id,
            user_id,
            missmatching_skills,
            date_updated,
            is_connected,
            cover_letter,
        }
    }

    /// Validates that the score is in the correct range (0.0 to 1.0)
    pub fn is_valid_score(&self) -> bool {
        self.score >= 0.0 && self.score <= 1.0
    }
}

#[derive(PartialOrd, PartialEq, Clone, Debug, Serialize, CandidType, Deserialize)]
pub enum Category {
    Job,
    Talent,
}

#[derive(PartialOrd, PartialEq, Clone, Debug, Serialize, CandidType, Deserialize)]
pub struct Job {
    pub notification_id: String,       // Telegram id or Discord id
    pub notification_username: String, // Telegram username or Discord username
    pub id: String,
    pub user_id: String,
    pub skills: Vec<String>,
    pub education: Vec<String>,
    pub links: Vec<String>,
    pub experience: Vec<String>,
    pub certifications: Vec<String>,
    pub job_titles: Vec<String>,
    pub description: String,
    pub proficiency_level: String, // e.g., "Junior"
    pub date_created: f64,
    pub date_updated: f64,
    pub active: bool,
    pub matches: Vec<Match>,
    pub required_match_score: f32, // Must be between 0.0 and 1.0
    pub category: Category,
    pub trust_score: String,
    pub trust_note: String,
    pub emails: Vec<String>,
    pub contacts: Vec<String>,
    pub profile_completion: f64, // Must be between 0.0 and 1.0
    pub feedback: String,        // Feedback text from AI or system
}

impl Job {
    /// Validates and normalizes the required match score to be between 0.0 and 1.0
    pub fn normalize_required_match_score(score: f32) -> f32 {
        if score < 0.0 {
            0.0
        } else if score <= 1.0 {
            score // Already in 0-1 range
        } else if score <= 10.0 {
            score / 10.0 // Convert from 0-10 to 0-1
        } else if score <= 100.0 {
            score / 100.0 // Convert from 0-100 to 0-1
        } else {
            1.0 // Cap at 1.0 for any value above 100
        }
    }

    /// Sets the required match score with normalization
    pub fn set_required_match_score(&mut self, score: f32) {
        self.required_match_score = Self::normalize_required_match_score(score);
    }

    /// Validates that the required match score is in the correct range (0.0 to 1.0)
    pub fn is_valid_required_match_score(&self) -> bool {
        self.required_match_score >= 0.0 && self.required_match_score <= 1.0
    }

    /// Validates all match scores in the job
    pub fn validate_match_scores(&self) -> bool {
        self.matches.iter().all(|m| m.is_valid_score())
    }

    /// Normalizes all existing match scores to 0-1 range
    pub fn normalize_all_match_scores(&mut self) {
        for match_item in &mut self.matches {
            match_item.score = Match::normalize_score(match_item.score);
        }
    }

    /// Validates and normalizes the profile completion to be between 0.0 and 1.0
    pub fn normalize_profile_completion(completion: f64) -> f64 {
        completion.clamp(0.0, 1.0)
    }

    /// Sets the profile completion with normalization
    pub fn set_profile_completion(&mut self, completion: f64) {
        self.profile_completion = Self::normalize_profile_completion(completion);
    }

    /// Validates that the profile completion is in the correct range (0.0 to 1.0)
    pub fn is_valid_profile_completion(&self) -> bool {
        self.profile_completion >= 0.0 && self.profile_completion <= 1.0
    }
}

impl Storable for Job {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap_or_else(|_| {
            // Try to decode with old format
            #[derive(CandidType, Deserialize)]
            struct OldJob {
                notification_id: String,
                notification_username: String,
                id: String,
                user_id: String,
                skills: Vec<String>,
                education: Vec<String>,
                links: Vec<String>,
                experience: Vec<String>,
                certifications: Vec<String>,
                job_titles: Vec<String>,
                description: String,
                proficiency_level: String,
                date_created: f64,
                date_updated: f64,
                active: bool,
                matches: Vec<Match>,
                required_match_score: f32,
                category: Category,
                trust_score: String,
                trust_note: String,
                emails: Vec<String>,
                contacts: Vec<String>,
            }

            match Decode!(bytes.as_ref(), OldJob) {
                Ok(old_job) => Job {
                    notification_id: old_job.notification_id,
                    notification_username: old_job.notification_username,
                    id: old_job.id,
                    user_id: old_job.user_id,
                    skills: old_job.skills,
                    education: old_job.education,
                    links: old_job.links,
                    experience: old_job.experience,
                    certifications: old_job.certifications,
                    job_titles: old_job.job_titles,
                    description: old_job.description,
                    proficiency_level: old_job.proficiency_level,
                    date_created: old_job.date_created,
                    date_updated: old_job.date_updated,
                    active: old_job.active,
                    matches: old_job.matches,
                    required_match_score: old_job.required_match_score,
                    category: old_job.category,
                    trust_score: old_job.trust_score,
                    trust_note: old_job.trust_note,
                    emails: old_job.emails,
                    contacts: old_job.contacts,
                    profile_completion: 0.6, // Default value for new field
                    feedback: "We apologize, we made new updates to the website. The AI will provide better feedback as you talk to it.".to_string(), // Default value for new field
                },
                Err(_) => {
                    // Use default if both formats fail
                    let new_job = Job {
                        notification_id: String::new(),
                        notification_username: String::new(),
                        id: "NoneID".to_string(),
                        user_id: "NoneUserID".to_string(),
                        skills: Vec::new(),
                        education: Vec::new(),
                        links: Vec::new(),
                        experience: Vec::new(),
                        certifications: Vec::new(),
                        job_titles: Vec::new(),
                        description: String::new(),
                        proficiency_level: String::new(),
                        date_created: 0.0,
                        date_updated: 0.0,
                        active: false,
                        matches: Vec::new(),
                        required_match_score: 0.0,
                        category: Category::Job,
                        trust_score: String::new(),
                        trust_note: String::new(),
                        emails: Vec::new(),
                        contacts: Vec::new(),
                        profile_completion: 0.6, // Default value for new field
                        feedback: "We apologize, we made new updates to the website. The AI will provide better feedback as you talk to it.".to_string(), // Default value for new field
                    };
                    new_job
                }
            }
        })
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 999999,
        is_fixed_size: false,
    };
}
