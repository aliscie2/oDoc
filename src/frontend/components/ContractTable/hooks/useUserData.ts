import { useCallback } from "react";
import { useSelector } from "react-redux";
import { Principal } from "@dfinity/principal";
import { Friend } from "$/declarations/backend/backend.did";

interface AppState {
  filesState: {
    profile: { id: string; name: string };
    all_friends: Friend[];
  };
}

export const useUserData = () => {
  const { profile, all_friends } = useSelector((state: AppState) => state.filesState);

  return useCallback(
    (principalId: Principal) => {
      const id = principalId?.toString();
      if (id === profile.id) return { name: "You", user: profile };
      const friend = all_friends?.find((u) => u.id === id);
      return { name: friend?.name || "Unknown", user: friend };
    },
    [profile, all_friends],
  );
};