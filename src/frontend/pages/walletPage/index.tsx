import { backendActor, ckUSDCActor, logout } from "@/utils/backendUtils";
import { Principal } from "@dfinity/principal";
import {
  AccountBalanceWallet,
  ArrowDownward,
  ArrowUpward,
  Close,
  ContentCopy,
  Send,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { depositWithOisy } from "./useOisy";
import RunawayJellyfish from "@/components/creature/runAeayJellyFish";

// Enhanced Types
interface TransactionType {
  [key: string]: any;
}

interface Exchange {
  date_created: number;
  _type: TransactionType;
  from: string;
  to: string;
  amount: number;
}

interface Wallet {
  balance: number;
  total_debt: number;
  received: number;
  spent: number;
  owner: string;
  exchanges: Exchange[];
}

interface Friend {
  id: string;
  name: string;
}

interface Profile {
  id: string;
  [key: string]: any;
}

interface ReduxState {
  filesState: {
    all_friends: Friend[];
    profile: Profile | null;
  };
}

type DialogType = "" | "deposit" | "withdraw" | "pay";
type DepositMethod = "address" | "oisy";

interface ActionButton {
  type: DialogType;
  label: string;
  icon: React.ReactElement;
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  variant?: "contained" | "outlined" | "text";
}

interface WalletStat {
  label: string;
  value: string;
  color?: string;
  variant?: "h3" | "h4" | "h5" | "h6";
}

interface TransactionTypeConfig {
  label: string;
  isCredit: boolean;
}

// Configuration Objects
const TRANSACTION_TYPE_CONFIG: Record<string, TransactionTypeConfig> = {
  Withdraw: { label: "Withdrawal", isCredit: false },
  Deposit: { label: "Deposit", isCredit: true },
  LocalSend: { label: "Local send", isCredit: false },
  LocalReceive: { label: "Received", isCredit: true },
};

const ACTION_BUTTONS: ActionButton[] = [
  {
    type: "deposit",
    label: "Deposit",
    icon: <ArrowDownward />,
    variant: "outlined",
  },
  {
    type: "withdraw",
    label: "Withdraw",
    icon: <ArrowUpward />,
    variant: "outlined",
  },
  {
    type: "pay",
    label: "Pay",
    icon: <Send />,
    variant: "outlined",
  },
];

const OISY_LOGO = `data:image/svg+xml;base64,${btoa(
  `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><g class="text-brand-primary"><circle cx="22" cy="22" r="22" fill="#2137fc"></circle></g><path fill-rule="evenodd" clip-rule="evenodd" d="M24.412 33.4193L23.8827 35.7603C23.8037 36.1099 23.4693 36.3405 23.1152 36.2858C22.308 36.161 21.49 36.0177 20.6637 35.8594C20.2842 35.7867 20.0423 35.4133 20.1275 35.0365L20.6067 32.917C20.2711 32.8513 19.9334 32.7802 19.594 32.7042C19.288 32.6344 18.985 32.5615 18.6854 32.4855L18.2064 34.6044C18.1212 34.981 17.7426 35.214 17.3689 35.1168C16.5548 34.905 15.7547 34.6836 14.9723 34.4504C14.6284 34.3479 14.4251 33.9955 14.5043 33.6455L15.0308 31.3164C9.82695 29.2297 6.54161 25.683 7.93603 19.6262L8.27156 18.1421C9.62094 12.0626 14.1109 10.2811 19.7056 10.6393L20.2318 8.31177C20.3109 7.96173 20.646 7.73105 21.0006 7.78645C21.8072 7.91249 22.6247 8.05683 23.4507 8.21592C23.8299 8.28895 24.0714 8.66213 23.9863 9.03875L23.5073 11.1575C23.8104 11.2179 24.1153 11.2824 24.4215 11.3511C24.7609 11.4278 25.0965 11.5083 25.4277 11.5927L25.9065 9.4751C25.9917 9.09826 26.3707 8.86528 26.7445 8.96289C27.5586 9.17544 28.3586 9.39788 29.141 9.63241C29.4843 9.73534 29.6869 10.0874 29.6079 10.437L29.0801 12.7717C34.2161 14.858 37.4261 18.402 36.0643 24.4256L35.7288 25.9097C34.3909 31.9376 29.9492 33.7421 24.412 33.4193ZM31.9629 24.7039L32.1517 23.8687C33.4814 18.3434 29.0601 16.2797 23.6094 14.9676C18.0988 13.8015 13.2196 13.7626 12.0432 19.3226L11.8544 20.1578C10.5189 25.7084 14.9403 27.7721 20.4165 29.09C25.9016 30.2503 30.7807 30.2893 31.9629 24.7039Z" fill="white"></path></svg>`,
)}`;

// Custom Hooks
const useWalletTransactions = (
  backendActor: any,
  enqueueSnackbar: (message: string, options?: any) => void,
) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const executeTransaction = async (
    type: string,
    amount: string,
    target: string,
  ): Promise<boolean> => {
    if (!amount || isNaN(Number(amount)) || parseFloat(amount) <= 0) {
      enqueueSnackbar("Please enter a valid amount", { variant: "error" });
      return false;
    }

    setIsProcessing(true);
    try {
      let result: any;

      if (type === "pay") {
        result = await backendActor.internal_transaction(
          parseFloat(amount),
          target,
          { LocalSend: null },
        );
      } else if (type === "withdraw") {
        result = await backendActor.withdraw_ckusdt(Number(amount), target);
      }

      if ("Ok" in result) {
        enqueueSnackbar("Transaction completed successfully", {
          variant: "success",
        });
        return true;
      } else if ("Err" in result) {
        enqueueSnackbar(JSON.stringify(result.Err), { variant: "error" });
        return false;
      }
    } catch (error: any) {
      console.error("Transaction failed:", error);
      enqueueSnackbar(error.message || "Transaction failed", {
        variant: "error",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
    return false;
  };

  return { executeTransaction, isProcessing };
};

// Utility Functions
const formatRelativeTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString();
};

const copyToClipboard = (text: string): void => {
  navigator.clipboard.writeText(text);
  alert("Address copied to clipboard!");
};

const getTransactionType = (exchange: Exchange): string => {
  if (!exchange._type) return "";
  const type = Object.keys(exchange._type)[0];
  return TRANSACTION_TYPE_CONFIG[type]?.label || type;
};

const getUserDisplayName = (
  userId: string,
  profileId: string,
  friends: Friend[],
): string => {
  if (userId === profileId) return "You";
  return friends.find((f) => f.id === userId)?.name || userId;
};

const getTransactionColor = (
  exchange: Exchange,
  profileId: string,
): "success.main" | "error.main" => {
  const typeKey = Object.keys(exchange._type)[0];
  const typeConfig = TRANSACTION_TYPE_CONFIG[typeKey];

  // If it's a credit transaction or user is receiver, show green
  if (typeConfig?.isCredit || exchange.to === profileId) {
    return "success.main";
  }

  return "error.main";
};

const getWalletStats = (wallet: Wallet): WalletStat[] => [
  {
    label: "Available Balance",
    value: `$${wallet.balance.toFixed(2)}`,
    variant: "h3",
  },
  {
    label: "Total Debts",
    value: `$${wallet.total_debt}`,
    variant: "h4",
    color: "error",
  },
  {
    label: "Total Received",
    value: `$${wallet.received}`,
    variant: "h6",
    color: "success.main",
  },
  {
    label: "Total Spent",
    value: `$${wallet.spent}`,
    variant: "h6",
    color: "error",
  },
];

// Components
const WalletBalance: React.FC<{ wallet: Wallet }> = ({ wallet }) => {
  const stats = getWalletStats(wallet);

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Stack spacing={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <AccountBalanceWallet />
            <Typography variant="h5">Your Wallet</Typography>
          </Box>
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid
                item
                xs={index < 2 ? 12 : 6}
                md={index < 2 ? 6 : 6}
                key={stat.label}
              >
                <Typography color="text.secondary">{stat.label}</Typography>
                <Typography variant={stat.variant} color={stat.color}>
                  {stat.value}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
};

const ActionButtons: React.FC<{ onAction: (type: DialogType) => void }> = ({
  onAction,
}) => {
  const { profile } = useSelector((state: ReduxState) => state.filesState);

  const handleDepositClick = async (actionType: DialogType) => {
    if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
      onAction(actionType);
      // Development environment logic
      // const approveResult = await ckUSDCActor.icrc1_transfer({...});
    } else {
      onAction(actionType);
    }
  };

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
      {ACTION_BUTTONS.map((button) => (
        <Button
          key={button.type}
          variant={button.variant}
          startIcon={button.icon}
          onClick={() =>
            button.type === "deposit"
              ? handleDepositClick(button.type)
              : onAction(button.type)
          }
          fullWidth
        >
          {button.label}
        </Button>
      ))}
    </Stack>
  );
};

const TransactionHistory: React.FC<{
  wallet: Wallet;
  friends: Friend[];
  profileId: string;
}> = ({ wallet, friends, profileId }) => (
  <Paper>
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Transaction History
      </Typography>
    </Box>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>From</TableCell>
          <TableCell>To</TableCell>
          <TableCell align="right">Amount</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {wallet.exchanges.length > 0 ? (
          wallet.exchanges.map((exchange, index) => (
            <TableRow key={index}>
              <TableCell>{formatRelativeTime(exchange.date_created)}</TableCell>
              <TableCell>{getTransactionType(exchange)}</TableCell>
              <TableCell>
                {getUserDisplayName(exchange.from, profileId, friends)}
              </TableCell>
              <TableCell>
                {getUserDisplayName(exchange.to, profileId, friends)}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: getTransactionColor(exchange, profileId),
                }}
              >
                ${Math.abs(exchange.amount).toFixed(2)}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} align="center">
              <Typography color="text.secondary">
                No transactions yet
              </Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </Paper>
);

const DepositDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  wallet: Wallet;
}> = ({ open, onClose, wallet }) => {
  const { profile } = useSelector((state: ReduxState) => state.filesState);
  const [depositMethod, setDepositMethod] = useState<DepositMethod>("address");
  const [oisyAmount, setOisyAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleOisyDeposit = async (): Promise<void> => {
    if (
      !oisyAmount ||
      isNaN(Number(oisyAmount)) ||
      parseFloat(oisyAmount) <= 0
    ) {
      enqueueSnackbar("Please enter a valid amount", { variant: "error" });
      return;
    }

    if (!profile) {
      enqueueSnackbar("Profile not found", { variant: "error" });
      return;
    }

    setIsProcessing(true);
    try {
      await depositWithOisy(
        parseFloat(oisyAmount),
        Principal.fromText(profile.id),
      );
      enqueueSnackbar("Deposit initiated successfully", { variant: "success" });
      onClose();
      setOisyAmount("");
    } catch (error: any) {
      enqueueSnackbar(error.message || "Deposit failed", { variant: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Deposit Funds
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1}>
            <Button
              variant={depositMethod === "address" ? "contained" : "outlined"}
              onClick={() => setDepositMethod("address")}
              fullWidth
            >
              Deposit with Address
            </Button>
            <Button
              variant={depositMethod === "oisy" ? "contained" : "outlined"}
              onClick={() => setDepositMethod("oisy")}
              fullWidth
              startIcon={
                <img
                  src={OISY_LOGO}
                  alt="Oisy"
                  style={{ width: 20, height: 20 }}
                />
              }
            >
              Deposit with Oisy
            </Button>
          </Stack>

          {depositMethod === "address" ? (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Copy your address and go to{" "}
                <Link
                  href="https://oisy.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  oisy.com
                </Link>{" "}
                to transfer CKUSDC to your wallet.
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={wallet.owner}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => copyToClipboard(wallet.owner)}>
                        <ContentCopy />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Send your funds to this address. The balance will be updated
                automatically.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Enter amount to deposit directly through Oisy integration:
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label="Amount"
                  type="number"
                  value={oisyAmount}
                  onChange={(e) => setOisyAmount(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={handleOisyDeposit}
                  disabled={isProcessing || !oisyAmount}
                  startIcon={
                    isProcessing ? <CircularProgress size={20} /> : null
                  }
                >
                  {isProcessing ? "Processing..." : "Deposit"}
                </Button>
              </Stack>
            </Box>
          )}

          <Typography color="error">
            Gas fees of Ethereum is 1$, if you send 1$ only it will be lost and
            your balance will stay 0$
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

const WithdrawDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  amount: string;
  setAmount: (amount: string) => void;
  withdrawAddress: string;
  setWithdrawAddress: (address: string) => void;
  onConfirm: () => void;
  isProcessing: boolean;
}> = ({
  open,
  onClose,
  amount,
  setAmount,
  withdrawAddress,
  setWithdrawAddress,
  onConfirm,
  isProcessing,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>
      Withdraw Funds
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", right: 8, top: 8 }}
      >
        <Close />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <Stack spacing={3} sx={{ mt: 2 }}>
        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
        />
        <TextField
          label="Withdrawal Address"
          value={withdrawAddress}
          onChange={(e) => setWithdrawAddress(e.target.value)}
          fullWidth
        />
      </Stack>
      <Typography color="error">
        Gas fees of Ethereum is 1$, if you send 1$ only it will be lost and your
        external wallet will get 0$
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={isProcessing}>
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        disabled={isProcessing}
        startIcon={isProcessing ? <CircularProgress size={20} /> : null}
      >
        {isProcessing ? "Processing..." : "Confirm Withdrawal"}
      </Button>
    </DialogActions>
  </Dialog>
);

const PayDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  recipient: string;
  setRecipient: (recipient: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  friends: Friend[];
  profileId: string;
  onConfirm: () => void;
  isProcessing: boolean;
}> = ({
  open,
  onClose,
  recipient,
  setRecipient,
  amount,
  setAmount,
  friends,
  profileId,
  onConfirm,
  isProcessing,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>
      Pay Someone
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", right: 8, top: 8 }}
      >
        <Close />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <Stack spacing={3} sx={{ mt: 2 }}>
        <Select
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          displayEmpty
          fullWidth
        >
          <MenuItem value="" disabled>
            Select recipient
          </MenuItem>
          {friends
            .filter((f) => f.id !== profileId)
            .map((friend) => (
              <MenuItem key={friend.id} value={friend.id}>
                {friend.name} ({friend.id.slice(0, 8)}...)
              </MenuItem>
            ))}
        </Select>
        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
        />
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={isProcessing}>
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        disabled={isProcessing}
        startIcon={isProcessing ? <CircularProgress size={20} /> : null}
      >
        {isProcessing ? "Processing..." : "Send Payment"}
      </Button>
    </DialogActions>
  </Dialog>
);

// Main Component
const WalletPage: React.FC<{ wallet?: Wallet }> = ({
  wallet = {} as Wallet,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [withdrawAddress, setWithdrawAddress] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<DialogType>("");

  // Using direct backendActor import
  const { all_friends, profile } = useSelector(
    (state: ReduxState) => state.filesState,
  );
  const { enqueueSnackbar } = useSnackbar();

  const { executeTransaction, isProcessing } = useWalletTransactions(
    backendActor,
    enqueueSnackbar,
  );

  const handleClose = (): void => setOpenDialog("");

  const resetForm = (): void => {
    setAmount("");
    setWithdrawAddress("");
    setRecipient("");
  };

  const handleTransaction = async (
    type: string,
    target: string,
  ): Promise<void> => {
    const success = await executeTransaction(type, amount, target);
    if (success) {
      handleClose();
      resetForm();
    }
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="mb-6">
          <Typography variant="h5" className="text-gray-600 mb-2">
            Authentication Required
          </Typography>
          <Typography variant="body1" className="text-gray-500">
            Please log in to access your wallet and continue.
          </Typography>
        </div>
        <div className="mb-6">
          <RunawayJellyfish scale={3} runaway={true} />
        </div>
      </div>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 3 }}>
      <WalletBalance wallet={wallet} />
      <ActionButtons onAction={setOpenDialog} />
      <TransactionHistory
        wallet={wallet}
        friends={all_friends}
        profileId={profile.id}
      />

      <DepositDialog
        open={openDialog === "deposit"}
        onClose={handleClose}
        wallet={wallet}
      />

      <WithdrawDialog
        open={openDialog === "withdraw"}
        onClose={handleClose}
        amount={amount}
        setAmount={setAmount}
        withdrawAddress={withdrawAddress}
        setWithdrawAddress={setWithdrawAddress}
        onConfirm={() => handleTransaction("withdraw", withdrawAddress)}
        isProcessing={isProcessing}
      />

      <PayDialog
        open={openDialog === "pay"}
        onClose={handleClose}
        recipient={recipient}
        setRecipient={setRecipient}
        amount={amount}
        setAmount={setAmount}
        friends={all_friends}
        profileId={profile.id}
        onConfirm={() => handleTransaction("pay", recipient)}
        isProcessing={isProcessing}
      />
    </Box>
  );
};

export default WalletPage;
