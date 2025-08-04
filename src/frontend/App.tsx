import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Pages from "./pages";

import { Principal } from "@dfinity/principal";
import { Box, CircularProgress, styled, useTheme } from "@mui/material";
import { useSnackbar } from "notistack";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { canisterId } from "../declarations/backend";
import NavBar from "./components/MainComponents/NavBar";
import TopNavBar from "./components/MainComponents/topNavBar";
import { useBackendContext } from "./contexts/BackendContext";
import getckUsdcBalance from "./utils/getBalance";
import { RootState } from "./redux/reducers";

import RegistrationForm from "./components/MainComponents/RegistrationForm";
import {
  AvailabilityTimezone,
  EventTimezone,
} from "./pages/dash_board_v1/calindarView/serializers";

import { Job } from "$/declarations/backend/backend.did";
import GoogleCalendarOnboarding from "@/components/userBadges/coonectGoogleCalendar";
import ChatContainer from "./pages/dash_board_v1/aiChat";
import RunawayJellyfish from "./components/creature/runAeayJellyFish";
import useSocket from "./websocket/use_socket";
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

const App: React.FC = () => {
  const { pathname } = useLocation();

  // In App.tsx
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js") // Change from /sw.js to /service-worker.js
        .then((registration) => console.log("SW registered"))
        .catch((error) => console.log("SW registration failed"));
    }
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => console.log("SW registered"))
        .catch((error) => console.log("SW registration failed"));
    }
  }, []);
  const { isLoggedIn, isRegistered } = useSelector(
    (state: any) => state.uiState,
  );
  const { isFetching } = useSelector((state: RootState) => state.uiState);
  const dispatch = useDispatch();
  const { profile, files } = useSelector((state: any) => state.filesState);
  const { logout, backendActor, ckUSDCActor } = useBackendContext();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const theme = useTheme();

  const checkAuthAndLogout = useCallback(
    (error) => {
      const errorString = error?.toString() || "";
      if (
        errorString.includes("Invalid signature") &&
        errorString.includes("EcdsaP256 signature could not be verified")
      ) {
        // Clear all auth-related storage
        localStorage.clear();
        sessionStorage.clear();
        indexedDB.deleteDatabase("authClientDB"); // Clear IC auth client storage
        logout();
        return true; // Auth failed
      }
      return false;
    },
    [backendActor, logout],
  );

  const fetchJobs = async () => {
    const res: { jobs: Job[]; matching_jobs: Job[] } =
      await backendActor.get_my_jobs();
    dispatch({
      type: "INIT_JOBS",
      jobs: res.jobs,
      matchingJobs: res.matching_jobs,
    });
  };

  const { posts } = useSelector((state: RootState) => state.filesState);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        dispatch({ type: "IS_FETCHING", isFetching: true });

        const res = await backendActor.get_initial_data();

        if ("Err" in res && res.Err == "Anonymous user.") {
          dispatch({ isRegistered: false, type: "IS_REGISTERED" });
        } else {
          const workspaces = await backendActor.get_work_spaces();
          dispatch({ isRegistered: true, type: "IS_REGISTERED" });

          const getProfileRes = await backendActor.get_user_profile(
            Principal.fromText(res.Ok.Profile.id),
          );
          dispatch({
            type: "INIT_FILES_STATE",
            data: { ...res.Ok, ProfileHistory: getProfileRes.Ok, workspaces },
          });
        }
      } catch (error) {
        const isLogedOut = checkAuthAndLogout(error);
        !isLogedOut &&
          console.log("Issue fetching initial data from backend: ", error);
      }
      dispatch({
        type: "IS_FETCHING",
        isFetching: false,
      });
    };

    if (isLoggedIn && backendActor && !isFetching) {
      fetchJobs();
      fetchInitialData();
    }
  }, [backendActor]); // Do not use isLoggedIn here, because it is alreay change backendActor when isLoggedIn chancged.

  // after setup

  useEffect(() => {
    if (profile?.id) {
      (async () => {
        try {
          if (profile) {
            // get notifications
            const notificationRes =
              await backendActor.get_user_notifications(0);
            const chatsList = await backendActor.get_my_chats(0);

            dispatch({
              type: "UPDATE_NOT_LIST",
              new_list: notificationRes,
            });
            dispatch({
              type: "SET_CHATS",
              chats: chatsList,
            });
            // get calendar

            const res = await backendActor.get_my_calendar();
            const aiCredits = await backendActor.get_ai_credits();
            if (aiCredits.Err == "User does not exist") {
              const _ = await backendActor.drop_free_credits();
              dispatch({
                type: "INIT_AI_CREDITS",
                credits: 5,
                isFree: true,
              });
            } else if (!aiCredits.Err) {
              const isFree = await backendActor.is_ai_free_tier();
              dispatch({
                type: "INIT_AI_CREDITS",
                credits: aiCredits.Ok,
                isFree: isFree.Ok || true,
              });
            }
            res.events = res.events.map((event) => EventTimezone(event));
            res.availabilities = res.availabilities.map((event) =>
              AvailabilityTimezone(event),
            );
            dispatch({
              type: "SET_CALENDAR",
              calendar: res,
            });
          }
        } catch (error) {
          console.log("Issue fetching calendar from backend: ", error);
        }
      })();
    }
  }, [profile]);

  useSocket();

  // Approve tokens
  const approveTokens = useCallback(
    async (amount) => {
      try {
        console.log("Approving tokens:", {
          amount: amount.toString(),
          spender: canisterId,
        });

        const approveResult = await ckUSDCActor.icrc2_approve({
          from_subaccount: [],
          spender: {
            owner: Principal.fromText(canisterId),
            subaccount: [],
          },
          amount: amount,
          expected_allowance: [],
          expires_at: [],
          fee: [],
          memo: [],
          created_at_time: [],
        });

        console.log("Approve result:", approveResult);
        return approveResult;
      } catch (error) {
        console.error("Error approving tokens:", error);
        throw error;
      }
    },
    [ckUSDCActor],
  );

  // Deposit tokens
  const depositTokens = useCallback(async () => {
    try {
      console.log("Calling deposit_ckusdt...");
      const result = await backendActor.deposit_ckusdt();
      console.log("Deposit result:", result);
      return result;
    } catch (error) {
      console.error("Error depositing tokens:", error);
      throw error;
    }
  }, [backendActor]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // setLoading(true);

        const fetchedPosts = await backendActor?.get_posts(0, 10);

        if (fetchedPosts.length === 0) {
          // setHasMore(false);
        } else {
          dispatch({
            type: "ADD_POSTS",
            posts: fetchedPosts,
          });
        }
      } catch (error) {
        console.error("Error fetching more posts:", error);
      } finally {
        // setLoading(false);
      }
    };

    if (backendActor && posts.length) {
      fetchPosts();
    }
    // return () => {
    //   if (loadingRef.current) {
    //     observer.unobserve(loadingRef.current);
    //   }
    // };
  }, [dispatch, backendActor]);

  // Main deposit flow
  useEffect(() => {
    if (backendActor && ckUSDCActor && profile?.id) {
      (async () => {
        try {
          // 1. Get user balance
          const userBalance = await getckUsdcBalance(ckUSDCActor, profile.id);
          // console.log("User balance:", userBalance);
          // 2. Check if user has balance
          if (Number(userBalance) <= 0) {
            // console.log("User has no balance to deposit");
            return;
          }
          if (Number(userBalance) / 1_000_000 < 1) {
            // snackbar
            enqueueSnackbar(
              `You need at least 1 CKUSDT to deposit, otherwise your deposit will be lost in gas fees.`,
              { variant: "error" },
            );
            return;
          }

          // Show notification
          const notificationKey = enqueueSnackbar(
            `Processing deposit of ${Number(userBalance) / 1_000_000} CKUSDT...`,
            {
              variant: "info",
              persist: true,
              action: () => (
                <CircularProgress
                  size={24}
                  sx={{ color: theme.palette.primary.contrastText }}
                />
              ),
            },
          );

          try {
            // 4. Approve tokens
            await approveTokens(userBalance);

            enqueueSnackbar(`Tokens approved successfully`, {
              variant: "info",
            });

            // 5. Deposit tokens
            const depositResult = await depositTokens();

            // 7. Update UI based on result
            if (depositResult?.Ok) {
              dispatch({ type: "SET_WALLET", wallet: depositResult.Ok });
              closeSnackbar(notificationKey);
              enqueueSnackbar(
                `Successfully deposited ${Number(userBalance) / 1_000_000} CKUSDT`,
                { variant: "success" },
              );
            } else {
              closeSnackbar(notificationKey);
              enqueueSnackbar(
                `Deposit failed: ${JSON.stringify(depositResult)}`,
                { variant: "error" },
              );
            }
          } catch (operationError) {
            closeSnackbar(notificationKey);
            enqueueSnackbar(`Operation failed: ${operationError.toString()}`, {
              variant: "error",
            });
          }
        } catch (error) {
          console.error("Error in deposit flow:", error);
          enqueueSnackbar(`Error: ${error.toString()}`, { variant: "error" });
        }
      })();
    }
  }, [
    backendActor,
    ckUSDCActor,
    profile,
    theme.palette.primary.contrastText,
    dispatch,
    enqueueSnackbar,
    closeSnackbar,
    approveTokens,
    depositTokens,
  ]);

  if (!backendActor) {
    return <RunawayJellyfish thinking={true} scale={2} />;
  }
  return (
    <MainContent>
      {/* <PWAInstallPrompt /> */}
      {/* <SearchPopper /> */}
      <GoogleCalendarOnboarding />
      <TopNavBar />
      {isRegistered && <ChatContainer />}
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
