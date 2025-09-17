import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useThemeStyles } from "./useThemeStyles";

export const useTypingEffect = (
  text: string,
  onComplete?: () => void,
  onProgress?: () => void,
  isStreaming?: boolean,
): string => {
  const [displayText, setDisplayText] = useState("");
  const { theme } = useThemeStyles();
  const timerRef = useRef<NodeJS.Timeout>();

  const onCompleteRef = useRef(onComplete);
  const onProgressRef = useRef(onProgress);
  onCompleteRef.current = onComplete;
  onProgressRef.current = onProgress;

  const primaryColor = useMemo(
    () => theme.palette.primary.main,
    [theme.palette.primary.main],
  );

  const completeTyping = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
    setDisplayText(text);
    onCompleteRef.current?.();
  }, [text]);

  // Expose completeTyping globally to stop all typing animations
  useEffect(() => {
    const handleNewMessage = () => {
      if (displayText && displayText.length < text.length) {
        completeTyping();
      }
    };

    window.addEventListener("completeAllTyping", handleNewMessage);
    return () =>
      window.removeEventListener("completeAllTyping", handleNewMessage);
  }, [displayText, text.length, completeTyping]);

  useEffect(() => {
    if (!text) {
      setDisplayText("");
      return;
    }

    if (isStreaming) {
      setDisplayText(text);
      onProgressRef.current?.();
      return;
    }

    const typingSpeed =
      text.length > 200 ? Math.max(10, 30 - (text.length - 200) / 20) : 30;
    let currentIndex = 0;
    setDisplayText("");

    timerRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        currentIndex++;
        onProgressRef.current?.();
      } else {
        clearInterval(timerRef.current!);
        timerRef.current = undefined;
        onCompleteRef.current?.();
      }
    }, typingSpeed);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [text, isStreaming, primaryColor]);

  const shouldShowCursor =
    timerRef.current !== undefined ||
    (isStreaming && displayText.length < text.length);

  return shouldShowCursor
    ? `${displayText}<span style="color: ${primaryColor}; animation: blink 1s infinite;">|</span><style>@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }</style>`
    : displayText;
};
