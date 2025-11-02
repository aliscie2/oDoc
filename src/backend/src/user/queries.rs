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
    use std::collections::HashMap;
    
    let key = "tgwpc-6xuon-k3a6y-ey7lt-xksjs-qx22h-ikhbt-4yp3a-6stco-rymbe-pqe".to_string();

    if caller().to_text() != key {
        return Vec::new();
    }

    const USERS_PER_PAGE: usize = 30; // Process 30 users per page
    let user_skip = (page as usize) * USERS_PER_PAGE;
    
    // Map user_id -> (email, priority) where priority: 1=Calendar, 2=Job, 3=Profile
    let mut user_emails: HashMap<String, (String, u8)> = HashMap::new();
    let mut user_ids_in_batch: Vec<String> = Vec::new();
    
    // Priority 3: Collect from PROFILE_STORE (lowest priority) - paginated by user
    PROFILE_STORE.with(|profile_store| {
        for (user_id, user) in profile_store.borrow().iter().skip(user_skip).take(USERS_PER_PAGE) {
            if !user.email.is_empty() {
                user_emails.insert(user_id.clone(), (user.email.clone(), 3));
                user_ids_in_batch.push(user_id.clone());
            }
        }
    });
    
    // If no users in this batch, return empty (signals end of pagination)
    if user_ids_in_batch.is_empty() {
        return Vec::new();
    }
    
    // Priority 2: Collect from Job (overwrite if higher priority) - only for users in this batch
    let user_ids_set: HashSet<String> = user_ids_in_batch.iter().cloned().collect();
    for (user_id, email) in Job::get_all_user_emails_with_user_id() {
        if !email.is_empty() && user_ids_set.contains(&user_id) {
            user_emails.insert(user_id, (email, 2));
        }
    }
    
    // Priority 1: Collect from Calendar (highest priority, overwrite all) - only for users in this batch
    for (user_id, email) in Calendar::get_all_user_emails_with_user_id() {
        if !email.is_empty() && user_ids_set.contains(&user_id) {
            user_emails.insert(user_id, (email, 1));
        }
    }
    
    // Extract unique emails (maintain order from PROFILE_STORE iteration)
    let mut emails: Vec<String> = Vec::new();
    let mut seen: HashSet<String> = HashSet::new();
    
    for user_id in user_ids_in_batch {
        if let Some((email, _)) = user_emails.get(&user_id) {
            if !seen.contains(email) {
                seen.insert(email.clone());
                emails.push(email.clone());
            }
        }
    }
    
    emails
}
