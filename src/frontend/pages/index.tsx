import { useAuth } from "@/hooks/useAuth";
import { Box, CircularProgress } from "@mui/material";
import React, { Suspense } from "react";
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";

import AffiliateRedirect from "./affiliateRedirect";
import NotFound from "@/pages/notFound404";
import { ChatMobilePage } from "./chatMobilePage";
import LandingPage from "./LandingPage";

// Lazy imports for heavy components
const JobsPage = React.lazy(() => import("./jobs"));
const FileContentPage = React.lazy(() => import("./fileContentPage"));
const ShareFilePage = React.lazy(() => import("./ShareFilePage"));
const ProfilePage = React.lazy(() => import("./profile"));
const UserProfile = React.lazy(() => import("./user"));
const ContractsHistory = React.lazy(() => import("./contracts/contracts"));
const OfferPage = React.lazy(() => import("./OfferPage"));
const SubscriptionPlans = React.lazy(() => import("./subscrptions"));
const SNSWhitepaper = React.lazy(() => import("./white_paper/markDownReader"));
const SNSVoting = React.lazy(() => import("./white_paper"));
const DummyShares = React.lazy(() => import("./sharesContract"));
const AffiliateDashboard = React.lazy(() => import("./affiliate"));
const ContractPage = React.lazy(() => import("./contracts/ContractPage"));
const CalendarView = React.lazy(() => import("./calendar"));
const ShareCalendarView = React.lazy(() => import("./calendar/sharedCalendar"));
const AchievementPage = React.lazy(() => import("@/components/userBadges"));
const WalletPage = React.lazy(() => import("./walletPage"));
const JobPage = React.lazy(() => import("./jobPage"));
const Posts = React.lazy(() => import("./posts/posts"));
const PrivacyPage = React.lazy(() => import("./privacy"));
const NotificationsPage = React.lazy(() => import("./NotificationsPage"));
const ChatsPage = React.lazy(() => import("./ChatsPage"));

// Loading component
const PageLoader = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="50vh"
  >
    <CircularProgress />
  </Box>
);

const Pages = React.memo(() => {
  const { profile, profile_history, wallet, friends } = useSelector(
    (state: unknown) => state.filesState,
  );

  const { isLoggedIn } = useAuth();

  // const MainPage = useMemo(() => {
  //   if (isLoggedIn) {
  //     return <JobsPage />;
  //   }
  //   return <ICPJobsLandingPage />;
  // }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/white_paper" element={<SNSWhitepaper />} />
          <Route path="/share/*" element={<ShareFilePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/f*" element={<AffiliateRedirect />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/share_calendar*" element={<ShareCalendarView />} />
          <Route path="/user/*" element={<UserProfile />} />
          <Route path="/jobs*" element={<JobPage />} />
        </Routes>
      </Suspense>
    );
  }
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<JobsPage />} />
        <Route path="/wallet" element={<WalletPage wallet={wallet} />} />
        <Route
          path="/profile"
          element={
            <ProfilePage
              friends={friends}
              profile={profile}
              history={profile_history}
              friendButton={null}
            />
          }
        />
        <Route path="/share/*" element={<ShareFilePage />} />
        <Route path="/user/*" element={<UserProfile />} />

        <Route path="/contract*" element={<ContractPage />} />
        <Route path="/contracts*" element={<ContractsHistory />} />
        <Route path="/offer" element={<OfferPage />} />

        <Route path="/subscriptions" element={<SubscriptionPlans />} />
        <Route path="/white_paper" element={<SNSWhitepaper />} />
        <Route path="/vote" element={<SNSVoting />} />
        <Route path="/shares_contract" element={<DummyShares />} />
        <Route path="/affiliate" element={<AffiliateDashboard />} />
        <Route path="/*" element={<FileContentPage />} />

        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/share_calendar*" element={<ShareCalendarView />} />
        <Route path="/achievementCard" element={<AchievementPage />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/jobs*" element={<JobPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/chat/:chatId" element={<ChatMobilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/chats" element={<ChatsPage />} />
      </Routes>
    </Suspense>
  );
});

Pages.displayName = "Pages";

export default Pages;

// // Calendar module exports
// export { default as EventDialog } from "./eventDialog";
// export { default as AvailabilityComponent } from "./AvailabilityComonent";
// export { default as TimePicker } from "./timePicker";
// export { default as ToolsBar } from "./toolsBar";
// export { default as AddEventToGoogleCalendar } from "./addEventToGoogleCalenar";
// // AI Calendar functionality is handled by the main chatbot system
// export * from "./calendarLogic";
// export * from "./serializers";
// export * from "./timezone";
// export * from "./style";
