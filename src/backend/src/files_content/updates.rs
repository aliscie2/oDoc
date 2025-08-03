use std::collections::HashMap;

use candid::{CandidType, Deserialize};
use ic_cdk::caller;
use ic_cdk_macros::update;

use crate::current_user_state::types::TransferGuard;
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
    let _guard = if !contracts_updates.is_empty() {
        Some(TransferGuard::new().map_err(|e| format!("{:?}", e))?)
    } else {
        None
    };

    let mut messages = String::new();

    for contract_update in contracts_updates {
        let existing_contract = CustomContract::get(&contract_update.id, &caller().to_string())
            .or_else(|| {
                match Contract::get_contract(caller().to_string(), contract_update.id.clone()) {
                    Some(StoredContract::CustomContract(contract)) => Some(contract),
                    _ => None,
                }
            });

        let mut curr_contract = if let Some(existing) = existing_contract {
            existing
        } else if !contract_update.promises.is_empty() || !contract_update.tables.is_empty() {
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
            messages.push_str(&format!(
                "Warning: Contract {} not found for update, skipping.\n",
                contract_update.id
            ));
            continue;
        };

        curr_contract.date_updated = ic_cdk::api::time() as f64;

        for promise in contract_update.promises {
            curr_contract = curr_contract.update_or_create_promise(promise)?;
        }

        for delete_promise in contract_update.delete_promises {
            curr_contract = curr_contract.delete_promise(delete_promise)?;
        }

        for table_update in contract_update.tables {
            curr_contract = curr_contract.update_or_create_table(table_update)?;
        }

        for table_id in contract_update.delete_tables {
            curr_contract = curr_contract.delete_table(table_id)?;
        }

        if !contract_update.promises_indexes.is_empty() {
            curr_contract = curr_contract.reorder_promises(contract_update.promises_indexes)?;
        }

        if let Some(name) = contract_update.name {
            curr_contract = curr_contract.update_name(name)?;
        }

        if !contract_update.permissions.is_empty() {
            curr_contract = curr_contract.update_permissions(contract_update.permissions)?;
        }

        if let Err(er) = curr_contract.save() {
            messages.push_str(&format!("contract save err: {}", er));
        }
    }

    for file in files {
        if let Err(er) = file.save() {
            messages.push_str(&format!("Files save err: {}", er));
        }
    }

    for update in content_trees {
        for (file_id, content_tree) in update {
            ContentNode::update_file_contents(file_id, content_tree);
        }
    }

    for indexing in files_indexing {
        let result = if let Some(parent) = indexing.parent {
            FileNode::rearrange_child(parent, indexing.id, indexing.new_index)
        } else {
            FileNode::rearrange_file(indexing.id, indexing.new_index)
        };

        if let Err(err) = result {
            messages.push_str(&format!("Error: {}", err));
        }
    }

    messages.push_str("Updates applied successfully.");
    Ok(messages)
}
