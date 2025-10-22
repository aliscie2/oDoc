import { State, initialState, Action } from "../types/uiTypes";

export function uiReducer(state = initialState, action: Action): State {
  switch (action.type) {
    case "SET_AUTH_STATUS":
      return {
        ...state,
        authStatus: action.authStatus,
      };
    case "IS_FETCHING":
      return {
        ...state,
        isFetching: action.isFetching,
      };

    case "TOGGLE_NAV":
      return {
        ...state,
        isNavOpen: !state.isNavOpen,
      };

    case "TOGGLE_DARK": {
      const newDarkMode = !state.isDarkMode;
      localStorage.setItem("isDarkMode", String(newDarkMode));
      document.querySelector("body")?.classList.toggle("dark");
      return {
        ...state,
        isDarkMode: newDarkMode,
      };
    }
    case "SEARCH":
      return {
        ...state,
        searchValue: action.searchValue,
      };
    case "LOGOUT":
      return {
        ...state,
        authStatus: "anonymous",
      };
    case "LOGIN":
      return {
        ...state,
        authStatus: "authenticated",
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
