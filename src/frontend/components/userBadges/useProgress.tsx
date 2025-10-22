import { useAuth } from "@/hooks/useAuth";
import { RootState } from "@/redux/reducers";
import { useMemo } from "react";
import { useSelector } from "react-redux";

export interface BadgeType {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  category: "social" | "growth" | "trust" | "milestone";
  videoUrl?: string;
  userType?: "freelancer" | "business_owner" | "both";
}

interface KarmaLevel {
  threshold: number;
  color: string;
  label: string;
  icon: string;
  personality: string;
}

interface ProgressData {
  karmaScore: number;
  userType: "freelancer" | "business_owner" | "unknown";
  badges: BadgeType[];
  currentLevel: KarmaLevel;
  nextLevel: KarmaLevel | null;
  rewardTier: {
    percentage: number;
    level: string;
    icon: string;
    emoji: string;
  };
  unlockedBadges: BadgeType[];
  lockedBadges: BadgeType[];
  recentAchievements: BadgeType[];
}

const karmaLevels: KarmaLevel[] = [
  {
    threshold: 0,
    color: "#F44336",
    label: "Newbie",
    icon: "🐣",
    personality: "Just hatched! Welcome to the community",
  },
  {
    threshold: 2,
    color: "#FF5722",
    label: "Explorer",
    icon: "🐤",
    personality: "Finding your wings!",
  },
  {
    threshold: 3,
    color: "#FFC107",
    label: "Community Star",
    icon: "🐓",
    personality: "Leading the flock",
  },
  {
    threshold: 4,
    color: "#4CAF50",
    label: "Legend",
    icon: "🦅",
    personality: "Soaring high above",
  },
  {
    threshold: 4.5,
    color: "#2E7D32",
    label: "Master",
    icon: "🏆",
    personality: "Peak performance achieved",
  },
];

const rewardTiers = [
  {
    threshold: 4.5,
    percentage: 0.2,
    level: "Platinum",
    icon: "💎",
    emoji: "👑",
  },
  { threshold: 4, percentage: 0.15, level: "Gold", icon: "🏆", emoji: "⭐" },
  { threshold: 3.5, percentage: 0.1, level: "Silver", icon: "🥈", emoji: "🌟" },
  { threshold: 3, percentage: 0.05, level: "Bronze", icon: "🥉", emoji: "⚡" },
  { threshold: 0, percentage: 0, level: "Starter", icon: "🌱", emoji: "🎯" },
];

const badgeDefinitions: Omit<BadgeType, "unlocked" | "progress">[] = [
  // Social Badges
  {
    id: "first_friend",
    title: "First Friend",
    description: "Made your first connection",
    icon: "🤝",
    category: "social",
    userType: "both",
  },
  {
    id: "first_payment",
    title: "First Payment",
    description: "Make your first payment transaction",
    icon: "💰",
    category: "trust",
    userType: "both",
  },
  {
    id: "social_butterfly",
    title: "Social Butterfly",
    description: "Connected with 10+ people",
    icon: "🦋",
    category: "social",
    userType: "both",
  },

  // Growth Badges
  // {
  //   id: "internet_identity",
  //   title: "Verified Identity",
  //   description: "Set up Internet Identity authentication",
  //   icon: "🔐",
  //   category: "growth",
  //   videoUrl: tutorials.find((t) => t.title === "Internet identity")?.videoUrl,
  //   userType: "both",
  // },

  {
    id: "reliable_freelancer",
    title: "Reliable Freelancer",
    description: "Completed 5+ successful projects",
    icon: "⭐",
    category: "trust",
    userType: "freelancer",
  },

  {
    id: "trusted_employer",
    title: "Trusted Employer",
    description: "Hired 5+ freelancers successfully",
    icon: "🏢",
    category: "trust",
    userType: "business_owner",
  },

  // Milestone Badges
  {
    id: "odoc_explorer",
    title: "Odoc Explorer",
    description: "Learned what Odoc is all about",
    icon: "🚀",
    category: "milestone",
    userType: "both",
  },
  {
    id: "trust_master",
    title: "Trust Master",
    description: "Mastered the token trust system",
    icon: "🎯",
    category: "milestone",
    userType: "both",
  },
];

