pub mod handlers;
mod notification;

use crate::NOTIFICATIONS;
use candid::Principal;
pub use handlers::*;
use ic_cdk::caller;
use ic_cdk_macros::query;
use ic_cdk_macros::update;
pub use notification::*;

// use ic_cdk_macros::*;
use ic_websocket_cdk::{
    CanisterWsCloseArguments, CanisterWsCloseResult, CanisterWsGetMessagesArguments,
    CanisterWsGetMessagesResult, CanisterWsMessageArguments, CanisterWsMessageResult,
    CanisterWsOpenArguments, CanisterWsOpenResult, WsHandlers, WsInitParams,
};

use handlers::{on_close, on_message, on_open};
// use crate::handlers::{AppMessage, send_app_message};

// mod canister;

// Paste here the principal of the gateway obtained when running the gateway

pub fn init_websocket() {
    let handlers = WsHandlers {
        on_open: Some(on_open),
        on_message: Some(on_message),
        on_close: Some(on_close),
    };

    let params = WsInitParams::new(handlers);

    ic_websocket_cdk::init(params);
}

// #[post_upgrade]
// fn post_upgrade() {
//     init();
// }

// method called by the client to open a WS connection to the canister (relayed by the WS Gateway)
#[update]
fn ws_open(args: CanisterWsOpenArguments) -> CanisterWsOpenResult {
    ic_websocket_cdk::ws_open(args)
}

// method called by the Ws Gateway when closing the IcWebSocket connection for a client
#[update]
fn ws_close(args: CanisterWsCloseArguments) -> CanisterWsCloseResult {
    ic_websocket_cdk::ws_close(args)
}

// method called by the client to send a message to the canister (relayed by the WS Gateway)
#[update]
fn ws_message(
    args: CanisterWsMessageArguments,
    msg_type: Option<AppMessage>,
) -> CanisterWsMessageResult {
    ic_websocket_cdk::ws_message(args, msg_type)
}

// method called by the WS Gateway to get messages for all the clients it serves
#[query]
fn ws_get_messages(args: CanisterWsGetMessagesArguments) -> CanisterWsGetMessagesResult {
    ic_websocket_cdk::ws_get_messages(args)
}


#[query]
fn get_user_notifications(notifications_length: usize) -> Vec<Notification> {
    const PAGE_SIZE: usize = 15;
    
    // If user is anonymous return empty list
    if caller() == Principal::anonymous() {
        return vec![];
    }
    
    let notifications: Vec<Notification> = Notification::get_list(&caller());
    
    // If client already has all available notifications, return empty
    if notifications_length >= notifications.len() {
        return Vec::new();
    }
    
    // Calculate how many notifications to return
    let start_index = notifications_length;
    let end_index = std::cmp::min(start_index + PAGE_SIZE, notifications.len());
    
    // Get the slice starting from current length
    notifications[start_index..end_index].to_vec()
}


#[update]
fn see_notifications(ids: Vec<String>) -> Result<String, String> {
    for id in ids {
        let mut notification = Notification::get(caller().to_string(), id);
        if notification.is_none() {
            return Err("Notification not found".to_string());
        }
        let mut notification = notification.unwrap();
        if caller() == notification.receiver {
            notification.is_seen = true;
            notification.pure_save();
        }
    }

    Ok("Notification seen".to_string())
}
