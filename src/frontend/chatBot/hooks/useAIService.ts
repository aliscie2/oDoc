import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { useBackendContext } from "@/contexts/BackendContext";
import { AIService } from "../services/AIService";

export const useAIService = () => {
  const { backendActor } = useBackendContext();
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