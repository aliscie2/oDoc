use candid::Principal;

// use std::collections::{BTreeMap, HashMap};
use std::collections::btree_map::BTreeMap;
use std::collections::HashMap;

use crate::chat::{Chat, Message};
use crate::discover::Post;
use crate::files::FileNode;
use crate::files_content::ContentNode;
use crate::friends::Friend;
use crate::{ShareFile, StoredContract, Wallet};
// use crate::friends::FriendSystem;
use crate::user::User;
use crate::user_history::UserHistory;
use crate::websocket::Notification;
use crate::workspaces::types::WorkSpace;

use candid::{CandidType, Decode, Deserialize, Encode};
use ic_stable_structures::memory_manager::VirtualMemory;
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, Storable};

use std::borrow::Cow;

#[allow(dead_code)]
type Memory = VirtualMemory<DefaultMemoryImpl>;

impl Storable for User {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
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

            match Decode!(bytes.as_ref(), OldUser) {
                Ok(old_user) => User {
                    id: old_user.id,
                    name: old_user.name,
                    email: String::new(), // Default value for new field
                    description: old_user.description,
                    photo: old_user.photo,
                },
                Err(_) => {
                    let mut new_user = User::default();
                    new_user.name = "NoneName".to_string();
                    new_user.id = "NoneID".to_string();
                    return new_user;
                } // Use default if both formats fail
            }
        })
    }
    const BOUND: Bound = Bound::Bounded {
        max_size: 999999,
        is_fixed_size: false,
    };
}

//---------- TODO Maybe  no need for FileId, ShareContractId, ShareRequestId,... etc ---------- \\
//            pub type StringId = String;

pub type FileId = String;
#[allow(dead_code)]
pub type PostId = String;
pub type ContentId = String;
pub type ContentTree = Vec<ContentNode>;
pub type ContractId = String;
#[allow(dead_code)]
pub type ShareContractId = String;
#[allow(dead_code)]
pub type ShareRequestId = String;
#[allow(dead_code)]
pub type ShareId = String;
pub type UserId = String;

// Stores types
// pub type IdStore = BTreeMap<String, Principal>;
// pub type ProfileStore = BTreeMap<Principal, User>;
#[allow(dead_code)]
pub type ProfileHistoryStore = BTreeMap<String, UserHistory>;
#[allow(dead_code)]
pub type FriendsStore = BTreeMap<Principal, Vec<Friend>>;
// pub type FilesStore = BTreeMap<Principal, HashMap<FileId, FileNode>>;
#[allow(dead_code)]
pub type FilesStore = BTreeMap<Principal, Vec<FileNode>>;
#[allow(dead_code)]
pub type FileContentsStore = BTreeMap<Principal, HashMap<FileId, ContentTree>>;
#[allow(dead_code)]
pub type ContractStore = BTreeMap<Principal, HashMap<ContractId, StoredContract>>;
// pub type FilesShareStore = BTreeMap<ShareId, ShareFile>;
#[allow(dead_code)]
pub type WalletStore = BTreeMap<String, Wallet>;
#[allow(dead_code)]
pub type UserNotifications = BTreeMap<Principal, Vec<Notification>>;
#[allow(dead_code)]
pub type PostsStore = BTreeMap<PostId, Post>;
#[allow(dead_code)]
pub type SharedUserFiles = BTreeMap<Principal, Vec<ShareFile>>;

#[allow(dead_code)]
pub type ChatsStore = Vec<Chat>;
#[allow(dead_code)]
pub type ChatsNotificationStore = BTreeMap<Principal, Vec<Message>>;
#[allow(dead_code)]
pub type MyChatsStore = BTreeMap<Principal, Vec<String>>;
#[allow(dead_code)]
pub type WorkSpacesStore = Vec<WorkSpace>;
