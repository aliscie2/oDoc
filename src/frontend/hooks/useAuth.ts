import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  login as loginUtil,
  logout as logoutUtil,
} from "../utils/backendUtils";
import { selectAuthStatus } from "../redux/selectors";
import type { AuthStatus } from "../redux/types/uiTypes";
import { Principal } from "@dfinity/principal";
import { IdentityManager } from "../utils/identityManager";
import { ActorFactory } from "../utils/actorFactory";

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
      // Use validated identity instead of raw auth client
      const identity = await IdentityManager.getValidatedIdentity();

      if (!identity) {
        setAuthStatus("anonymous");
        return false;
      }

      try {
        const principal: Principal = identity.getPrincipal();

        // Use ActorFactory for reliable actor calls
        const { canisterId, idlFactory } = await import(
          "$/declarations/backend"
        );
        const profile = await ActorFactory.executeWithRecovery(
          {
            canisterId,
            idlFactory,
            actorType: "backend",
          },
          (actor) => actor.get_user_profile(principal),
        );

        const hasProfile = profile && "Ok" in profile && profile.Ok?.id;
        setAuthStatus(hasProfile ? "registered" : "authenticated");
        return true;
      } catch (error) {
        console.warn("Profile check failed, but identity is valid:", error);
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
    async (_profileData: unknown) => {
      try {
        setAuthStatus("registered");
        return true;
      } catch (_error) {
        console.error("Registration failed:", _error);
        return false;
      }
    },
    [setAuthStatus],
  );

  const cleanUp = useCallback(async () => {
    try {
      // Use enhanced cleanup from IdentityManager
      await IdentityManager.forceRefresh();

      // Clear actor factory cache
      ActorFactory.clearCache();

      // Perform logout
      await logout();
    } catch (error) {
      console.error("Cleanup failed:", error);
      // Force cleanup even if logout fails
      await IdentityManager.forceRefresh();
      ActorFactory.clearCache();
    }
  }, [logout]);

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
