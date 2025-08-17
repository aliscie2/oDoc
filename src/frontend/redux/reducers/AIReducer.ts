import { AIAgent } from "@/AIAgents/ai_agent";

interface InitialState {
  aiAgent: AIAgent;
  credits: number;
  initialCredits: number;
  isFreeAITire: boolean;
}

const initialState: InitialState = {
  aiAgent: new AIAgent(0, true),
  credits: 0,
  initialCredits: 0,
  isFreeAITire: false,
};

type Action =
  | { type: "INIT_AI_AGENT"; aiAgent: AIAgent }
  | { type: "ADD_AI_CREDITS"; credits: number; isFree: boolean }
  | { type: "INIT_AI_CREDITS"; credits: number; isFree: boolean }
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
      state.aiAgent.addCredits(action.credits, action.isFree);
      return {
        ...state,
        credits: state.aiAgent.remainingCredits(),
        isFreeAITire: false,
      };

    case "RESET_AI_CREDITS":
      // state.aiAgent.addCredits(action.credits, action.isFree)
      return {
        ...state,
        aiAgent: new AIAgent(action.credits, false),
        credits: state.credits,
        initialCredits: action.credits,
      };

    case "INIT_AI_CREDITS":
      // state.aiAgent.addCredits(action.credits, action.isFree)
      return {
        ...state,
        aiAgent: new AIAgent(action.credits, false),
        credits: action.credits,
        initialCredits: action.credits,
        isFreeAITire: action.isFree,
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
