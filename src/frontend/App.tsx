import React, { useCallback, useEffect, Suspense, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Pages from "./pages";

import { Principal } from "@dfinity/principal";
import { Box, CircularProgress, styled } from "@mui/material";
import { useSnackbar } from "notistack";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { canisterId } from "../declarations/backend";
import NavBar from "./components/MainComponents/NavBar";
import TopNavBar from "./components/MainComponents/topNavBar";
import { useBackendContext } from "./contexts/BackendContext";
import { RootState } from "./redux/reducers";
import getckUsdcBalance from "./utils/getBalance";

import RegistrationForm from "./components/MainComponents/RegistrationForm";
import {
  AvailabilityTimezone,
  EventTimezone,
} from "./pages/calendar/serializers";

import RunawayJellyfish from "./components/creature/runAeayJellyFish";
import useSocket from "./websocket/use_socket";

// Lazy load heavy components
const GoogleCalendarOnboarding = React.lazy(
  () => import("@/components/userBadges/coonectGoogleCalendar"),
);
const ChatContainer = React.lazy(
  () => import("./pages/dashboard/ChatContainer"),
);
const MainContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  transition: theme.transitions.create(["background-color", "color"], {
    duration: theme.transitions.duration.standard,
  }),
}));

// Create a styled component for the page content
const PageContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  paddingTop: theme.spacing(8), // Height of Index
  [theme.breakpoints.down("sm")]: {
    paddingTop: 0, // No top padding on mobile since Index is at bottom
    paddingBottom: theme.spacing(7), // Space for bottom mobile navigation
  },
}));

