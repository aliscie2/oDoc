import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Grid,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  InputAdornment,
  Link,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  AccountBalanceWallet,
  ArrowDownward,
  ArrowUpward,
  Send,
  Close,
  ContentCopy,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { useBackendContext } from "@/contexts/BackendContext";
import { depositWithOisy } from "./useOisy";
import { Principal } from "@dfinity/principal";

// Types
interface Exchange {
  date_created: number;
  _type: { [key: string]: any };
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

type DialogType = "" | "deposit" | "withdraw" | "pay";

// Custom Hooks
const useWalletTransactions = (backendActor: any, enqueueSnackbar: any) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const executeTransaction = async (
    type: string,
    amount: string,
    target: string,
  ) => {
    if (!amount || isNaN(Number(amount)) || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return false;
    }

    setIsProcessing(true);
    try {
      let result;
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

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  alert("Address copied to clipboard!");
};

const getTransactionType = (exchange: Exchange): string => {
  if (!exchange._type) return "";
  const type = Object.keys(exchange._type)[0];
  const typeMap: { [key: string]: string } = {
    Withdraw: "Withdrawal",
    Deposit: "Deposit",
    LocalSend: "Local send",
    LocalReceive: "Received",
  };
  return typeMap[type] || type;
};

const getUserDisplayName = (
  userId: string,
  profileId: string,
  friends: Friend[],
): string => {
  if (userId === profileId) return "You";
  return friends.find((f) => f.id === userId)?.name || userId;
};

// Components
const WalletBalance: React.FC<{ wallet: Wallet }> = ({ wallet }) => (
  <Card sx={{ mb: 4 }}>
    <CardContent>
      <Stack spacing={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <AccountBalanceWallet />
          <Typography variant="h5">Your Wallet</Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography color="text.secondary">Available Balance</Typography>
            <Typography variant="h3">${wallet.balance.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography color="text.secondary">Total Debts</Typography>
            <Typography variant="h4" color="error">
              ${wallet.total_debt}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="text.secondary">Total Received</Typography>
            <Typography color="success.main" variant="h6">
              ${wallet.received}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="text.secondary">Total Spent</Typography>
            <Typography color="error" variant="h6">
              ${wallet.spent}
            </Typography>
          </Grid>
        </Grid>
      </Stack>
    </CardContent>
  </Card>
);

const ActionButtons: React.FC<{ onAction: (type: DialogType) => void }> = ({
  onAction,
}) => (
  <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
    <Button
      variant="outlined"
      startIcon={<ArrowDownward />}
      onClick={() => onAction("deposit")}
      fullWidth
    >
      Deposit
    </Button>
    <Button
      variant="outlined"
      startIcon={<ArrowUpward />}
      onClick={() => onAction("withdraw")}
      fullWidth
    >
      Withdraw
    </Button>
    <Button
      variant="outlined"
      startIcon={<Send />}
      onClick={() => onAction("pay")}
      fullWidth
    >
      Pay
    </Button>
  </Stack>
);

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
                  color:
                    exchange._type &&
                    (Object.keys(exchange._type)[0] === "Deposit" ||
                      Object.keys(exchange._type)[0] === "LocalReceive")
                      ? "success.main"
                      : "error.main",
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
}> = ({ open, onClose, wallet }) => (
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
      <Box py={2}>
        <Typography variant="subtitle2" gutterBottom>
          Copy your address and go to{" "}
          <Link
            href="https://oisy.com/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ "&:hover": { color: "primary.dark" } }}
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
      <Typography color="error">
        Gas fees of Ethirum is 1$, if you send 1$ only it will be lost and your
        balance will stay 0$
      </Typography>
    </DialogContent>
  </Dialog>
);

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
        Gas fees of Ethirum is 1$, if you send 1$ only it will be lost and your
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
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [openDialog, setOpenDialog] = useState<DialogType>("");
  const { backendActor } = useBackendContext();

  const { all_friends, profile } = useSelector(
    (state: any) => state.filesState,
  );

  const { enqueueSnackbar } = useSnackbar();

  const { executeTransaction, isProcessing } = useWalletTransactions(
    backendActor,
    enqueueSnackbar,
  );

  const handleClose = () => setOpenDialog("");

  const resetForm = () => {
    setAmount("");
    setWithdrawAddress("");
    setRecipient("");
  };

  const handleTransaction = async (type: string, target: string) => {
    const success = await executeTransaction(type, amount, target);
    if (success) {
      handleClose();
      resetForm();
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 3 }}>
      <Button
        disabled={!profile?.id}
        onClick={async () => {
          await depositWithOisy(100, Principal.fromText(profile?.id));
        }}
      >
        Deposit with oisy
      </Button>
      <WalletBalance wallet={wallet} />
      <ActionButtons onAction={setOpenDialog} />
      <TransactionHistory
        wallet={wallet}
        friends={all_friends}
        profileId={profile?.id}
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
        profileId={profile?.id}
        onConfirm={() => handleTransaction("pay", recipient)}
        isProcessing={isProcessing}
      />
    </Box>
  );
};

export default WalletPage;
