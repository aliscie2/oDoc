use std::collections::HashMap;

use candid::{CandidType, Deserialize, Principal};
use ic_cdk::caller;
use ic_cdk_macros::update;

use crate::files::FileNode;
use crate::files_content::ContentNode;
use crate::storage_schema::{ContentId, ContentTree, ContractId, FileId};
use crate::{CColumn, CPayment, CRow, Contract, StoredContract};
use crate::{ShareFile, FILE_CONTENTS, USER_FILES};
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
}



#[derive(Clone, Debug, Deserialize, CandidType)]
pub struct ContractUpdates {
    pub id: String,
    pub promises: Vec<CPayment>,
    pub delete_promises: Vec<String>,

    pub tables: Vec<TableUpdates>,
    pub delete_tables: Vec<String>,

}


#[update]
fn multi_updates(
    files: Vec<FileNode>,
    content_trees: Vec<HashMap<FileId, ContentTree>>,
    // contracts: Vec<StoredContract>,
    contracts_updates: Vec<ContractUpdates>,
    files_indexing: Vec<FileIndexing>,
) -> Result<String, String> {
    let mut messages = "".to_string();

    for file in files.clone() {
        file.save()?;
    }
    
    for contract_update in contracts_updates{
        let mut old_contract: StoredContract = Contract::get_contract(caller().to_string(),contract_update.id.clone())?;
        if let StoredContract::CustomContract(mut old_contract) = old_contract {
            for promise in contract_update.promises {
                let res = old_contract.updaet_or_create_promise(promise.clone())?;
                // if let Err(errors) = res {
                //     messages.push_str(&errors.to_string());
                // }
            }
            // for delete_promise in contract_update.delete_promises {
            //     let res = old_contract.delete_promise(delete_promise.clone())?;
            //     if let Err(errors) = res {
            //         messages.push_str(&errors.to_string());
            //     }
            // }
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
    Ok(messages)
}
