import { TypingMarkdownMessageProps } from "../types";
import { useTypingEffect } from "../hooks/useTypingEffect";
import MarkdownMessage from "../markDownMessageRdnder";

export const TypingMarkdownMessage = ({
  text,
  onComplete,
  onProgress,
  isStreaming,
}: TypingMarkdownMessageProps) => {
  const textWithCursor = useTypingEffect(
    text,
    onComplete,
    onProgress,
    isStreaming,
  );
  return <MarkdownMessage message={textWithCursor} isUser={false} />;
};