// hooks/useAppInitialization.ts
const useAppInitialization = () => {
  const dispatch = useDispatch();
  const { logout, backendActor, ckUSDCActor } = useBackendContext();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const { isLoggedIn, isRegistered, isFetching } = useSelector(
    (state: RootState) => state.uiState,
  );
  const { profile, posts } = useSelector(
    (state: RootState) => state.filesState,
  );

  const [initState, setInitState] = useState({
    serviceWorkerRegistered: false,
    initialDataFetched: false,
    userDataFetched: false,
    postsFetched: false,
    depositProcessed: false,
  });

  const checkAuthAndLogout = useCallback(
    (error: any) => {
      const errorString = error?.toString() || "";
      const authErrors = [
        "Invalid signature",
        "EcdsaP256 signature could not be verified",
        "Invalid delegation",
      ];

      if (authErrors.some((err) => errorString.includes(err))) {
        localStorage.clear();
        sessionStorage.clear();
        try {
          indexedDB.deleteDatabase("authClientDB");
        } catch (e) {}
        logout();
        return true;
      }
      return false;
    },
    [logout],
  );

  // Service worker registration
  useEffect(() => {
    if (!initState.serviceWorkerRegistered && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(() =>
          setInitState((prev) => ({ ...prev, serviceWorkerRegistered: true })),
        )
        .catch(console.error);
    }
  }, [initState.serviceWorkerRegistered]);

  // Main initialization
  useEffect(() => {
    const initializeApp = async () => {
      if (
        !isLoggedIn ||
        !backendActor ||
        isFetching ||
        initState.initialDataFetched
      )
        return;

      try {
        dispatch({ type: "IS_FETCHING", isFetching: true });

        const [jobsRes, initialRes] = await Promise.allSettled([
          backendActor.get_my_jobs(),
          backendActor.get_initial_data(),
        ]);

        if (jobsRes.status === "fulfilled") {
          dispatch({
            type: "INIT_JOBS",
            jobs: jobsRes.value.jobs,
            matchingJobs: jobsRes.value.matching_jobs,
          });
        }

        if (initialRes.status === "fulfilled" && !("Err" in initialRes.value)) {
          const workspaces = await backendActor
            .get_work_spaces()
            .catch(() => []);
          const profileRes = await backendActor.get_user_profile(
            Principal.fromText(initialRes.value.Ok.Profile.id),
          );

          dispatch({
            type: "INIT_FILES_STATE",
            data: {
              ...initialRes.value.Ok,
              ProfileHistory: profileRes.Ok || profileRes,
              workspaces,
            },
          });
          dispatch({ type: "IS_REGISTERED", isRegistered: true });
        } else {
          const [workspaces, friends, wallet, files] = await Promise.allSettled(
            [
              backendActor.get_work_spaces(),
              backendActor.get_friends(),
              backendActor.get_wallet(),
              backendActor.get_page_files(1),
            ],
          );

          dispatch({
            type: "INIT_FILES_STATE",
            data: {
              Profile: profile,
              ProfileHistory: profile,
              Files: files.status === "fulfilled" ? files.value : [],
              Friends: friends.status === "fulfilled" ? friends.value : [],
              Wallet: wallet.status === "fulfilled" ? wallet.value : null,
              workspaces:
                workspaces.status === "fulfilled" ? workspaces.value : [],
              FilesContents: [],
              Contracts: {},
            },
          });
        }

        setInitState((prev) => ({ ...prev, initialDataFetched: true }));
      } catch (error) {
        if (!checkAuthAndLogout(error)) console.error("Init error:", error);
      } finally {
        dispatch({ type: "IS_FETCHING", isFetching: false });
      }
    };

    initializeApp();
  }, [isLoggedIn, backendActor, isFetching, initState.initialDataFetched]);

  // User data fetching
  useEffect(() => {
    const fetchUserData = async () => {
      if (!profile?.id || !backendActor || initState.userDataFetched) return;

      try {
        const [notifications, chats, calendar, credits] =
          await Promise.allSettled([
            backendActor.get_user_notifications(BigInt(0)),
            backendActor.get_my_chats(BigInt(0)),
            backendActor.get_my_calendar(),
            backendActor.get_ai_credits(),
          ]);

        if (notifications.status === "fulfilled") {
          dispatch({ type: "UPDATE_NOT_LIST", new_list: notifications.value });
        }
        if (chats.status === "fulfilled") {
          dispatch({ type: "SET_CHATS", chats: chats.value });
        }
        if (calendar.status === "fulfilled") {
          const cal = calendar.value;
          cal.events = cal.events.map(EventTimezone);
          cal.availabilities = cal.availabilities.map(AvailabilityTimezone);
          dispatch({ type: "SET_CALENDAR", calendar: cal });
        }
        if (credits.status === "fulfilled") {
          const creditsValue = credits.value;
          if (
            "Err" in creditsValue &&
            creditsValue.Err === "User does not exist"
          ) {
            await backendActor.drop_free_credits();
            dispatch({ type: "INIT_AI_CREDITS", credits: 1, isFree: true });
          } else if ("Ok" in creditsValue) {
            const isFree = await backendActor.is_ai_free_tier();
            dispatch({
              type: "INIT_AI_CREDITS",
              credits: creditsValue.Ok,
              isFree: ("Ok" in isFree && isFree.Ok) || true,
            });
          }
        }

        setInitState((prev) => ({ ...prev, userDataFetched: true }));
      } catch (error) {
        console.error("User data fetch error:", error);
      }
    };

    fetchUserData();
  }, [profile?.id, backendActor, initState.userDataFetched]);

  // Posts fetching
  useEffect(() => {
    const fetchPosts = async () => {
      if (!backendActor || posts.length > 0 || initState.postsFetched) return;

      try {
        const fetchedPosts = await backendActor.get_posts(
          BigInt(0),
          BigInt(10),
        );
        if (fetchedPosts.length > 0) {
          dispatch({ type: "ADD_POSTS", posts: fetchedPosts });
        }
        setInitState((prev) => ({ ...prev, postsFetched: true }));
      } catch (error) {
        console.error("Posts fetch error:", error);
      }
    };

    fetchPosts();
  }, [backendActor, posts.length, initState.postsFetched]);

  // Token deposit
  useEffect(() => {
    const processDeposit = async () => {
      if (
        !backendActor ||
        !ckUSDCActor ||
        !profile?.id ||
        initState.depositProcessed
      )
        return;

      try {
        const userBalance = await getckUsdcBalance(ckUSDCActor, profile.id);
        if (Number(userBalance) <= 0 || Number(userBalance) / 1_000_000 < 1) {
          if (Number(userBalance) > 0) {
            enqueueSnackbar("You need at least 1 CKUSDT to deposit", {
              variant: "error",
            });
          }
          return;
        }

        const notificationKey = enqueueSnackbar(
          `Processing deposit of ${Number(userBalance) / 1_000_000} CKUSDT...`,
          {
            variant: "info",
            persist: true,
            action: () => <CircularProgress size={24} />,
          },
        );

        await ckUSDCActor.icrc2_approve({
          from_subaccount: [],
          spender: { owner: Principal.fromText(canisterId), subaccount: [] },
          amount: userBalance,
          expected_allowance: [],
          expires_at: [],
          fee: [],
          memo: [],
          created_at_time: [],
        });

        const depositResult = await backendActor.deposit_ckusdt();
        closeSnackbar(notificationKey);

        if ("Ok" in depositResult) {
          dispatch({ type: "SET_WALLET", wallet: depositResult.Ok });
          enqueueSnackbar(
            `Successfully deposited ${Number(userBalance) / 1_000_000} CKUSDT`,
            { variant: "success" },
          );
        } else {
          enqueueSnackbar(`Deposit failed: ${JSON.stringify(depositResult)}`, {
            variant: "error",
          });
        }

        setInitState((prev) => ({ ...prev, depositProcessed: true }));
      } catch (error) {
        enqueueSnackbar(`Deposit error: ${error}`, { variant: "error" });
      }
    };

    processDeposit();
  }, [backendActor, ckUSDCActor, profile?.id, initState.depositProcessed]);

  // Debug function
  useEffect(() => {
    (window as any).clearAuthState = () => {
      localStorage.clear();
      sessionStorage.clear();
      try {
        indexedDB.deleteDatabase("authClientDB");
      } catch (e) {}
      logout();
      window.location.reload();
    };
  }, [logout]);

  return { isInitialized: Object.values(initState).every(Boolean) };
};

const App: React.FC = () => {
  const { isRegistered } = useSelector((state: RootState) => state.uiState);
  const { backendActor } = useBackendContext();

  useAppInitialization();
  useSocket();

  if (!backendActor) return <RunawayJellyfish thinking={true} scale={2} />;

  return (
    <MainContent>
      <Suspense fallback={null}>
        <GoogleCalendarOnboarding />
      </Suspense>
      <TopNavBar />
      {isRegistered && (
        <Suspense fallback={null}>
          <ChatContainer />
        </Suspense>
      )}
      <DndProvider backend={HTML5Backend}>
        <NavBar>
          <PageContainer>
            {isRegistered == false ? <RegistrationForm /> : <Pages />}
          </PageContainer>
        </NavBar>
      </DndProvider>
    </MainContent>
  );
};
export default App;
