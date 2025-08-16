use candid::{CandidType, Deserialize, Principal};

use crate::user::User;
use crate::FRIENDS_STORE;

use candid::{Decode, Encode};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use serde::Serialize;
use std::borrow::Cow;

#[derive(Eq, PartialOrd, PartialEq, Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct Friend {
    pub id: String,
    pub sender: User,
    pub receiver: User,
    pub confirmed: bool,
}

impl Storable for Friend {
    fn to_bytes(&self) -> Cow<[u8]> {
        if let Ok(bytes) = Encode!(self) {
            return Cow::Owned(bytes);
        }
        Cow::Borrowed(&[])
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap_or_else(|_| {
            // Try to decode with old format
            #[derive(CandidType, Deserialize)]
            struct OldUser {
                id: String,
                name: String,
                description: String,
                photo: Vec<u8>,
            }

            #[derive(CandidType, Deserialize)]
            struct OldFriend {
                id: String,
                sender: OldUser,
                receiver: OldUser,
                confirmed: bool,
            }

            match Decode!(bytes.as_ref(), OldFriend) {
                Ok(old_friend) => Friend {
                    id: old_friend.id,
                    sender: User {
                        id: old_friend.sender.id,
                        name: old_friend.sender.name,
                        email: String::new(),
                        description: old_friend.sender.description,
                        photo: old_friend.sender.photo,
                    },
                    receiver: User {
                        id: old_friend.receiver.id,
                        name: old_friend.receiver.name,
                        email: String::new(),
                        description: old_friend.receiver.description,
                        photo: old_friend.receiver.photo,
                    },
                    confirmed: old_friend.confirmed,
                },
                Err(_) => Friend {
                    id: String::new(),
                    sender: User::default(),
                    receiver: User::default(),
                    confirmed: false,
                },
            }
        })
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 999999,
        is_fixed_size: false,
    };
}

impl Friend {
    pub fn get(id: &String) -> Option<Self> {
        FRIENDS_STORE.with(|friends_store| {
            let store = friends_store.borrow();
            store.get(id)
        })
    }
    pub fn delete(&self) {
        FRIENDS_STORE.with(|friends_store| {
            let mut store = friends_store.borrow_mut();
            store.remove(&self.id);
        });
    }

    pub fn get_list(user: Principal) -> Vec<Friend> {
        FRIENDS_STORE.with(|friends_store| {
            let store = friends_store.borrow();
            store
                .iter()
                .filter_map(|(key, value)| {
                    if key.contains(&user.to_text()) {
                        let mut friend = value.clone();
                        // Ensure sender and receiver have complete data including photo
                        friend.sender = User::get(&friend.sender.id).unwrap_or(friend.sender);
                        friend.receiver = User::get(&friend.receiver.id).unwrap_or(friend.receiver);
                        Some(friend)
                    } else {
                        None
                    }
                })
                .collect()
        })
    }

    pub fn pure_save(&self) {
        FRIENDS_STORE.with(|friends_store| {
            let mut store = friends_store.borrow_mut();
            store.insert(self.id.clone(), self.clone());
        });
    }
}
