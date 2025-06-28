use std::collections::HashMap;

use candid::{CandidType, Deserialize};
use ic_cdk::caller;
use ic_cdk_macros::update;

use crate::current_user_state::UserState;
use crate::files::FileNode;
use crate::files_content::ContentNode;
use crate::storage_schema::{ContentTree, FileId};
use crate::tables::ContractPermissionType;
use crate::{CColumn, CPayment, CRow, Contract, CustomContract, StoredContract};
// #[update]
// fn content_updates(file_id: FileId, content_parent_id: Option<ContentId>, new_text: String) -> Result<String, String> {
//     if FileNode::get(&file_id).is_none() {
//         return Err("No such file with this id.".to_string());
//     }
//     let parent_id: ContentId = match content_parent_id {
//         Some(id) => id,
//         None => ContentNode::new(file_id.clone(), None, String::from(""), String::from(""), None, value).unwrap().id
//     };
//     let updated_content = ContentNode::new(file_id, Some(parent_id), String::from(""), new_text, None, value);
//     Ok(format!("Content created successfully. Content ID: {}", updated_content.unwrap().id))
// }

// #[update]
// fn save_one_file(
//     file: FileNode,
//     content_tree: HashMap<FileId, ContentTree>,
//     contracts: Vec<StoredContract>,
// ) -> Result<(), String> {
//     // check permissions
//     if caller().to_string() != file.author {
//         if let Some(share_id) = file.share_id {
//             let share_file = ShareFile::get_file(share_id);
//         };
//     }
//     Ok(())
// }
#[derive(Clone, Debug, Deserialize, CandidType)]
pub struct FileIndexing {
    pub id: FileId,
    pub new_index: usize,
    pub parent: Option<FileId>,
}

#[derive(Clone, Debug, Deserialize, CandidType)]
pub struct TableUpdates {
    pub id: String,
    pub name: String,
    pub columns: Vec<CColumn>,
    pub rows: Vec<CRow>,

    pub delete_rows: Vec<String>,
    pub delete_columns: Vec<String>,

    pub columns_indexes: Vec<(usize, String)>,
    pub rows_indexes: Vec<(usize, String)>,
}

#[derive(Clone, Debug, Deserialize, CandidType)]
pub struct ContractUpdates {
    pub id: String,
    pub promises: Vec<CPayment>,
    pub delete_promises: Vec<String>,
    pub name: Option<String>,
    pub permissions: Vec<ContractPermissionType>,
    pub promises_indexes: Vec<(usize, String)>, // id of each promise
    pub tables: Vec<TableUpdates>,
    pub delete_tables: Vec<String>,
}
#[update]
fn multi_updates(
    files: Vec<FileNode>,
    content_trees: Vec<HashMap<FileId, ContentTree>>,
    contracts_updates: Vec<ContractUpdates>,
    files_indexing: Vec<FileIndexing>,
) -> Result<String, String> {
    if contracts_updates.len() > 0 {
        let res = UserState::set_is_transfering();
        // if  res not ok
        if Ok(res) = res {
        } else {
            return Err("Please wait few second, there is already a transaction going.".to_string());
        }
    }

    let mut messages = "".to_string();

    // Update or create contract
    for contract_update in contracts_updates {
        // Try multiple ways to get the existing contract
        let existing_contract = CustomContract::get(&contract_update.id, &caller().to_string())
            .or_else(|| {
                // Fallback: try the other get method
                match Contract::get_contract(caller().to_string(), contract_update.id.clone()) {
                    Some(StoredContract::CustomContract(contract)) => Some(contract),
                    _ => None,
                }
            });

        let mut curr_contract = if let Some(existing) = existing_contract {
            existing
        } else {
            // Only create new if we're sure it doesn't exist
            // AND we have promises to add (indicating this is a real new contract)
            if !contract_update.promises.is_empty() || !contract_update.tables.is_empty() {
                CustomContract {
                    id: contract_update.id.clone(),
                    name: contract_update
                        .name
                        .clone()
                        .unwrap_or_else(|| "New Contract".to_string()),
                    creator: caller().to_string(),
                    date_created: ic_cdk::api::time() as f64,
                    date_updated: ic_cdk::api::time() as f64,
                    contracts: vec![],
                    payments: vec![],
                    promises: vec![],
                    formulas: vec![],
                    permissions: vec![],
                }
            } else {
                // If we're just deleting things and can't find the contract, skip this update
                messages.push_str(&format!(
                    "Warning: Contract {} not found for update, skipping.\n",
                    contract_update.id
                ));
                continue;
            }
        };

        // Update the date_updated field
        curr_contract.date_updated = ic_cdk::api::time() as f64;

        // Process promises - update curr_contract with each result
        for promise in contract_update.promises {
            curr_contract = curr_contract.update_or_create_promise(promise)?;
        }

        // Process promise deletions
        for delete_promise in contract_update.delete_promises {
            curr_contract = curr_contract.delete_promise(delete_promise)?;
        }

        // Process table updates
        for table_update in contract_update.tables {
            curr_contract = curr_contract.update_or_create_table(table_update)?;
        }

        // Process table deletions
        for table_id in contract_update.delete_tables {
            curr_contract = curr_contract.delete_table(table_id)?;
        }

        // Reorder promises
        if !contract_update.promises_indexes.is_empty() {
            curr_contract = curr_contract.reorder_promises(contract_update.promises_indexes)?;
        }

        // Update name if provided
        if let Some(name) = contract_update.name {
            curr_contract = curr_contract.update_name(name)?;
        }

        // Update permissions
        if !contract_update.permissions.is_empty() {
            curr_contract = curr_contract.update_permissions(contract_update.permissions)?;
        }

        // Final save to ensure everything is persisted
        let res = curr_contract.save();
        let res = file.save();
        if let Err(er) = res {
            messages.push_str(&format!("contract save err: {}", er));
        }
    }

    for file in files.clone() {
        let res = file.save();
        if let Err(er) = res {
            messages.push_str(&format!("Files save err: {}", er));
        }
    }

    // Update FILE_CONTENTS
    for update in content_trees {
        for (file_id, content_tree) in update {
            ContentNode::update_file_contents(file_id, content_tree);
        }
    }

    for indexing in files_indexing {
        if let Some(parent) = indexing.parent {
            let cild_m = FileNode::rearrange_child(parent, indexing.id, indexing.new_index);
            if let Err(err) = cild_m {
                messages.push_str(&format!("Error: {}", err));
            }
        } else {
            let file_m = FileNode::rearrange_file(indexing.id, indexing.new_index);
            if let Err(err) = file_m {
                messages.push_str(&format!("Error: {}", err));
            }
        }
    }

    messages.push_str("Updates applied successfully.");
    UserState::unset_is_transfering();

    Ok(messages)
}
