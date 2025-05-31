import { GeminiAgent } from "@/AIAgents/GeminiAgent";

export interface InitialState {
  geminiAgent: GeminiAgent;
  credits: number;
  initialCredits: number;
  isFreeAITire: boolean;
 
}

export const initialState: InitialState = {
  geminiAgent: new GeminiAgent(0),
  credits: 0,
  initialCredits:0,
  isFreeAITire:false,
};

export type Action =

  | { type: "INIT_AI_AGENT"; geminiAgent: GeminiAgent; }
  | { type: "ADD_AI_CREDITS"; credits: number, isFree: boolean }
  | { type: "INIT_AI_CREDITS"; credits: number, isFree: boolean }
  | { type: "RESET_AI_CREDITS"; credits: number };
  

export function AIReducer(state = initialState, action: Action): any {
  switch (action.type) {
    case "INIT_AI_AGENT":
      return {
        ...state,
        geminiAgent: action.geminiAgent,
      };

      case "ADD_AI_CREDITS":
        state.geminiAgent.addCredits(action.credits, action.isFree)
        return {
          ...state,
          // geminiAgent: ,
          credits: state.credits + action.credits,
          isFreeAITire: false,
        };
        

        case "RESET_AI_CREDITS":
          // state.geminiAgent.addCredits(action.credits, action.isFree)
          return {
            ...state,
            geminiAgent: new GeminiAgent(action.credits),
            credits: state.credits,
            initialCredits: action.credits,
          };


        case "INIT_AI_CREDITS":
          // state.geminiAgent.addCredits(action.credits, action.isFree)
          return {
            ...state,
            geminiAgent: new GeminiAgent(action.credits),
            credits: state.credits,
            initialCredits: action.credits,
            isFreeAITire: action.isFree
          };
        
    default:
      return state;
  }
}
