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
}

impl Storable for Job {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 999999,
        is_fixed_size: false,
    };
}
