use crate::chat::{Chat, Message};
use crate::discover::UserFE;
use crate::user::User;
use crate::websocket::{AppMessage, Notification};
use crate::workspaces::WorkSpace;
use candid::{CandidType, Deserialize, Principal};
use ic_cdk_macros::query;

#[derive(Clone, Debug, Deserialize, CandidType)]
pub struct FEChat {
    // FE == FrontEnd
    pub id: String,
    pub name: String,
    // this used only for groups
    pub admins: Vec<UserFE>,
    // for private chats both users are admonish and members will be empty
    pub members: Vec<Principal>,
    // this used only for groups
    pub messages: Vec<Message>,
    pub creator: UserFE,
    pub workspaces: Vec<String>,
}

#[query]
fn get_my_chats(chats_length: usize) -> Vec<FEChat> {
    const PAGE_SIZE: usize = 15;
    
    let chats: Vec<Chat> = Chat::get_my_chats();
    
    // If client already has all available chats, return empty
    if chats_length >= chats.len() {
        return Vec::new();
    }
    
    // Calculate how many chats to return
    let start_index = chats_length;
    let end_index = std::cmp::min(start_index + PAGE_SIZE, chats.len());
    
    // Get the slice starting from current length
    let page_chats = &chats[start_index..end_index];
    
    let mut fe_chats: Vec<FEChat> = Vec::new();

    for chat in page_chats {
        let creator_user = match User::get_user_from_principal(chat.creator) {
            Some(user) => user,
            None => continue, // Skip this chat if user is not found
        };
        let creator_fe_user = UserFE {
            id: creator_user.id,
            name: creator_user.name,
        };

        let admins_fe: Vec<UserFE> = chat
            .admins
            .iter()
            .filter_map(|admin_principal| User::get_user_from_principal(*admin_principal))
            .map(|admin_user| UserFE {
                id: admin_user.id,
                name: admin_user.name,
            })
            .collect();

        let fe_chat = FEChat {
            id: chat.id.clone(),
            name: chat.name.clone(),
            admins: admins_fe,
            members: chat.members.clone(),
            messages: chat.messages.clone(),
            creator: creator_fe_user,
            workspaces: chat.workspaces.clone(),
        };

        fe_chats.push(fe_chat);
    }

    fe_chats
}

#[query]
fn load_more_messages(chat_id: String, messages_length: usize) -> Vec<Message> {
    Chat::load_more_messages(chat_id, messages_length)
}


// #[query]
// fn get_chats_notifications() -> Vec<Message> {
//     Chat::get_notifications()
// }
