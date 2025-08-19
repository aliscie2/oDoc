import React, { useCallback, useEffect, Suspense } from "react";
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
import { RootState } from "./redux/reducers";
import getckUsdcBalance from "./utils/getBalance";

import RegistrationForm from "./components/MainComponents/RegistrationForm";
import {
  AvailabilityTimezone,
  EventTimezone,
} from "./pages/dash_board_v1/calindarView/serializers";

import { Job } from "$/declarations/backend/backend.did";
import RunawayJellyfish from "./components/creature/runAeayJellyFish";
import useSocket from "./websocket/use_socket";

// Lazy load heavy components
const GoogleCalendarOnboarding = React.lazy(
  () => import("@/components/userBadges/coonectGoogleCalendar"),
);
const ChatContainer = React.lazy(
  () => import("./pages/dash_board_v1/ChatContainer"),
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

const App: React.FC = () => {
  console.log("redner");

  // In App.tsx
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => console.log("SW registered", registration))
        .catch((error) => console.log("SW registration failed", error));
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
    (error: any) => {
      const errorString = error?.toString() || "";

      // Check for various auth-related errors
      const authErrors = [
        "Invalid signature",
        "EcdsaP256 signature could not be verified",
        "Invalid delegation",
        "IcCanisterSignature signature could not be verified",
        "certificate verification failed",
        "threshold signature",
      ];

      const hasAuthError = authErrors.some((errorType) =>
        errorString.includes(errorType),
      );

      if (hasAuthError) {
        console.log("Authentication error detected, clearing auth state...");

        // Clear all auth-related storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear IndexedDB auth storage
        if (typeof window !== "undefined" && window.indexedDB) {
          try {
            indexedDB.deleteDatabase("authClientDB");
          } catch (e) {
            console.warn("Could not clear IndexedDB:", e);
          }
        }

        logout();
        return true; // Auth failed
      }
      return false;
    },
    [logout],
  );

  const fetchJobs = async () => {
    if (!backendActor) return;

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
      if (!backendActor) return;

      try {
        dispatch({ type: "IS_FETCHING", isFetching: true });

        // Try the original get_initial_data first
        try {
          const res = await backendActor.get_initial_data();

          if ("Err" in res && res.Err === "Anonymous user.") {
            dispatch({ isRegistered: false, type: "IS_REGISTERED" });
            return;
          }

          // If successful, get workspaces and profile history
          const workspaces = await backendActor
            .get_work_spaces()
            .catch(() => []);
          dispatch({ isRegistered: true, type: "IS_REGISTERED" });

          const getProfileRes = await backendActor.get_user_profile(
            Principal.fromText(res.Ok.Profile.id),
          );

          dispatch({
            type: "INIT_FILES_STATE",
            data: {
              ...res.Ok,
              ProfileHistory: getProfileRes.Ok || getProfileRes,
              workspaces,
            },
          });
        } catch (initialDataError: any) {
          // If get_initial_data fails due to payload size, try chunked approach
          if (
            initialDataError?.toString().includes("payload size") ||
            initialDataError?.toString().includes("3145728") ||
            initialDataError?.toString().includes("3350595")
          ) {
            console.log("Payload too large, trying chunked data fetch...");

            // Get profile first to check if user exists
            const profileRes = await backendActor.get_user_profile(
              Principal.anonymous(),
            );

            if (
              "Err" in profileRes &&
              profileRes.Err === "User does not exist"
            ) {
              dispatch({ isRegistered: false, type: "IS_REGISTERED" });
              return;
            }

            dispatch({ isRegistered: true, type: "IS_REGISTERED" });

            // Fetch data in smaller chunks
            const [workspaces, friends, wallet] = await Promise.all([
              backendActor.get_work_spaces().catch(() => []),
              backendActor.get_friends().catch(() => []),
              backendActor.get_wallet().catch(() => null),
            ]);

            // Get files in smaller batches
            const files = await backendActor.get_page_files(1).catch(() => []);

            // Initialize with chunked data
            dispatch({
              type: "INIT_FILES_STATE",
              data: {
                Profile: profileRes.Ok || profileRes,
                ProfileHistory: profileRes.Ok || profileRes,
                Files: files,
                FilesContents: [], // Load this separately if needed
                Friends: friends,
                Contracts: {}, // Load contracts separately if needed
                Wallet: wallet,
                workspaces,
              },
            });
          } else {
            // Re-throw if it's not a payload size error
            throw initialDataError;
          }
        }
      } catch (error: any) {
        const isLoggedOut = checkAuthAndLogout(error);
        if (!isLoggedOut) {
          console.log("Issue fetching initial data from backend: ", error);
        }
      } finally {
        dispatch({
          type: "IS_FETCHING",
          isFetching: false,
        });
      }
    };

    if (isLoggedIn && backendActor && !isFetching) {
      fetchJobs();
      fetchInitialData();
    }
  }, [backendActor]);

  // after setup

  useEffect(() => {
    if (profile?.id && backendActor) {
      (async () => {
        try {
          if (profile) {
            // get notifications
            const notificationRes = await backendActor.get_user_notifications(
              BigInt(0),
            );
            const chatsList = await backendActor.get_my_chats(BigInt(0));

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
            if ("Err" in aiCredits && aiCredits.Err == "User does not exist") {
              const _ = await backendActor.drop_free_credits();
              dispatch({
                type: "INIT_AI_CREDITS",
                credits: 1,
                isFree: true,
              });
            } else if ("Ok" in aiCredits) {
              const isFree = await backendActor.is_ai_free_tier();
              dispatch({
                type: "INIT_AI_CREDITS",
                credits: aiCredits.Ok,
                isFree: ("Ok" in isFree && isFree.Ok) || true,
              });
            }
            res.events = res.events.map((event: any) => EventTimezone(event));
            res.availabilities = res.availabilities.map((event: any) =>
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
  }, [backendActor]);

  useSocket();

  // Approve tokens
  const approveTokens = useCallback(
    async (amount: any) => {
      if (!ckUSDCActor) throw new Error("ckUSDCActor not available");

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
    if (!backendActor) throw new Error("backendActor not available");

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
      if (!backendActor) return;

      try {
        const fetchedPosts = await backendActor.get_posts(
          BigInt(0),
          BigInt(10),
        );

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
      }
    };

    if (backendActor && posts.length === 0) {
      fetchPosts();
    }
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
            if ("Ok" in depositResult) {
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
          } catch (operationError: any) {
            closeSnackbar(notificationKey);
            enqueueSnackbar(
              `Operation failed: ${operationError?.toString() || "Unknown error"}`,
              {
                variant: "error",
              },
            );
          }
        } catch (error: any) {
          console.error("Error in deposit flow:", error);
          enqueueSnackbar(`Error: ${error?.toString() || "Unknown error"}`, {
            variant: "error",
          });
        }
      })();
    }
  }, [backendActor, ckUSDCActor, profile?.id]);

  // Add a global function for manual auth clearing (for debugging)
  useEffect(() => {
    (window as any).clearAuthState = () => {
      localStorage.clear();
      sessionStorage.clear();
      if (typeof window !== "undefined" && window.indexedDB) {
        try {
          indexedDB.deleteDatabase("authClientDB");
        } catch (e) {
          console.warn("Could not clear IndexedDB:", e);
        }
      }
      logout();
      window.location.reload();
    };
  }, [logout]);

  if (!backendActor) {
    return <RunawayJellyfish thinking={true} scale={2} />;
  }
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
