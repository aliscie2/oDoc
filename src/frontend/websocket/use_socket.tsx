import { backend, canisterId } from "../../declarations/backend";
import {IcWebSocket, createWsConfig } from "ic-websocket-js";

import { SignIdentity } from "@dfinity/agent";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { _SERVICE, AppMessage } from "$/declarations/backend/backend.did";
import { RootState } from "@/redux/reducers";

function useSocket() {
  const { profile } = useSelector((state: RootState) => state.filesState);
  const dispatch = useDispatch();
  const [ws, setWs] = useState<IcWebSocket<_SERVICE, AppMessage>>();

  useEffect(() => {
    let isActive = true;

    (async () => {
      const authClient = await AuthClient.create();
      if (!(await authClient.isAuthenticated()) || !isActive) return;

      const wsConfig = createWsConfig({
        canisterId,
        canisterActor: backend,
        identity: authClient.getIdentity() as SignIdentity,
        networkUrl: import.meta.env.VITE_DFX_NETWORK !== "ic"
          ? `http://127.0.0.1:${import.meta.env.VITE_DFX_PORT || 4943}`
          : "https://icp-api.io",
      });

      const gatewayUrl = import.meta.env.VITE_DFX_NETWORK !== "ic"
        ? "ws://127.0.0.1:8080"
        : "wss://gateway.icws.io";

      const socket = new IcWebSocket(gatewayUrl, undefined, wsConfig);
      if (isActive) setWs(socket);
    })();

    return () => {
      isActive = false;
      ws?.close();
    };
  }, []);

  useEffect(() => {
    if (!ws) return;

    const handleMessage = async (event: MessageEvent) => {
  const data: AppMessage = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
  const notification = data?.notification?.[0];

  
  if (!notification?.content) return;

  const key = Object.keys(notification.content)[0];
  const { id, sender, receiver } = notification;

  if (data.text === "Delete" || key === "Unfriend") {
    dispatch({ type: "DELETE_NOTIFY", id });
    dispatch({ type: "REMOVE_FRIEND", id: sender.toText() === profile?.id ? receiver.toText() : sender.toText() });
    return;
  }

  const actions: Record<string, () => void> = {
    NewMessage: () => {
      const newMessage = notification.content.NewMessage;
      if (newMessage) {
        dispatch({ type: "ADD_NOTIFICATION", message: newMessage });
      }
    },
    FriendRequest: () => {
      dispatch({ type: "ADD_FRIEND", friend: notification.content.FriendRequest.friend });
      dispatch({ type: "NOTIFY", new_notification: notification });
    },
    SharePayment: () => {
      dispatch({ type: "UPDATE_CONTRACT", contract: notification.content.SharePayment });
    },
    AcceptFriendRequest: () => {
      dispatch({ type: "UPDATE_FRIEND", receiver: sender.toText() });
      dispatch({ type: "UPDATE_NOTE", ...notification });
    },
  };

  actions[key]?.();
};

    ws.onopen = () => {};
    ws.onmessage = handleMessage;
    ws.onclose = () => {};
    ws.onerror = () => {};

    return () => {
      ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
    };
  }, [ws, dispatch, profile]);

  return { ws };
}

export default useSocket;
