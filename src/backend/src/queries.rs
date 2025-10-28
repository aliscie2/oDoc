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
    pub confirmed: bool,
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
                confirmed: friend.confirmed,
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
    latest_jobs: Vec<Job>,
    latest_talents: Vec<Job>,
}

#[query]
fn get_sns_status() -> Result<SNSStatus, String> {
    let number_users = User::get_number_of_users();
    let active_users = UserHistory::get_number_of_active_users();
    let talents_count = Job::get_talents_count() as f64;
    let jobs_count = Job::get_jobs_count() as f64;
    let latest_jobs = Job::get_latest_jobs(3);
    let latest_talents = Job::get_latest_talents(3);
    Ok(SNSStatus {
        number_users,
        active_users,
        talents_count,
        jobs_count,
        latest_jobs,
        latest_talents,
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

// Pagination endpoints for loading more data
#[query]
fn get_friends_paginated(skip: usize, limit: usize) -> Vec<FEFriend> {
    let friends = Friend::get_list_paginated(caller(), skip, limit);
    convert_friends_to_fe_friends(friends)
}

#[query]
fn get_friends_count() -> usize {
    Friend::get_count(caller())
}

#[query]
fn get_contracts_paginated(skip: usize, limit: usize) -> HashMap<ContractId, StoredContract> {
    Contract::get_contracts_paginated(skip, limit)
}

#[query]
fn get_contracts_count() -> usize {
    Contract::get_contracts_count()
}

// Wallet pagination endpoints
#[query]
fn get_wallet_exchanges(skip: usize, limit: usize) -> Vec<crate::wallet::Exchange> {
    Wallet::get_exchanges_paginated(caller(), skip, limit)
}

#[query]
fn get_wallet_exchanges_count() -> usize {
    Wallet::get_exchanges_count(caller())
}

#[query]
fn get_wallet_debts(skip: usize, limit: usize) -> std::collections::HashMap<String, f64> {
    Wallet::get_debts_paginated(caller(), skip, limit)
}

#[query]
fn get_wallet_debts_count() -> usize {
    Wallet::get_debts_count(caller())
}

#[query]
fn get_initial_data() -> Result<InitialData, String> {
    let profile = User::user_profile();

    if profile.is_none() {
        return Err("Anonymous user.".to_string());
    }

    let mut profile = profile.unwrap();
    if profile.photo.len() > 500000 {
        profile.photo = Vec::new()
    };
    
    // Get first 3 contracts only
    let contracts = Contract::get_contracts_paginated(0, 3);
    
    // Get first 10 friends only
    let friends: Vec<Friend> = Friend::get_list_paginated(caller(), 0, 10);
    let friends: Vec<FEFriend> = convert_friends_to_fe_friends(friends);
    
    // Get wallet summary without exchanges/debts (load separately)
    // Returns empty wallet if user doesn't have one yet (will be created on first transaction)
    let wallet = Wallet::get_summary(caller()).unwrap_or_else(|| Wallet {
        owner: caller().to_string(),
        balance: 0.0,
        debts: Default::default(),
        total_debt: 0.0,
        exchanges: vec![],
        received: 0.0,
        spent: 0.0,
    });
    
    let initial_data = InitialData {
        profile,
        friends,
        contracts,
        wallet,
    };
    
    Ok(initial_data)
}
