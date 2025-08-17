import { Route, Routes, useLocation } from "react-router-dom";
import React, { Suspense } from "react";
import { CircularProgress, Box } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Immediate imports for critical components
import LandingPage from "./LandingPage";
import ICPJobsLandingPage from "./LandingPage/aiJobMatch";
import JobsPage from "./discover/jobs";
import AffiliateRedirect from "./affiliateRedirect";

// Lazy imports for heavy components
const FileContentPage = React.lazy(() => import("./fileContentPage"));
const ShareFilePage = React.lazy(() => import("./ShareFilePage"));
const ProfilePage = React.lazy(() => import("./profile"));
const UserProfile = React.lazy(() => import("./user"));
const ContractsHistory = React.lazy(() => import("./profile/ContractsHistory"));
const OfferPage = React.lazy(() => import("./OfferPage"));
const SubscriptionPlans = React.lazy(() => import("./subscrptions"));
const SNSWhitepaper = React.lazy(() => import("./white_paper/markDownReader"));
const SNSVoting = React.lazy(() => import("./white_paper"));
const DummyShares = React.lazy(() => import("./sharesContract"));
const AffiliateDashboard = React.lazy(() => import("./affiliate"));
const ContractPage = React.lazy(() => import("./profile/ContractPage"));
const CalendarView = React.lazy(
  () => import("./dash_board_v1/calindarView/calendar"),
);
const AchievementPage = React.lazy(() => import("@/components/userBadges"));
const Posts = React.lazy(() => import("./discover/posts"));
const WalletPage = React.lazy(() => import("./walletPage"));
const JobPage = React.lazy(() => import("./jobPage"));

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

function Pages() {
  const navigate = useNavigate();
  const location = useLocation();

  const { profile, profile_history, wallet, friends } = useSelector(
    (state: any) => state.filesState,
  );

  const { isLoggedIn } = useSelector((state: any) => state.uiState);
  const currentDomain = window.location.hostname;
  const MainPage = () => {
    if (isLoggedIn) {
      return <JobsPage />;
    }
    if (currentDomain == "odoc.app") {
      return <LandingPage />;
    } else {
      return <ICPJobsLandingPage />;
    }
  };

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/about" element={<LandingPage />} />
        <Route path="/wallet" element={<WalletPage wallet={wallet} />} />
        <Route
          path="/profile"
          element={
            <ProfilePage
              friends={friends}
              profile={profile}
              history={profile_history}
            />
          }
        />
        <Route path="/share/*" element={<ShareFilePage />} />
        <Route path="/user/*" element={<UserProfile />} />
        {/*<Route path="/chats/*" element={<ChatsPage />} />*/}

        <Route path="/contract*" element={<ContractPage />} />
        <Route path="/contracts/*" element={<ContractsHistory />} />
        <Route path="/offer" element={<OfferPage />} />

        <Route path="/subscriptions" element={<SubscriptionPlans />} />
        <Route path="/white_paper" element={<SNSWhitepaper />} />
        <Route path="/vote" element={<SNSVoting />} />
        <Route path="/shares_contract" element={<DummyShares />} />
        <Route path="/affiliate" element={<AffiliateDashboard />} />
        <Route path="/*" element={<FileContentPage />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/achievementCard" element={<AchievementPage />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/jobs*" element={<JobPage />} />
        <Route path="/f*" element={<AffiliateRedirect />} />
      </Routes>
    </Suspense>
  );
}

export default Pages;
