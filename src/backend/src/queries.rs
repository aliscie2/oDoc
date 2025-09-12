use std::collections::HashMap;

use candid::{CandidType, Deserialize};
use ic_cdk::caller;
use ic_cdk_macros::query;

use crate::contracts::Contract;
use crate::files::FileNode;
use crate::files_content::ContentNode;
use crate::friends::Friend;
use crate::job_matcher::pallet::Job;
use crate::storage_schema::{ContentTree, ContractId, FileId};
use crate::user::User;
use crate::user_history::UserHistory;
use crate::{StoredContract, Wallet};

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct FEFriend {
    pub id: String,
    pub name: String,
    pub email: String,
    pub description: String,
    pub photo: Vec<u8>,
    pub is_sender: bool,
}

fn convert_friends_to_fe_friends(friends: Vec<Friend>) -> Vec<FEFriend> {
    friends
        .into_iter()
        .filter_map(|friend| {
            let current_caller: String = caller().to_string();
            let is_sender = current_caller == friend.sender.id;

            // Choose the other user's data (not the current caller)
            let user_data = if is_sender {
                &friend.receiver
            } else {
                &friend.sender
            };

            // Prevent duplication: skip if friend's ID equals caller's ID
            if user_data.id == current_caller {
                return None;
            }

            // Clean up photo if too large
            let photo = if user_data.photo.len() > 500000 {
                Vec::new()
            } else {
                user_data.photo.clone()
            };

            Some(FEFriend {
                id: user_data.id.clone(),
                name: user_data.name.clone(),
                email: user_data.email.clone(),
                description: user_data.description.clone(),
                photo,
                is_sender,
            })
        })
        .collect()
}

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct InitialData {
    profile: User,
    friends: Vec<FEFriend>,
    // DiscoverUsers: HashMap<String, User>,
    contracts: HashMap<ContractId, StoredContract>,
    wallet: Wallet,
}

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct SNSStatus {
    number_users: f64,
    active_users: f64,
    talents_count: f64,
    jobs_count: f64,
}

#[query]
fn get_sns_status() -> Result<SNSStatus, String> {
    let number_users = User::get_number_of_users();
    let active_users = UserHistory::get_number_of_active_users();
    let talents_count = Job::get_talents_count() as f64;
    let jobs_count = Job::get_jobs_count() as f64;
    Ok(SNSStatus {
        number_users,
        active_users,
        talents_count,
        jobs_count,
    })
}

#[query]
fn get_contract(author: String, contract_id: String) -> Result<StoredContract, String> {
    let contract = Contract::get_contract(author.clone(), contract_id.clone());
    if let Some(contract) = contract {
        return Ok(contract);
    }

    Err("Invalid principal.".to_string())
}

#[query]
fn get_more_files(page: f32) -> (Vec<FileNode>, HashMap<FileId, ContentTree>) {
    let files = FileNode::get_page_files(page);
    let files_contents: HashMap<FileId, ContentTree> = ContentNode::get_page_files_content(page);
    (files, files_contents)
}

#[query]
fn get_initial_data() -> Result<InitialData, String> {
    let profile = User::user_profile();

    if profile.is_none() {
        return Err("Anonymous user.".to_string());
    }

    let contracts: HashMap<ContractId, StoredContract> =
        Contract::get_all_contracts().unwrap_or_default();
    let mut profile = profile.unwrap();
    if profile.photo.len() > 500000 {
        profile.photo = Vec::new()
    };
    let friends: Vec<Friend> = Friend::get_list(caller());
    let friends: Vec<FEFriend> = convert_friends_to_fe_friends(friends);
    let initial_data = InitialData {
        profile,
        friends,
        contracts,
        wallet: Wallet::get(caller()),
    };
    Ok(initial_data)
}
