import { useCallback } from "react";
import { useToast } from "./useToast";

export const useChatErrorHandler = () => {
  const { showToast } = useToast();

  const handleError = useCallback((
    error: unknown,
    operation: string,
    fallbackMessage?: string
  ) => {
    console.error(`Chat ${operation} error:`, error);
    
    let message = fallbackMessage || `Failed to ${operation}`;
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }
    
    showToast(message, "error");
  }, [showToast]);

  const handleSuccess = useCallback((message: string) => {
    showToast(message, "success");
  }, [showToast]);

  const handleWarning = useCallback((message: string) => {
    showToast(message, "warning");
  }, [showToast]);

  return {
    handleError,
    handleSuccess,
    handleWarning,
  };
};