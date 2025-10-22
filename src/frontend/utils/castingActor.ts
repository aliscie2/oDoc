import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "$/declarations/backend/backend.did";
import { convertToBlobLink } from "@/DataProcessing/imageToVec";

export function createCastedActor(
  actor: ActorSubclass<_SERVICE>,
): ActorSubclass<_SERVICE> {
  return new Proxy(actor, {
    get(target, prop) {
      // get_initial_data - Returns profile, friends, wallet, contracts
      if (prop === "get_initial_data") {
        return async () => {
          const res = await target.get_initial_data();
          if ("Ok" in res) {
            const workspaces = await target.get_work_spaces().catch(() => []);

            // Convert profile photo
            const profile = {
              ...res.Ok.profile,
              photo: convertToBlobLink(res.Ok.profile.photo),
            };

            // Convert friends photos
            const friends = (res.Ok.friends || []).map((f) => ({
              ...f,
              photo: convertToBlobLink(f.photo),
            }));

            return {
              Ok: {
                Profile: profile,
                ProfileHistory: profile,
                Friends: friends,
                Wallet: res.Ok.wallet || null,
                Contracts: res.Ok.contracts || {},
                workspaces,
              },
            };
          }
          return res;
        };
      }

      // send_friend_request - Returns User with photo
      if (prop === "send_friend_request") {
        return async (userId: string) => {
          const res = await target.send_friend_request(userId);
          if ("Ok" in res) {
            return {
              Ok: {
                ...res.Ok,
                photo: convertToBlobLink(res.Ok.photo),
              },
            };
          }
          return res;
        };
      }

      // get_user_profile - Returns UserProfile with photo
      if (prop === "get_user_profile") {
        return async (principal: string) => {
          const res = await target.get_user_profile(principal as never);
          if ("Ok" in res) {
            return {
              Ok: {
                ...res.Ok,
                photo: convertToBlobLink(res.Ok.photo),
              },
            };
          }
          return res;
        };
      }

      // get_user - Returns User with photo
      if (prop === "get_user") {
        return async (userId: string) => {
          const res = await target.get_user(userId);
          if ("Ok" in res) {
            return {
              Ok: {
                ...res.Ok,
                photo: convertToBlobLink(res.Ok.photo),
              },
            };
          }
          return res;
        };
      }

      // register - Returns User with photo
      if (prop === "register") {
        return async (name: string, userData: never) => {
          const res = await target.register(name, userData);
          if ("Ok" in res) {
            return {
              Ok: {
                ...res.Ok,
                photo: convertToBlobLink(res.Ok.photo),
              },
            };
          }
          return res;
        };
      }

      // update_user_profile - Returns User with photo
      if (prop === "update_user_profile") {
        return async (userData: never) => {
          const res = await target.update_user_profile(userData);
          if ("Ok" in res) {
            return {
              Ok: {
                ...res.Ok,
                photo: convertToBlobLink(res.Ok.photo),
              },
            };
          }
          return res;
        };
      }

      // accept_friend_request - Returns User with photo
      if (prop === "accept_friend_request") {
        return async (userId: string) => {
          const res = await target.accept_friend_request(userId);
          if ("Ok" in res) {
            return {
              Ok: {
                ...res.Ok,
                photo: convertToBlobLink(res.Ok.photo),
              },
            };
          }
          return res;
        };
      }

      // reject_friend_request - Returns User with photo
      if (prop === "reject_friend_request") {
        return async (userId: string) => {
          const res = await target.reject_friend_request(userId);
          if ("Ok" in res) {
            return {
              Ok: {
                ...res.Ok,
                photo: convertToBlobLink(res.Ok.photo),
              },
            };
          }
          return res;
        };
      }

      // cancel_friend_request - Returns User with photo
      if (prop === "cancel_friend_request") {
        return async (userId: string) => {
          const res = await target.cancel_friend_request(userId);
          if ("Ok" in res) {
            return {
              Ok: {
                ...res.Ok,
                photo: convertToBlobLink(res.Ok.photo),
              },
            };
          }
          return res;
        };
      }

      // unfriend - Returns User with photo
      if (prop === "unfriend") {
        return async (userId: string) => {
          const res = await target.unfriend(userId);
          if ("Ok" in res) {
            return {
              Ok: {
                ...res.Ok,
                photo: convertToBlobLink(res.Ok.photo),
              },
            };
          }
          return res;
        };
      }

      // get_posts - Returns PostUser[] with creator.photo and BigInt dates
      if (prop === "get_posts") {
        return async (start: bigint, limit: bigint) => {
          const res = await target.get_posts(start, limit);
          return res.map((post) => ({
            ...post,
            date_created: Number(post.date_created),
            creator: {
              ...post.creator,
              photo: convertToBlobLink(post.creator.photo),
            },
          }));
        };
      }

      // search_posts - Returns PostUser[] with creator.photo
      if (prop === "search_posts") {
        return async (query: string) => {
          const res = await target.search_posts(query);
          return res.map((post) => ({
            ...post,
            date_created: Number(post.date_created),
            creator: {
              ...post.creator,
              photo: convertToBlobLink(post.creator.photo),
            },
          }));
        };
      }

      // get_my_chats - Returns Chat[] with BigInt dates in messages
      if (prop === "get_my_chats") {
        return async (start: bigint) => {
          const res = await target.get_my_chats(start);
          return res.map((chat) => ({
            ...chat,
            messages: chat.messages.map((msg) => ({
              ...msg,
              date: Number(msg.date),
            })),
          }));
        };
      }

      // load_more_messages - Returns Message[] with BigInt dates
      if (prop === "load_more_messages") {
        return async (chatId: string, offset: bigint) => {
          const res = await target.load_more_messages(chatId, offset);
          return res.map((msg) => ({
            ...msg,
            date: Number(msg.date),
          }));
        };
      }

      // get_user_notifications - Returns Notification[] with nested photos in FriendRequest
      if (prop === "get_user_notifications") {
        return async (start: bigint) => {
          const res = await target.get_user_notifications(start);
          
          // 🚀 CRITICAL FIX: Convert Uint8Array photos to blob URLs in notifications
          // FriendRequest notifications contain sender/receiver User objects with photos
          return res.map((notif) => {
            // Handle FriendRequest notifications (contains Friend with sender/receiver User objects)
            if (notif.content && 'FriendRequest' in notif.content) {
              const friendReq = notif.content.FriendRequest;
              return {
                ...notif,
                time: Number(notif.time),
                content: {
                  FriendRequest: {
                    ...friendReq,
                    friend: {
                      ...friendReq.friend,
                      sender: {
                        ...friendReq.friend.sender,
                        photo: convertToBlobLink(friendReq.friend.sender.photo),
                      },
                      receiver: {
                        ...friendReq.friend.receiver,
                        photo: convertToBlobLink(friendReq.friend.receiver.photo),
                      },
                    },
                  },
                },
              };
            }
            
            // Handle NewMessage notifications (convert BigInt date)
            if (notif.content && 'NewMessage' in notif.content) {
              return {
                ...notif,
                time: Number(notif.time),
                content: {
                  NewMessage: {
                    ...notif.content.NewMessage,
                    date: Number(notif.content.NewMessage.date),
                  },
                },
              };
            }
            
            // Other notification types (no photos, just convert time)
            return {
              ...notif,
              time: Number(notif.time),
            };
          });
        };
      }

      // counter - Returns BigInt
      if (prop === "counter") {
        return async () => {
          const res = await target.counter();
          return Number(res);
        };
      }

      // check_external_transactions - Returns GetTransactions with BigInt balance
      // if (prop === "check_external_transactions") {
      //   return async (txId: bigint) => {
      //     const res = await target.check_external_transactions(txId);
      //     if ("Ok" in res) {
      //       return {
      //         Ok: {
      //           balance: Number(res.Ok.balance),
      //           transactions: res.Ok.transactions.map((tx) => ({
      //             ...tx,
      //             id: Number(tx.id),
      //             transaction: {
      //               ...tx.transaction,
      //               timestamp: Number(tx.transaction.timestamp),
      //             },
      //           })),
      //           oldest_tx_id: res.Ok.oldest_tx_id.length > 0 
      //             ? [Number(res.Ok.oldest_tx_id[0])] 
      //             : [],
      //         },
      //       };
      //     }
      //     return res;
      //   };
      // }

      // withdraw_ckusdt - Takes BigInt amount
      if (prop === "withdraw_ckusdt") {
        return async (amount: bigint, address: string) => {
          return await target.withdraw_ckusdt(amount, address);
        };
      }

      // Default: return original method unchanged
      return target[prop as keyof ActorSubclass<_SERVICE>];
    },
  });
}
