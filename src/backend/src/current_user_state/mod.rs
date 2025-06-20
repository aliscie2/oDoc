use candid::{CandidType, Decode, Deserialize, Encode};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use std::borrow::Cow;

pub mod query;
pub mod types;
pub mod update;

mod tests;

type DateTime = f32;

#[derive(Clone, Debug, Deserialize, CandidType)]

pub enum Subscprtion {
    None,
    Basic(DateTime),
    Premium(DateTime),
    Custom(DateTime),
}

#[derive(Clone, Debug, Deserialize, CandidType)]

pub struct UserState {
    pub is_transfering: bool,
    pub ai_credits: f32,
    pub subscprtion: Subscprtion,
    pub is_ai_free_tier: bool,
}

impl Storable for UserState {
    fn to_bytes(&self) -> Cow<[u8]> {
        if let Ok(bytes) = Encode!(self) {
            return Cow::Owned(bytes);
        }
        Cow::Borrowed(&[])
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}
