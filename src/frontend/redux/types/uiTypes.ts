// Action Interfaces
interface ToggleNavAction {
  type: "TOGGLE_NAV";
}

interface ToggleDarkModeAction {
  type: "TOGGLE_DARK";
}

interface SearchAction {
  type: "SEARCH";
  searchValue: string;
}

interface LogoutAction {
  type: "LOGOUT";
}

interface LoginAction {
  type: "LOGIN";
}

interface ToggleSearchToolAction {
  type: "SEARCH_TOOL";
}

export type Action =
  | ToggleNavAction
  | ToggleDarkModeAction
  | SearchAction
  | LogoutAction
  | LoginAction
  | ToggleSearchToolAction
  | { type: "SET_AUTH_STATUS"; authStatus: AuthStatus }
  | { type: "IS_FETCHING"; isFetching: boolean };

// Auth Status Type
export type AuthStatus = 'loading' | 'anonymous' | 'authenticated' | 'registered';

// State Interface
export interface State {
  isFetching: boolean;
  authStatus: AuthStatus;
  count: number;
  isNavOpen: boolean;
  searchTool: boolean;
  isDarkMode: boolean;
  searchValue: string;
}

// Initial State
export const initialState: State = {
  authStatus: 'loading',
  count: 0,
  isNavOpen: false,
  searchTool: false,
  isDarkMode: Boolean(localStorage.getItem("isDarkMode") === "true"),
  searchValue: "",
  isFetching: false,
};
