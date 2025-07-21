

// Action Interfaces
interface ToggleNavAction {
  type: "TOGGLE_NAV";
}

interface PostVoteAction {
  type: "POST_VOTE";
  postVote: any; // Adjust the type of postVote as needed
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
  | PostVoteAction
  | ToggleDarkModeAction
  | SearchAction
  | LogoutAction
  | LoginAction
  | ToggleSearchToolAction
  | { type: "IS_REGISTERED"; isRegistered: boolean }
  | { type: "IS_FETCHING"; isFetching: boolean };

// State Interface
interface InitialState {
  isFetching: boolean;
  isRegistered: boolean;
  count: number;
  isNavOpen: boolean;
  searchTool: boolean;
  isDarkMode: boolean;
  searchValue: string;
  isLoggedIn: boolean;
}

// Initial State
export const initialState: InitialState = {
  isRegistered: null,
  count: 0,
  isNavOpen: false,
  searchTool: false,
  isDarkMode: Boolean(localStorage.getItem("isDarkMode") === "true"),
  searchValue: "",
  isLoggedIn: null,
  isFetching: false,
};
