import { backend, canisterId } from "../../declarations/backend";
import { IcWebSocket, createWsConfig } from "ic-websocket-js";

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
        networkUrl:
          import.meta.env.VITE_DFX_NETWORK !== "ic"
            ? `http://127.0.0.1:${import.meta.env.VITE_DFX_PORT || 4943}`
            : "https://icp-api.io",
      });

      const gatewayUrl =
        import.meta.env.VITE_DFX_NETWORK !== "ic"
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
      console.log({ event });
      const data: AppMessage =
        typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      const notification = data?.notification?.[0];

      if (!notification?.content) return;

      const key = Object.keys(notification.content)[0];
      const { id, sender, receiver } = notification;

      if (data.text === "Delete" || key === "Unfriend") {
        dispatch({ type: "DELETE_NOTIFY", id });
        dispatch({
          type: "REMOVE_FRIEND",
          id:
            sender.toText() === profile?.id
              ? receiver.toText()
              : sender.toText(),
        });
        return;
      }

      const actions: Record<string, () => void> = {
        NewMessage: () => {
          if ("NewMessage" in notification.content) {
            dispatch({
              type: "ADD_NOTIFICATION",
              message: notification.content.NewMessage,
            });
          }
        },
        FriendRequest: () => {
          if ("FriendRequest" in notification.content) {
            const friendData = notification.content.FriendRequest.friend;
            // Convert Friend to FEFriend format for frontend compatibility
            const feFriend = {
              id:
                friendData.receiver.id === profile?.id
                  ? friendData.sender.id
                  : friendData.receiver.id,
              is_sender: friendData.sender.id === profile?.id,
              confirmed: friendData.confirmed,
              name:
                friendData.receiver.id === profile?.id
                  ? friendData.sender.name
                  : friendData.receiver.name,
              description:
                friendData.receiver.id === profile?.id
                  ? friendData.sender.description
                  : friendData.receiver.description,
              email:
                friendData.receiver.id === profile?.id
                  ? friendData.sender.email
                  : friendData.receiver.email,
              photo:
                friendData.receiver.id === profile?.id
                  ? friendData.sender.photo
                  : friendData.receiver.photo,
            };
            dispatch({ type: "ADD_FRIEND", friend: feFriend });
            dispatch({ type: "NOTIFY", new_notification: notification });
          }
        },
        CustomContract: () => {
          if ("CustomContract" in notification.content) {
            const [contractId, payment] = notification.content.CustomContract;
            // Only update main state, not changes (already persisted in backend)
            dispatch({
              type: "SET_PROMISE_STATUS",
              contract_id: contractId,
              promise: payment,
            });
            dispatch({ type: "NOTIFY", new_notification: notification });
          }
        },
        ContractUpdate: () => {
          if ("ContractUpdate" in notification.content) {
            dispatch({ type: "NOTIFY", new_notification: notification });
          }
        },
        CPaymentContract: () => {
          if ("CPaymentContract" in notification.content) {
            const [payment, _action] = notification.content.CPaymentContract;
            // Only update main state, not changes (already persisted in backend)
            dispatch({
              type: "SET_PROMISE_STATUS",
              contract_id: payment.contract_id,
              promise: payment,
            });
            dispatch({ type: "NOTIFY", new_notification: notification });
          }
        },
        ApproveShareRequest: () => {
          dispatch({ type: "NOTIFY", new_notification: notification });
        },
        ApplyShareRequest: () => {
          dispatch({ type: "NOTIFY", new_notification: notification });
        },
        ReceivedDeposit: () => {
          dispatch({ type: "NOTIFY", new_notification: notification });
        },
        RemovedFromChat: () => {
          dispatch({ type: "NOTIFY", new_notification: notification });
        },
        AcceptFriendRequest: () => {
          // When someone accepts our friend request, update the friendship to confirmed
          dispatch({
            type: "UPDATE_FRIEND",
            id: sender.toText(),
            confirmed: true,
          });
          dispatch({ type: "NOTIFY", new_notification: notification });
        },
        CancelFriendRequest: () => {
          // When someone cancels their friend request to us, remove the friendship
          dispatch({ type: "REMOVE_FRIEND", id: sender.toText() });
          dispatch({ type: "NOTIFY", new_notification: notification });
        },
        RejectFriendRequest: () => {
          // When someone rejects our friend request, remove the friendship
          dispatch({ type: "REMOVE_FRIEND", id: sender.toText() });
          dispatch({ type: "NOTIFY", new_notification: notification });
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
