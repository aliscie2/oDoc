import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPopup(): JSX.Element | null {
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  useEffect(() => {
    if (localStorage.getItem("pwa-install-dismissed") === "true") return;

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    if (isStandalone) return;

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPopup(true);
    };

    // Listen for the beforeinstallprompt event
    // This works on:
    // - Android Chrome/Edge
    // - iOS Chrome/Edge (iOS 16.4+)
    // - Desktop Chrome/Edge
    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener,
    );

    // For debugging: log when the event listener is set up
    if (process.env.NODE_ENV === 'development') {
      console.log('PWA: beforeinstallprompt listener added');
      
      // Check browser support
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isChrome = /chrome/.test(userAgent) && !/edg/.test(userAgent);
      const isEdge = /edg/.test(userAgent);
      const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
      
      console.log('PWA Debug:', {
        isIOS,
        isChrome,
        isEdge,
        isSafari,
        userAgent: navigator.userAgent
      });
    }

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener,
      );
  }, []);

  const handleInstall = async (): Promise<void> => {
    if (!deferredPrompt) return;

    try {
      // Trigger the native browser install prompt
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      setDeferredPrompt(null);
      setShowPopup(false);

      if (dontShowAgain || outcome === "accepted") {
        localStorage.setItem("pwa-install-dismissed", "true");
      }
    } catch (error) {
      console.error("Install prompt failed:", error);
    }
  };

  const handleClose = (): void => {
    if (dontShowAgain) {
      localStorage.setItem("pwa-install-dismissed", "true");
    }
    setShowPopup(false);
  };

  // Only show if we have a native install prompt
  if (!showPopup || !deferredPrompt) return null;

  return (
    <Dialog open={showPopup} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          Install App
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Get quick access with offline support
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={dontShowAgain}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setDontShowAgain(e.target.checked)
              }
              size="small"
            />
          }
          label={<Typography variant="caption">Don't show again</Typography>}
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={handleClose} color="inherit">
          Close
        </Button>
        <Button onClick={handleInstall} variant="contained">
          Install Now
        </Button>
      </DialogActions>
    </Dialog>
  );
}
