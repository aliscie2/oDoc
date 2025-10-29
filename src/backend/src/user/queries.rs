use candid::types::principal::PrincipalError;
use candid::Principal;
use ic_cdk::caller;

// use ic_cdk_macros::query;
use ic_cdk_macros::query;

use crate::calendar::Calendar;
use crate::job_matcher::pallet::Job;
use crate::user::User;
use crate::PROFILE_STORE;
use std::collections::HashSet;

//
// #[query(name = "getSelf")]
// fn get_self() -> Profile {
//     let id = ic_cdk::api::caller();
//     PROFILE_STORE.with(|profile_store| {
//         profile_store
//             .borrow()
//             .get(&id)
//             .cloned().unwrap_or_default()
//     })
// }
//
//
// #[query]
// fn get(name: String) -> Profile {
//     ID_STORE.with(|id_store| {
//         PROFILE_STORE.with(|profile_store| {
//             id_store
//                 .borrow()
//                 .get(&name)
//                 .and_then(|id| profile_store.borrow().get(id).cloned()).unwrap_or_default()
//         })
//     })
// }

//
// #[query(manual_reply = true)]
// fn search(text: String) -> ManualReply<Option<Profile>> {
//     let text = text.to_lowercase();
//     PROFILE_STORE.with(|profile_store| {
//         for (_, p) in profile_store.borrow().iter() {
//             if p.name.to_lowercase().contains(&text) || p.description.to_lowercase().contains(&text)
//             {
//                 return ManualReply::one(Some(p));
//             }
//
//             // for x in p.keywords.iter() {
//             //     if x.to_lowercase() == text {
//             //         return ManualReply::one(Some(p));
//             //     }
//             // }
//         }
//         ManualReply::one(None::<Profile>)
//     })
// }

// get all users

// #[query]
// fn get_all_users() -> HashMap<String, User> {
//     PROFILE_STORE.with(|profile_store| {
//         profile_store
//             .borrow()
//             .iter()
//             .map(|(principal, user)| (principal.clone(), user.clone()))
//             .map(|(principal, user)| (principal.to_string(), user))
//             .collect()
//     })
// }

#[query]
fn get_user(usd_id: String) -> Result<User, String> {
    let user: Result<Principal, PrincipalError> = Principal::from_text(usd_id);

    if user.is_err() {
        return Err("Invalid principal.".to_string());
    };

    let user: Option<User> =
        PROFILE_STORE.with(|profile_store| profile_store.borrow().get(&user.unwrap().to_string()));

    if let Some(user) = user {
        return Ok(user);
    }
    Err("User not found.".to_string())
}

#[query]
fn get_users() -> f64 {
    User::get_number_of_users()
}

#[query]
fn get_emails(page: u32) -> Vec<String> {
    let key = "tgwpc-6xuon-k3a6y-ey7lt-xksjs-qx22h-ikhbt-4yp3a-6stco-rymbe-pqe".to_string();

    if caller().to_text() != key {
        return Vec::new();
    }

    const PAGE_SIZE: usize = 30;
    let skip = (page as usize) * PAGE_SIZE;

    // Collect emails in a memory-efficient way using iterators
    let mut all_emails = Vec::new();
    
    // Get user emails from PROFILE_STORE with pagination to prevent overflow
    PROFILE_STORE.with(|profile_store| {
        all_emails.extend(
            profile_store
                .borrow()
                .iter()
                .map(|(_, user)| user.email.clone())
                .filter(|email| !email.is_empty())
        );
    });
    
    // Get calendar emails
    all_emails.extend(Calendar::get_all_user_emails());
    
    // Get job emails
    all_emails.extend(Job::get_all_user_emails());

    // Remove duplicates and empty strings
    let unique_emails: HashSet<String> = all_emails
        .into_iter()
        .filter(|email| !email.is_empty())
        .collect();
    
    let mut emails: Vec<String> = unique_emails.into_iter().collect();
    
    // Sort for consistent pagination across calls
    emails.sort();
    
    // Return paginated results
    emails.into_iter().skip(skip).take(PAGE_SIZE).collect()
}
