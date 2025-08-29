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
import { initializeApp } from "./redux/slices/appSlice";

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


  const {logout, checkAuthStatus, authStatus, cleanUp } = useAuth();
    
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
    appInitDispatched: false,
  });


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
    const initializeAppData = async () => {
      if (authStatus !=="registered" || !isLoggedIn || isFetching || initState.initialDataFetched || initState.appInitDispatched) {
        return;
      }

      try {
        dispatch({ type: "IS_FETCHING", isFetching: true });

        // Ensure smart actors are initialized before making API calls
        await initializeSmartActors();

        const [jobsRes] = await Promise.allSettled([
          backendActor.get_my_jobs(),
        ]);

        if (jobsRes.status === "fulfilled") {
          dispatch({
            type: "INIT_JOBS",
            jobs: jobsRes.value.jobs,
            matchingJobs: jobsRes.value.matching_jobs,
          });
        }

        // Single dispatch for initialization - let the thunk handle success/fallback logic
        dispatch(initializeApp(backendActor) as any);

        setInitState((prev) => ({ ...prev, initialDataFetched: true, appInitDispatched: true }));
      } catch (error) {
        await cleanUp()
      } finally {
        dispatch({ type: "IS_FETCHING", isFetching: false });
      }
    };

    initializeAppData();
  }, [
    isLoggedIn,
    isFetching,
    initState.initialDataFetched,
    initState.appInitDispatched,
    dispatch,
    logout,
    profile,
    authStatus,
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
  

  const { authStatus, isLoggedIn } = useAuth();
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
      isLoggedIn &&
      window.location.hostname.includes("odoc.app") &&
      !localStorage.getItem("isVisitedContractsPage")
    ) {
      navigate("/contracts");
    }
  }, [navigate, isLoggedIn]);


  
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
      return <RegistrationForm  />;
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
