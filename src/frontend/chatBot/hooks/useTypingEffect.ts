import { useState, useEffect, useRef, useMemo } from "react";
import { useThemeStyles } from "./useThemeStyles";

export const useTypingEffect = (
  text: string,
  onComplete?: () => void,
  onProgress?: () => void,
  isStreaming?: boolean,
): string => {
  const [displayText, setDisplayText] = useState("");
  const { theme } = useThemeStyles();

  const onCompleteRef = useRef(onComplete);
  const onProgressRef = useRef(onProgress);
  onCompleteRef.current = onComplete;
  onProgressRef.current = onProgress;

  const primaryColor = useMemo(
    () => theme.palette.primary.main,
    [theme.palette.primary.main],
  );

  useEffect(() => {
    if (!text) {
      setDisplayText("");
      return;
    }

    // If streaming, show text immediately as it comes in
    if (isStreaming) {
      setDisplayText(text);
      onProgressRef.current?.();
      return;
    }

    // Traditional typing effect for non-streaming
    const typingSpeed =
      text.length > 200 ? Math.max(10, 30 - (text.length - 200) / 20) : 30;
    let currentIndex = 0;
    setDisplayText("");

    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        currentIndex++;
        onProgressRef.current?.(); // Trigger scroll on each character
      } else {
        clearInterval(timer);
        onCompleteRef.current?.();
      }
    }, typingSpeed);

    return () => clearInterval(timer);
  }, [text, isStreaming]);

  const shouldShowCursor = isStreaming || displayText.length < text.length;

  return shouldShowCursor
    ? `${displayText}<span style="color: ${primaryColor}; animation: blink 1s infinite;">|</span><style>@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }</style>`
    : displayText;
};
