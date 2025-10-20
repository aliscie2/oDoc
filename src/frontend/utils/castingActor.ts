import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "$/declarations/backend/backend.did";
import { convertToBlobLink } from "@/DataProcessing/imageToVec";

export function createCastedActor(
  actor: ActorSubclass<_SERVICE>,
): ActorSubclass<_SERVICE> {
  return new Proxy(actor, {
    get(target, prop) {
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

      if (prop === "get_user_profile") {
        return async (principal: any) => {
          const res = await target.get_user_profile(principal);
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

      if (prop === "get_user") {
        return async (principal: any) => {
          const res = await target.get_user(principal);
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

      if (prop === "get_initial_data") {
        return async () => {
          const res = await target.get_initial_data();
          if ("Ok" in res) {
            const profile = {
              ...res.Ok.profile,
              photo: convertToBlobLink(res.Ok.profile.photo),
            };
            const workspaces = await target.get_work_spaces().catch(() => []);

            return {
              Ok: {
                Profile: profile,
                ProfileHistory: profile,
                Friends:
                  res.Ok.friends.map((f) => ({
                    ...f,
                    photo: convertToBlobLink(f.photo),
                  })) || [],
                Wallet: res.Ok.wallet || null,
                Contracts: res.Ok.contracts || {},
                workspaces,
              },
            };
          }
          return res;
        };
      }

      if (prop === "get_posts") {
        return async (start: bigint, limit: bigint) => {
          const res = await target.get_posts(start, limit);
          return res.map((post) => ({
            ...post,
            creator: {
              ...post.creator,
              photo: convertToBlobLink(post.creator.photo),
            },
          }));
        };
      }

      if (prop === "get_my_chats") {
        return async (start: bigint) => {
          const res = await target.get_my_chats(start);
          return res; // Return Chat objects directly, no conversion needed
        };
      }

      return target[prop as keyof ActorSubclass<_SERVICE>];
    },
  });
}
