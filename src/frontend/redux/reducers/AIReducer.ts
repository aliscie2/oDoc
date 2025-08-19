import { AIAgent } from "@/AIAgents/ai_agent";

interface InitialState {
  aiAgent: AIAgent;
  credits: number;
  initialCredits: number;
}

const initialState: InitialState = {
  aiAgent: new AIAgent(1.0), // Start with $1 credit
  credits: 1.0,
  initialCredits: 1.0,
};

type Action =
  | { type: "INIT_AI_AGENT"; aiAgent: AIAgent }
  | { type: "ADD_AI_CREDITS"; credits: number }
  | { type: "INIT_AI_CREDITS"; credits: number }
  | { type: "RESET_AI_CREDITS"; credits: number }
  | { type: "UPDATE_AI_CREDITS"; remainingCredits: number };

export function AIReducer(state = initialState, action: Action): any {
  switch (action.type) {
    case "INIT_AI_AGENT":
      return {
        ...state,
        aiAgent: action.aiAgent,
      };

    case "ADD_AI_CREDITS":
      state.aiAgent.addCredits(action.credits);
      return {
        ...state,
        credits: state.aiAgent.remainingCredits(),
      };

    case "RESET_AI_CREDITS":
      return {
        ...state,
        aiAgent: new AIAgent(action.credits),
        credits: action.credits,
        initialCredits: action.credits,
      };

    case "INIT_AI_CREDITS":
      return {
        ...state,
        aiAgent: new AIAgent(action.credits),
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
