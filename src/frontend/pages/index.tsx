import { Route, Routes, useLocation } from "react-router-dom";
import React from "react";
import LandingPage from "./LandingPage";
import FileContentPage from "./fileContentPage";
import ShareFilePage from "./ShareFilePage";
import ProfilePage from "./profile";
import UserProfile from "./user";
import ContractsHistory from "./profile/ContractsHistory";

import { useSelector } from "react-redux";

import OfferPage from "./OfferPage";
import SubscriptionPlans from "./subscrptions";
import SNSWhitepaper from "./white_paper/markDownReader";
import SNSVoting from "./white_paper";

import DummyShares from "./sharesContract";
import AffiliateDashboard from "./affiliate";
import AffiliateRedirect from "./affiliateRedirect";

import ContractPage from "./profile/ContractPage";
import { useNavigate } from "react-router-dom";
// import Dashboard from "./dash_board_v1";
import CalendarView from "./dash_board_v1/calindarView/calendar";
import JobsPage from "./discover/jobs";
import AchievementPage from "@/components/userBadges";
import ICPJobsLandingPage from "./LandingPage/aiJobMatch";
import Posts from "./discover/posts";
import WalletPage from "./walletPage";
import JobPage from "./jobPage";

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
      <Route path="/f" element={<AffiliateRedirect />} />
      <Route path="/*" element={<FileContentPage />} />
      <Route path="/calendar" element={<CalendarView />} />
      <Route path="/achievementCard" element={<AchievementPage />} />
      <Route path="/posts" element={<Posts />} />
      <Route path="/jobs*" element={<JobPage />} />
    </Routes>
  );
}

export default Pages;
