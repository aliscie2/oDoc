interface InitialState {
  credits: number;
  initialCredits: number;
}

const initialState: InitialState = {
  credits: 1.0,
  initialCredits: 1.0,
};

type Action =
  | { type: "ADD_AI_CREDITS"; credits: number }
  | { type: "INIT_AI_CREDITS"; credits: number }
  | { type: "RESET_AI_CREDITS"; credits: number }
  | { type: "UPDATE_AI_CREDITS"; remainingCredits: number };

export function AIReducer(state = initialState, action: Action): InitialState {
  switch (action.type) {
    case "ADD_AI_CREDITS":
      return {
        ...state,
        credits: state.credits + action.credits,
      };

    case "RESET_AI_CREDITS":
      return {
        ...state,
        credits: action.credits,
        initialCredits: action.credits,
      };

    case "INIT_AI_CREDITS":
      return {
        ...state,
        credits: action.credits,
        initialCredits: action.credits,
      };

    case "UPDATE_AI_CREDITS":
      return {
        ...state,
        credits: action.remainingCredits,
      };

    default:
      return state;
  }
}
