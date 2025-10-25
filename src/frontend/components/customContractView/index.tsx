import { AgreementView } from "./components/AgreementView";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CustomContract } from "$/declarations/backend/backend.did";
import { Promise } from "./types/contract";
import { Notification } from "$/declarations/backend/backend.did";
interface CustomContractViewerProps {
  contract: CustomContract;
  currentUserId: string;
  currentUserName: string;
  currentBalance: number;
  notifications: Notification[];
  isDarkMode?: boolean;
  onAddPromise?: () => void;
  onDeletePromise?: (promiseId: string) => void;
  onUpdatePromise?: (promiseId: string, updates: Partial<Promise>) => void;
  onContractNameChange?: (name: string) => void;
  onDeleteContract?: () => void;
  onMarkNotificationSeen?: (notificationId: string) => void;
}

function CustomContractViewer({ isDarkMode, ...props }: CustomContractViewerProps) {
  const theme = isDarkMode ? 'dark' : 'light';
  
  return (
    <ThemeProvider initialTheme={theme}>
      <AgreementView {...props} />
    </ThemeProvider>
  );
}

export default CustomContractViewer;