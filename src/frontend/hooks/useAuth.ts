import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  login as loginUtil,
  logout as logoutUtil,
  BackendUtils,
} from "../utils/backendUtils";
import { selectAuthStatus } from "../redux/selectors";
import { backendActor } from "../utils/backendUtils";
import type { AuthStatus } from "../redux/types/uiTypes";
import { Principal } from "@dfinity/principal";
import { RootState } from "@/redux/reducers";

export const useAuth = () => {
  const dispatch = useDispatch();
  const authStatus = useSelector(selectAuthStatus);

  const setAuthStatus = useCallback(
    (status: AuthStatus) => {
      dispatch({ type: "SET_AUTH_STATUS", authStatus: status });
    },
    [dispatch],
  );

  const checkAuthStatus = useCallback(async () => {
    setAuthStatus("loading");

    try {
      const client = await BackendUtils.getAuthClient();
      const isAuthenticated = await client.isAuthenticated();

      if (!isAuthenticated) {
        setAuthStatus("anonymous");
        return false;
      }

      try {
        const identity = client.getIdentity();
        const principal: Principal = identity.getPrincipal();
        const profile = await backendActor.get_user_profile(principal);
        const hasProfile = profile && "Ok" in profile && profile.Ok?.id;

        setAuthStatus(hasProfile ? "registered" : "authenticated");
        return true;
      } catch (error) {
        setAuthStatus("authenticated");
        return true;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthStatus("anonymous");
      return false;
    }
  }, [setAuthStatus]);

  const login = useCallback(async () => {
    try {
      dispatch({ type: "IS_FETCHING", isFetching: true });
      const success = await loginUtil();
      if (success) {
        await checkAuthStatus();
        // Reload the page after successful login
        window.location.reload();
      }
      return success;
    } catch (error) {
      console.error("Login failed:", error);
      setAuthStatus("anonymous");
      return false;
    } finally {
      dispatch({ type: "IS_FETCHING", isFetching: false });
    }
  }, [dispatch, checkAuthStatus, setAuthStatus]);

  const logout = useCallback(async () => {
    try {
      await logoutUtil();
      setAuthStatus("anonymous");
    } catch (error) {
      console.error("Logout failed:", error);
      setAuthStatus("anonymous");
    }
  }, [setAuthStatus]);

  const register = useCallback(
    async (profileData: any) => {
      try {
        setAuthStatus("registered");
        return true;
      } catch (error) {
        console.error("Registration failed:", error);
        return false;
      }
    },
    [setAuthStatus],
  );

  const cleanUp = useCallback(async () => {
    localStorage.clear();
    // clear indexdb storage
    const indexedDB = window.indexedDB;
    if (indexedDB) {
      const openRequest = indexedDB.open("dfinity-studio", 1);
      openRequest.onsuccess = (event) => {
        const db = openRequest.result;
        const transaction = db.transaction(["canister"], "readwrite");
        const objectStore = transaction.objectStore("canister");
        objectStore.clear();
        transaction.oncomplete = () => {
          console.log("IndexedDB storage cleared successfully");
        };
        transaction.onerror = (event) => {
          console.error(
            "Error clearing IndexedDB storage:",
            event.target.error,
          );
        };
      };
      openRequest.onerror = (event) => {
        console.error("Error opening IndexedDB:", event.target.error);
      };
    }

    await logout();
  }, [setAuthStatus]);

  return {
    isLoggedIn: authStatus === "registered",
    authStatus,
    login,
    logout,
    register,
    checkAuthStatus,
    setAuthStatus,
    cleanUp,
  };
};
