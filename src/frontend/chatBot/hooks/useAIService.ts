import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { backendActor, ckUSDCActor, logout } from "@/utils/backendUtils";
import { AIService } from "../services/AIService";

export const useAIService = () => {
  // Using direct backendActor import
  const dispatch = useDispatch();

  const aiService = useMemo(
    () => new AIService(backendActor, dispatch),
    [backendActor, dispatch],
  );

  return {
    sendAIMessage: aiService.sendAIMessage.bind(aiService),
    sendAIMessages: aiService.sendAIMessages.bind(aiService),
    createAIConfig: aiService.createAIConfig.bind(aiService),
  };
};