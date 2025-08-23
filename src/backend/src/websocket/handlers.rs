use candid::{encode_one, CandidType};
use ic_cdk::{api::time, caller, print, println};
use ic_websocket_cdk::{
    send, ClientPrincipal, OnCloseCallbackArgs, OnMessageCallbackArgs, OnOpenCallbackArgs,
};
use serde::Deserialize;

use crate::websocket::Notification;

#[derive(CandidType, Clone, Debug, Deserialize, PartialEq)]
pub struct AppMessage {
    pub notification: Option<Notification>,
    pub text: String,
    pub timestamp: u64,
}

impl AppMessage {
    fn candid_serialize(&self) -> Vec<u8> {
        encode_one(self).unwrap()
    }
}

pub fn on_open(_: OnOpenCallbackArgs) {
    let msg = AppMessage {
        notification: None,
        text: String::from("Connection is open"),
        timestamp: time(),
    };

    send_app_message(caller(), msg);
}

pub fn on_message(args: OnMessageCallbackArgs) {
    let new_msg = AppMessage {
        notification: None,
        text: String::from("on_message is sent"),
        timestamp: time(),
    };
    send_app_message(args.client_principal, new_msg)
}

pub fn send_app_message(client_principal: ClientPrincipal, msg: AppMessage) {
    let _ = send(client_principal, msg.candid_serialize());
}

pub fn on_close(args: OnCloseCallbackArgs) {
    print(format!("Client {} disconnected", args.client_principal));
}
