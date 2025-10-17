import { Typography, Box, useTheme } from "@mui/material";

interface MarkdownMessageProps {
  message: string;
  isUser?: boolean;
}

const MarkdownMessage = ({ message }: MarkdownMessageProps) => {
  const theme = useTheme();

  // Simple markdown renderer for common markdown elements
  const renderMarkdown = (text: string): string => {
    if (!text || typeof text !== "string") return "";

    // Convert markdown to JSX elements
    let content = text;

    // Handle code blocks (```code```)
    const codeBlockBg = theme.palette.action.hover;
    content = content.replace(/```([\s\S]*?)```/g, (_match, code) => {
      return `<pre style="background: ${codeBlockBg}; padding: 8px; border-radius: 4px; overflow-x: auto; margin: 8px 0; border: 1px solid ${theme.palette.divider};"><code>${code.trim()}</code></pre>`;
    });

    // Handle inline code (`code`)
    content = content.replace(
      /`([^`]+)`/g,
      `<code style="background: ${codeBlockBg}; padding: 2px 4px; border-radius: 2px; border: 1px solid ${theme.palette.divider};">$1</code>`,
    );

    // Handle bold (**text** or __text__)
    content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    content = content.replace(/__(.*?)__/g, "<strong>$1</strong>");

    // Handle italic (*text* or _text_)
    content = content.replace(/\*(.*?)\*/g, "<em>$1</em>");
    content = content.replace(/_(.*?)_/g, "<em>$1</em>");

    // Handle headers (# ## ###)
    content = content.replace(
      /^### (.*$)/gm,
      '<h3 style="margin: 12px 0 8px 0; font-size: 1.1em; font-weight: 600;">$1</h3>',
    );
    content = content.replace(
      /^## (.*$)/gm,
      '<h2 style="margin: 16px 0 8px 0; font-size: 1.2em; font-weight: 600;">$1</h2>',
    );
    content = content.replace(
      /^# (.*$)/gm,
      '<h1 style="margin: 16px 0 8px 0; font-size: 1.3em; font-weight: 600;">$1</h1>',
    );

    // Handle unordered lists (- item or * item)
    content = content.replace(
      /^[\-\*] (.*)$/gm,
      '<li style="margin: 4px 0;">$1</li>',
    );
    content = content.replace(
      /(<li.*<\/li>)/s,
      '<ul style="margin: 8px 0; padding-left: 20px;">$1</ul>',
    );

    // Handle ordered lists (1. item)
    content = content.replace(
      /^\d+\. (.*)$/gm,
      '<li style="margin: 4px 0;">$1</li>',
    );

    // Handle line breaks
    content = content.replace(/\n/g, "<br />");

    // Handle links [text](url)
    content = content.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      `<a href="$2" target="_blank" rel="noopener noreferrer" style="color: ${theme.palette.primary.main}; text-decoration: none;">$1</a>`,
    );

    return content;
  };

  const renderedContent = renderMarkdown(message);

  return (
    <Box
      sx={{
        textAlign: "left",
        mb: 1,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          color: theme.palette.text.primary,
          "& code": {
            fontFamily: "monospace",
            fontSize: "0.85em",
            color: theme.palette.text.primary,
          },
          "& pre": {
            fontFamily: "monospace",
            fontSize: "0.8em",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: theme.palette.text.primary,
          },
          "& ul": {
            list_style_type: "disc",
          },
          "& ol": {
            list_style_type: "decimal",
          },
          "& li": {
            display: "list-item",
          },
          "& a:hover": {
            textDecoration: "underline",
          },
          "& h1, & h2, & h3": {
            color: theme.palette.text.primary,
            fontWeight: 600,
          },
        }}
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    </Box>
  );
};

export default MarkdownMessage;
