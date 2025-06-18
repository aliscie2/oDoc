use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use serde::Serialize;
use std::borrow::Cow;

#[derive(PartialOrd, PartialEq, Clone, Debug, Serialize, CandidType, Deserialize)]
pub struct Match {
    pub score: f32,
    pub job_id: String,
    pub user_id: String,
    pub missmatching_skills: Vec<String>,
    pub date_updated: f64,
    pub is_connected: bool,
    pub cover_letter: String,
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
    pub required_match_score: f32,
    pub category: Category,
    pub trust_score: String,
    pub trust_note: String,
    pub emails: Vec<String>,
    pub contacts: Vec<String>,
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
