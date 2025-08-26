import { useSelector } from "react-redux";
import { Principal } from "@dfinity/principal";
import { Friend, User } from "$/declarations/backend/backend.did";

interface AppState {
  filesState: {
    profile: { id: string; name: string };
    all_friends: any[]; // Array of User objects extracted from Friends
  };
}

export const useUserData = () => {
  const { profile, all_friends } = useSelector((state: AppState) => state.filesState);

  return (userId: Principal | string): { name: string; user?: User } => {
    if (!userId) {
      return { 
        name: "Unknown", 
        user: { 
          id: "unknown", 
          name: "Unknown", 
          description: "", 
          email: "", 
          photo: new Uint8Array() 
        } 
      };
    }

    const userIdString = typeof userId === 'string' ? userId : userId.toString();
    
    // Check if it's the current user
    if (profile?.id && userIdString === profile.id) {
      return { 
        name: profile.name || "Me", 
        user: { 
          id: profile.id, 
          name: profile.name || "Me", 
          description: "", 
          email: "", 
          photo: new Uint8Array() 
        } 
      };
    }

    // Look for the user in friends list (all_friends contains User objects)
    if (all_friends && Array.isArray(all_friends)) {
      const user = all_friends.find((u) => u?.id === userIdString);
      if (user && user.name) {
        return { name: user.name, user };
      }
    }

    // Fallback for unknown users
    return { 
      name: "Unknown", 
      user: { 
        id: userIdString, 
        name: "Unknown", 
        description: "", 
        email: "", 
        photo: new Uint8Array() 
      } 
    };
  };
};