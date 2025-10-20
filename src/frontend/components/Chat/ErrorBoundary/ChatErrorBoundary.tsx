import React, { Component, ReactNode } from "react";
import { Alert, AlertTitle, Box, Button, Typography } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Chat Error Boundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box sx={{ p: 2, maxWidth: 400 }}>
          <Alert severity="error">
            <AlertTitle>Chat Error</AlertTitle>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Something went wrong with the chat system. Please try again.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
            >
              Retry
            </Button>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}