import React, { useCallback, useEffect, Suspense, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Pages from "./pages";

import { Principal } from "@dfinity/principal";
import { Box, CircularProgress, styled } from "@mui/material";
import { useSnackbar } from "notistack";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { canisterId } from "../declarations/backend";
import NavBar from "./components/MainComponents/NavBar";
import TopNavBar from "./components/MainComponents/topNavBar";
import { RootState } from "./redux/reducers";
import {
  selectIsFetching,
  selectProfile,
} from "./redux/selectors";
import getckUsdcBalance from "./utils/getBalance";
import {
  backendActor,
  ckUSDCActor,
  initializeSmartActors,
} from "./utils/backendUtils";
import { useAuth } from "./hooks/useAuth";

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
const ChatContainer = React.lazy(() => import("./chatBot/ChatContainer"));
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


  const {logout, checkAuthStatus, authStatus } = useAuth();
    
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  

  const isLoggedIn = authStatus === 'authenticated' || authStatus === 'registered';

  const isFetching = useSelector(selectIsFetching);
  const profile = useSelector(selectProfile);

  const [initState, setInitState] = useState({
    serviceWorkerRegistered: false,
    initialDataFetched: false,
    userDataFetched: false,
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
        .then(() => {
          setInitState((prev) => ({ ...prev, serviceWorkerRegistered: true }));
        })
        .catch(console.error);
    }
  }, [initState.serviceWorkerRegistered]);

  // Authentication check on app start
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Reset initialization when user logs in to trigger data refetch
  useEffect(() => {
    if (isLoggedIn) {
      setInitState((prev) => ({
        ...prev,
        initialDataFetched: false,
        userDataFetched: false,
      }));
      // Clear posts initialization flag when user logs in
      sessionStorage.removeItem('postsInitialized');
    }
  }, [isLoggedIn]);

  // Main initialization
  useEffect(() => {
    const initializeApp = async () => {
      if (!isLoggedIn || isFetching || initState.initialDataFetched) {
        return;
      }

      try {
        dispatch({ type: "IS_FETCHING", isFetching: true });

        // Ensure smart actors are initialized before making API calls
        await initializeSmartActors();

        const [jobsRes, initialRes] = await Promise.allSettled([
          backendActor.get_my_jobs(),
          backendActor.get_initial_data(),
        ]);
        console.log({initialRes})

        if (
          initialRes.status === "fulfilled" &&
          isLoggedIn &&
          "Err" in initialRes.value &&
          initialRes.value.Err === "Anonymous user."
        ) {
          dispatch({ type: "IS_REGISTERED", isRegistered: false });
          return null;
        } else if (
          initialRes.status === "fulfilled" &&
          "Ok" in initialRes.value
        ) {
          dispatch({ type: "IS_REGISTERED", isRegistered: true });
        } else {
          logout();
        }

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
            Principal.fromText(initialRes.value.Ok.profile.id),
          );

          dispatch({
            type: "INIT_FILES_STATE",
            data: {
              // Convert snake_case backend response to PascalCase for reducer compatibility
              Profile: initialRes.value.Ok.profile,
              ProfileHistory: profileRes.Ok || profileRes,
              Files: initialRes.value.Ok.files || [],
              Friends: initialRes.value.Ok.friends || [],
              Wallet: initialRes.value.Ok.wallet || null,
              FilesContents: initialRes.value.Ok.files_contents || [],
              Contracts: initialRes.value.Ok.contracts || {},
              workspaces,
            },
          });
        } else {
          const [workspaces, friends, wallet, files] = await Promise.allSettled(
            [
              backendActor.get_work_spaces(),
              backendActor.get_friends(),
              backendActor.get_wallet(),
              backendActor.get_all_files(),
            ],
          );

          dispatch({
            type: "INIT_FILES_STATE",
            data: {
              Profile: profile,
              ProfileHistory: profile,
              Files: files.status === "fulfilled" ? files.value : [],
              Friends:
                friends.status === "fulfilled" ? friends.value || [] : [],
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
        checkAuthAndLogout(error);
      } finally {
        dispatch({ type: "IS_FETCHING", isFetching: false });
      }
    };

    initializeApp();
  }, [
    isLoggedIn,
    isFetching,
    initState.initialDataFetched,
    dispatch,
    logout,
    checkAuthAndLogout,
  ]);

  // User data fetching
  useEffect(() => {
    const fetchUserData = async () => {
      if (!profile?.id || initState.userDataFetched) return;

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
  }, [profile?.id, initState.userDataFetched, dispatch]);



  // Token deposit
  useEffect(() => {
    const processDeposit = async () => {
      if (!profile?.id || initState.depositProcessed) return;

      try {
        if (!ckUSDCActor) return;

        const userBalance = await getckUsdcBalance(ckUSDCActor, profile.id);
        if (Number(userBalance) <= 0 || Number(userBalance) / 1_000_000 < 1) {
          if (Number(userBalance) > 0) {
            enqueueSnackbar("You need at least 1 CKUSDT to deposit", {
              variant: "error",
            });
          }
          setInitState((prev) => ({ ...prev, depositProcessed: true }));
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
  }, [
    profile?.id,
    initState.depositProcessed,
    enqueueSnackbar,
    closeSnackbar,
    dispatch,
  ]);

  return { isInitialized: Object.values(initState).every(Boolean) };
};

const App: React.FC = () => {
  

  const { authStatus, shouldShowApp } = useAuth();
  const navigate = useNavigate();
  const [backendReady, setBackendReady] = useState(false);

  useAppInitialization();
  useSocket();

  // Check backend readiness
  useEffect(() => {
    setBackendReady(!!backendActor);
  }, []);

  // Domain-based navigation logic
  useEffect(() => {
    if (
      shouldShowApp &&
      window.location.hostname.includes("odoc.app") &&
      !localStorage.getItem("isVisitedContractsPage")
    ) {
      navigate("/contracts");
    }
  }, [navigate, shouldShowApp]);
  // swtich caseses

  switch (authStatus) {
    case 'loading':
      return <RunawayJellyfish thinking={true} scale={2} />;
    case 'anonymous':
      return <div>
        <TopNavBar />
      <PageContainer>
        <Pages />
      </PageContainer>
    </div>
    case 'authenticated':
      return <RegistrationForm />;
    default:
      return (
        <MainContent>
          <Suspense fallback={null}>
            <GoogleCalendarOnboarding />
          </Suspense>
          <TopNavBar />
          <Suspense fallback={null}>
            <ChatContainer />
          </Suspense>
          <DndProvider backend={HTML5Backend}>
            <NavBar>
              <PageContainer>
                <Pages />
              </PageContainer>
            </NavBar>
          </DndProvider>
        </MainContent>
      );
   }


};
export default App;
