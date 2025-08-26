import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { login as loginUtil, logout as logoutUtil, BackendUtils } from '../utils/backendUtils';

export const useAuth = () => {
  const dispatch = useDispatch();

  const login = useCallback(async () => {
    try {
      dispatch({ type: "IS_FETCHING", isFetching: true });
      const success = await loginUtil();
      if (success) {
        dispatch({ type: "LOGIN" });
      }
      return success;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      dispatch({ type: "IS_FETCHING", isFetching: false });
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      await logoutUtil();
      dispatch({ type: "LOGOUT" });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [dispatch]);

  const checkAuthStatus = useCallback(async () => {
    try {
      const client = await BackendUtils.getAuthClient();
      const isAuthenticated = await client.isAuthenticated();
      
      if (isAuthenticated) {
        dispatch({ type: "LOGIN" });
      } else {
        dispatch({ type: "LOGOUT" });
      }
      
      return isAuthenticated;
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: "LOGOUT" });
      return false;
    }
  }, [dispatch]);

  return {
    login,
    logout,
    checkAuthStatus,
  };
};