const useProgress = (): ProgressData => {
  const { isLoggedIn } = useAuth();
  // 🚀 PERFORMANCE FIX: Only select what we need, not entire state
  const { profile, wallet, all_friends } = useSelector((state: RootState) => state.filesState);

  const data = useMemo(() => {

    // Calculate karma score (based on payments and disputes)
    const karmaScore = wallet?.actions_rate || 0;

    // Improved user type detection - check both sent and received payments
    let userType: "both" | "freelancer" | "business_owner" | "unknown" =
      "unknown";

    if (wallet?.exchanges?.length > 0) {
      const receivedPayments = wallet.exchanges.filter(
        (ex: any) => ex.receiver === profile?.id,
      );
      const sentPayments = wallet.exchanges.filter(
        (ex: any) => ex.sender === profile?.id,
      );

      // If user has both sent and received, prioritize recent activity
      if (receivedPayments.length > 0 && sentPayments.length > 0) {
        userType = "both"; // This will show badges for both types
      } else if (receivedPayments.length > 0) {
        userType = "freelancer";
      } else if (sentPayments.length > 0) {
        userType = "business_owner";
      }
    }

    // Get current karma level
    const currentLevel =
      karmaLevels
        .slice()
        .reverse()
        .find((level) => karmaScore >= level.threshold) || karmaLevels[0];

    // Get next level
    const nextLevel =
      karmaLevels.find((level) => level.threshold > karmaScore) || null;

    // Get reward tier
    const rewardTier =
      rewardTiers.find((tier) => karmaScore >= tier.threshold) ||
      rewardTiers[rewardTiers.length - 1];

    // Calculate badge progress and unlock status - SHOW ALL BADGES
    const badges: BadgeType[] = badgeDefinitions.map((badgeDef) => {
      let unlocked = false;
      let progress = 0;

      switch (badgeDef.id) {
        case "internet_identity":
          unlocked = isLoggedIn;
          progress = isLoggedIn ? 1 : 0;
          break;

        case "first_friend":
          const friendsCount =
            all_friends?.filter((f: any) => f.id !== profile?.id).length || 0;
          unlocked = friendsCount > 0;
          progress = friendsCount > 0 ? 1 : 0;
          break;

        case "social_butterfly":
          const totalFriends =
            all_friends?.filter((f: any) => f.id !== profile?.id).length || 0;
          unlocked = totalFriends >= 10;
          progress = Math.min(totalFriends / 10, 1);
          break;

        case "first_payment":
          const receivedPayments =
            wallet?.exchanges?.filter(
              (ex: any) => ex.receiver === profile?.id,
            ) || [];
          const sentPayments =
            wallet?.exchanges?.filter((ex: any) => ex.sender === profile?.id) ||
            [];

          const hasReceivedPayment = receivedPayments.length > 0;
          const hasSentPayment = sentPayments.length > 0;

          unlocked = hasReceivedPayment || hasSentPayment;
          progress = unlocked ? 1 : 0;

          // Dynamically update title and description based on payment type
          if (hasReceivedPayment && hasSentPayment) {
            badgeDef.title = "Payment Pro";
            badgeDef.description = "Both sent and received payments";
          } else if (hasReceivedPayment) {
            badgeDef.title = "First Payment Received";
            badgeDef.description = "Received your first payment";
          } else if (hasSentPayment) {
            badgeDef.title = "First Payment Sent";
            badgeDef.description = "Sent your first payment";
          }
          break;

        case "first_gig_completed":
          const completedAsReceiver =
            wallet?.exchanges?.filter(
              (ex: any) =>
                ex.receiver === profile?.id && ex.status === "completed",
            ).length || 0;
          unlocked = completedAsReceiver > 0;
          progress = completedAsReceiver > 0 ? 1 : 0;
          break;

        case "first_hire":
          const completedAsSender =
            wallet?.exchanges?.filter(
              (ex: any) =>
                ex.sender === profile?.id && ex.status === "completed",
            ).length || 0;
          unlocked = completedAsSender > 0;
          progress = completedAsSender > 0 ? 1 : 0;
          break;

        case "reliable_freelancer":
          const completedGigs =
            wallet?.exchanges?.filter(
              (ex: any) =>
                ex.receiver === profile?.id && ex.status === "completed",
            ).length || 0;
          unlocked = completedGigs >= 5;
          progress = Math.min(completedGigs / 5, 1);
          break;

        case "trusted_employer":
          const hiredFreelancers =
            wallet?.exchanges?.filter(
              (ex: any) =>
                ex.sender === profile?.id && ex.status === "completed",
            ).length || 0;
          unlocked = hiredFreelancers >= 5;
          progress = Math.min(hiredFreelancers / 5, 1);
          break;

        case "profile_complete":
          const profileFields = [
            profile?.name,
            profile?.email,
            profile?.bio,
            profile?.avatar,
          ];
          const completedFields = profileFields.filter(
            (field) => field && field.trim(),
          ).length;
          unlocked = completedFields >= 3;
          progress = completedFields / 4;
          break;

        case "odoc_explorer":
          // Check if user has watched the intro video or has exchanges
          unlocked = wallet?.exchanges?.length > 0;
          progress = wallet?.exchanges?.length > 0 ? 1 : 0;
          break;

        case "trust_master":
          // Unlock after first successful payment
          unlocked = wallet?.exchanges?.length > 0;
          progress = wallet?.exchanges?.length > 0 ? 1 : 0;
          break;

        default:
          // Default logic for other badges
          unlocked = false;
          progress = 0;
      }

      return {
        ...badgeDef,
        unlocked,
        progress,
      };
    });

    const unlockedBadges = badges.filter((badge) => badge.unlocked);
    const lockedBadges = badges.filter((badge) => !badge.unlocked);

    // Recent achievements (last 3 unlocked badges)
    const recentAchievements = unlockedBadges.slice(-3);

    return {
      karmaScore,
      userType,
      badges,
      currentLevel,
      nextLevel,
      rewardTier,
      unlockedBadges,
      lockedBadges,
      recentAchievements,
    };
  }, [profile, wallet, all_friends]);

  return data;
};

export default useProgress;
