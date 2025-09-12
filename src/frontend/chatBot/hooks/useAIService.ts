import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { backendActor } from "@/utils/backendUtils";
import { AIService } from "../services/AIService";

export const useAIService = () => {
  const dispatch = useDispatch();
  const { credits: aiCredits } = useSelector((state: any) => state.AIState);

  const aiService = useMemo(
    () => new AIService(backendActor, dispatch),
    [backendActor, dispatch],
  );

  return {
    sendAIMessage: (config: any, abortSignal?: AbortSignal) => 
      aiService.sendAIMessage({ ...config, credits: aiCredits }, abortSignal),
    sendAIMessages: (configs: any[], abortSignal?: AbortSignal) => 
      aiService.sendAIMessages(configs.map(config => ({ ...config, credits: aiCredits })), abortSignal),
    createAIConfig: (prompt: string, promptType: string, classify = false, skipCreditUpdate = false) =>
      aiService.createAIConfig(prompt, promptType, classify, skipCreditUpdate, aiCredits),
  };
};