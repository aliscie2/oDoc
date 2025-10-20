use candid::{CandidType, Deserialize, Principal};
use ic_cdk::caller;

// #[macro_use]
// extern crate macros; // This imports the macro for use

// export::{
//     candid::{CandidType, Deserialize},
//     Principal,
// }

use crate::PROFILE_STORE;
use serde::Serialize;

#[derive(Eq, PartialOrd, PartialEq, Clone, Debug, Default, Serialize, CandidType, Deserialize)]
pub struct User {
    pub id: String,
    pub name: String,
    pub email: String,
    pub description: String,
    pub photo: Vec<u8>,
    // pub total_promise: f64,
    //  pub total_balance: f64
    // pub keywords: Vec<String>,
}

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct RegisterUser {
    pub name: Option<String>,
    pub description: Option<String>,
    pub photo: Option<Vec<u8>>,
    pub email: Option<String>,
    // pub keywords: Vec<String>,
}

impl User {
    pub fn get_emails() -> Vec<String> {
        PROFILE_STORE.with(|profile_store| {
            profile_store
                .borrow()
                .iter()
                .map(|(_, user)| user.email.clone())
                .collect()
        })
    }
    pub fn get_number_of_users() -> f64 {
        PROFILE_STORE.with(|profile_store| profile_store.borrow().len() as f64)
    }

    pub fn new(profile: RegisterUser) -> Self {
        let user = User {
            id: caller().to_text(),
            name: profile.name.unwrap_or_default(),
            email: profile.email.unwrap_or_default(),
            description: profile.description.unwrap_or_default(),
            photo: profile.photo.unwrap_or_default(),
        };
        let principal_id = ic_cdk::api::caller();

        PROFILE_STORE.with(|profile_store| {
            profile_store
                .borrow_mut()
                .insert(principal_id.to_text(), user.clone());
        });

        user
    }
    // Get a user from their principal
    pub fn get(principal_str: &String) -> Option<User> {
        let principal = Principal::from_text(principal_str).ok()?;
        PROFILE_STORE.with(|profile_store| {
            let store = profile_store.borrow();
            store.get(&principal.to_string())
        })
    }

    pub fn user_profile() -> Option<Self> {
        let principal_id = ic_cdk::api::caller();

        // if caller is anonymous return None
        if principal_id.to_text() == *"2vxsx-fae" {
            return None;
        }

        // get and if it is not exist then create user profile
        let user: Option<User> = PROFILE_STORE
            .with(|profile_store| profile_store.borrow().get(&principal_id.to_string()));
        // if user.is_none() {
        //     let user = User::new(RegisterUser {
        //         name: "Anonymous".to_string(),
        //         description: "Anonymous".to_string(),
        //     });
        //     return Some(user);
        // }
        user
    }

    pub fn update_profile(profile: RegisterUser) -> Self {
        let mut user = User::user_profile().unwrap();

        if let Some(name) = profile.name {
            user.name = name;
        }

        if let Some(description) = profile.description {
            user.description = description;
        }
        if let Some(email) = profile.email {
            user.email = email;
        }

        if let Some(photo) = profile.photo {
            user.photo = photo;
        }

        PROFILE_STORE.with(|profile_store| {
            profile_store
                .borrow_mut()
                .insert(caller().to_string(), user.clone());
        });
        user
    }

    pub fn user_is_registered() -> bool {
        let principal_id = ic_cdk::api::caller();
        let user: Option<User> = PROFILE_STORE
            .with(|profile_store| profile_store.borrow().get(&principal_id.to_string()));
        user.is_some()
    }

    pub fn user_name_is_duplicate(name: String) -> bool {
        PROFILE_STORE.with(|profile_store| {
            let store = profile_store.borrow();
            store
                .iter()
                .any(|(_, user)| user.name == name && user.id != caller().to_string())
        })
    }

    pub fn is_anonymous() -> bool {
        let principal_id = ic_cdk::api::caller();
        principal_id.to_text() == *"2vxsx-fae"
    }
}
