use crate::chat::{Chat, Message};
use ic_cdk_macros::query;

#[query]
fn get_my_chats(chats_length: usize) -> Vec<Chat> {
    const PAGE_SIZE: usize = 15;

    // Use paginated method to avoid loading all chats
    let total_count = Chat::get_my_chats_count();

    // If client already has all available chats, return empty
    if chats_length >= total_count {
        return Vec::new();
    }

    // Get only the next page of chats
    Chat::get_my_chats_paginated(chats_length, PAGE_SIZE)
}

#[query]
fn load_more_messages(chat_id: String, messages_length: usize) -> Vec<Message> {
    Chat::load_more_messages(chat_id, messages_length)
}

// #[query]
// fn get_chats_notifications() -> Vec<Message> {
//     Chat::get_notifications()
// }
