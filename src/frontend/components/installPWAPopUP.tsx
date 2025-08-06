import { Button, Checkbox, Dialog, DialogActions, DialogContent, FormControlLabel, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPopup(): JSX.Element | null {
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  useEffect(() => {
    if (localStorage.getItem('pwa-install-dismissed') === 'true') return;
    
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPopup(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
  }, []);

  const handleInstall = async (): Promise<void> => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    setDeferredPrompt(null);
    setShowPopup(false);
    
    if (dontShowAgain || outcome === 'accepted') {
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  const handleClose = (): void => {
    if (dontShowAgain) {
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
    <Dialog open={showPopup} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Install App
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Get quick access with offline support
        </Typography>
        <FormControlLabel
          control={
            <Checkbox 
              checked={dontShowAgain}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDontShowAgain(e.target.checked)}
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