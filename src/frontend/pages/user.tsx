import ProfilePage from "./profile";
// MessageMenuItem.tsx
import { Principal } from "@dfinity/principal";
import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import FriendshipButton from "../components/FriendshipButton";
import { backendActor } from "../utils/backendUtils";

function UserProfile() {
  

  
  const [searchParams] = useSearchParams();


  
  const [user, setUser] = useState(null);


  
  const [profileHistory, setProfileHistory] = useState(null);

  
  const [isLoading, setIsLoading] = useState(true);

  
  const { profile, friends } = useSelector((state: unknown) => state.filesState);

  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = searchParams.get("id");
        if (!userId || !backendActor) return;

        const userData = await backendActor.get_user(userId);
        const userHistory = await backendActor.get_user_profile(
          Principal.fromText(userId),
        );

        setUser(userData.Ok);
        setProfileHistory(userHistory.Ok);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [searchParams, backendActor]);
  

  
  if (isLoading) {
    
    return <div>Loading...</div>;
  }


  if (!user) {
    
    return <Typography variant="h4">User not found...</Typography>;
  }

  
  // if (!profile) {
  //   return <Typography variant="h4">You need to login...</Typography>;
  // }
  return (
    <div>
      <ProfilePage
        friendButton={
          profile &&
          user.id != profile?.id && (
            <FriendshipButton
              profile={profile}
              user={user}
              friends={friends || []}
            />
          )
        }
        friends={[]}
        profile={user}
        history={profileHistory}
      />
    </div>
  );
}

export default UserProfile;
