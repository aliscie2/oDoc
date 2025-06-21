import { Route, Routes, useLocation } from "react-router-dom";
import React from "react";
import LandingPage from "./LandingPage";
import FileContentPage from "./fileContentPage";
import ShareFilePage from "./ShareFilePage";
import ProfilePage from "./profile";
import UserProfile from "./User";
import ContractsHistory from "./Profile/ContractsHistory";
import Web3WalletUI from "../components/MuiComponents/walletUi";
import { useSelector } from "react-redux";

import OfferPage from "./OfferPage";
import SubscriptionPlans from "./subscrptions";
import SNSWhitepaper from "./white_paper/markDownReader";
import SNSVoting from "./white_paper";

import DummyShares from "./sharesContract";
import AffiliateDashboard from "./affiliate";
import AffiliateRedirect from "./affiliateRedirect";

import ContractPage from "./profile/ContractPage";
import Scheduler from "./dashBoardPage/calindarView";
import { useNavigate, Link, Navigate } from "react-router-dom";
import Dashboard from "./dash_board_v1";

function Pages() {
  const navigate = useNavigate();
  const location = useLocation();

  const { profile, profile_history, wallet, friends } = useSelector(
    (state: any) => state.filesState,
  );

  const { isLoggedIn } = useSelector((state: any) => state.uiState);

  const MainPage = () => {
    if (isLoggedIn) {
      return <Dashboard />;
    }

    return <LandingPage />;
  };
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/about" element={<LandingPage />} />
      <Route path="/wallet" element={<Web3WalletUI wallet={wallet} />} />
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
      <Route path="/calendar" element={<Scheduler />} />
    </Routes>
  );
}

export default Pages;
