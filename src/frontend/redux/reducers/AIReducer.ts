import { GeminiAgent } from "@/AIAgents/GeminiAgent";

export interface InitialState {
  geminiAgent: GeminiAgent;
  cradits: number;
 
}

export const initialState: InitialState = {
  geminiAgent: new GeminiAgent(0),
  cradits: 0,
};

export type Action =

  | { type: "INIT_AI_AGENT"; geminiAgent: GeminiAgent; }
  | { type: "ADD_AI_CREDITS"; cradits: number, isFree: boolean };


export function AIReducer(state = initialState, action: Action): any {
  switch (action.type) {
    case "INIT_AI_AGENT":
      return {
        ...state,
        geminiAgent: action.geminiAgent,
      };

      case "ADD_AI_CREDITS":
        return {
          ...state,
          geminiAgent: state.geminiAgent.addCredits(action.cradits, action.isFree),
          cradits: state.cradits + action.cradits,
        };
   
    default:
      return state;
  }
}
