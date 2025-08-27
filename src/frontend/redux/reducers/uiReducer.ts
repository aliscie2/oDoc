import { State, initialState, Action } from "../types/uiTypes";

export function uiReducer(state = initialState, action: Action): State {
  switch (action.type) {
    case "SET_AUTH_STATUS":
      return {
        ...state,
        authStatus: action.authStatus,
        // Update legacy fields for backward compatibility during migration
        isLoggedIn: action.authStatus === 'authenticated' || action.authStatus === 'registered',
        isRegistered: action.authStatus === 'registered',
      };
    case "IS_FETCHING":
      return {
        ...state,
        isFetching: action.isFetching,
      };
    case "IS_REGISTERED":
      return {
        ...state,
        isRegistered: action.isRegistered,
        // Update authStatus based on legacy action for backward compatibility
        authStatus: action.isRegistered ? 'registered' : 'authenticated',
      };

    case "TOGGLE_NAV":
      return {
        ...state,
        isNavOpen: !state.isNavOpen,
      };
    case "POST_VOTE":
      return {
        ...state,
        post_vote: action.postVote,
      };
    case "TOGGLE_DARK":
      localStorage.setItem("isDarkMode", !state.isDarkMode);
      document.querySelector("body")?.classList.toggle("dark");
      return {
        ...state,
        isDarkMode: !state.isDarkMode,
      };
    case "SEARCH":
      return {
        ...state,
        searchValue: action.searchValue,
      };
    case "LOGOUT":
      return {
        ...state,
        authStatus: 'anonymous',
        isRegistered: null,
        isLoggedIn: false,
      };
    case "LOGIN":
      return {
        ...state,
        authStatus: 'authenticated',
        isLoggedIn: true,
      };
    case "SEARCH_TOOL":
      return {
        ...state,
        searchTool: !state.searchTool,
      };
    default:
      return state;
  }
}
