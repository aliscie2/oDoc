use crate::chat::{Chat, Message};
use crate::discover::UserFE;
use crate::user::User;
use candid::{CandidType, Deserialize, Principal};
use ic_cdk_macros::query;



#[query]
fn get_my_chats(chats_length: usize) -> Vec<Chat> {
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
    page_chats.to_vec()
}

#[query]
fn load_more_messages(chat_id: String, messages_length: usize) -> Vec<Message> {
    Chat::load_more_messages(chat_id, messages_length)
}

// #[query]
// fn get_chats_notifications() -> Vec<Message> {
//     Chat::get_notifications()
// }
