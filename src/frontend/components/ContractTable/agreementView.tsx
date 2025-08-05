import { Principal } from "@dfinity/principal";
import { useSnackbar } from "notistack";
import { memo, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteContractButton from "./deleteContractButton";
import { createNewPromis, getStatusOptions } from "./utils";
// Add these imports at the top
// Add these imports
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const PromiseCard = memo(({ promise, isExpanded, onToggle, isDarkMode }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { profile, all_friends, wallet, contracts } = useSelector(state => state.filesState);
  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingCell, setEditingCell] = useState(null);

  const getUserName = useCallback((principalId) => {
    const id = principalId?.toString();
    return id === profile.id ? "You" : all_friends?.find(u => u.id === id)?.name || "Unknown";
  }, [profile.id, all_friends]);

  const updatePromise = useCallback((updates) => {
    const currentContract = Object.values(contracts).find(c => c.promises?.some(p => p.id === promise.id));
    const updatedPromises = currentContract.promises.map(p => p.id === promise.id ? { ...p, ...updates } : p);
    dispatch({ type: "UPDATE_PROMISES", contract_id: promise.contract_id, promises: updatedPromises });
  }, [dispatch, promise, contracts]);

  const handleKeyChange = useCallback((oldKey, newKey) => {
    if (!newKey || oldKey === newKey) return;
    const cells = promise.cells?.map(c => c.field === oldKey ? { ...c, field: newKey, id: `${promise.id}_${newKey}` } : c) || [];
    updatePromise({ cells });
    setEditingKey(null);
    setEditingValue("");
  }, [updatePromise, promise.cells]);

  const getStatusColor = (status) => {
    const key = Object.keys(status || {})[0] || "None";
    return { None: "#9e9e9e", Released: "#4caf50", Confirmed: "#2196f3", Objected: "#f44336", HighPromise: "#ff9800" }[key];
  };

  const formatStatus = (status) => {
    const key = Object.keys(status || {})[0] || "None";
    const val = status?.[key];
    return key === "Objected" && val ? `${key}: ${val}` : key;
  };

  const handleStatusChange = useCallback((newStatus) => {
    let statusValue = null;
    if (newStatus === "Objected") {
      const reason = prompt("Enter objection reason:");
      if (reason === null) return;
      statusValue = reason || "";
    }
    updatePromise({ status: { [newStatus]: statusValue } });
  }, [updatePromise]);

  const handleAmountChange = useCallback((newAmount) => {
    const amount = parseFloat(newAmount) || 0;
    if (amount > wallet.balance) {
      enqueueSnackbar("Error: Not enough balance", { variant: "error" });
      return;
    }
    updatePromise({ amount });
  }, [updatePromise, wallet.balance, enqueueSnackbar]);

  const handleReceiverChange = useCallback((newReceiver) => {
    const user = all_friends?.find(u => u.name === newReceiver);
    if (!user || promise.sender.toString() === user.id) {
      enqueueSnackbar("Error: You can't send to yourself", { variant: "error" });
      return;
    }
    updatePromise({ receiver: Principal.fromText(user.id) });
  }, [updatePromise, all_friends, promise.sender, enqueueSnackbar]);

  const handleCellChange = useCallback((field, value) => {
    const updatedCells = promise.cells?.map(c => c.field === field ? { ...c, value } : c) || [];
    updatePromise({ cells: updatedCells });
  }, [updatePromise, promise.cells]);

  const handleAddCell = useCallback(() => {
    const existingUntitled = promise.cells?.filter(c => c.field.startsWith("untitled")).length || 0;
    const field = existingUntitled === 0 ? "untitled" : `untitled_${existingUntitled}`;
    const newCell = { id: `${promise.id}_${field}`, field, value: "" };
    const cells = [...(promise.cells || []), newCell];
    updatePromise({ cells });
  }, [promise.cells, promise.id, updatePromise]);

  const handleRemoveCell = useCallback((field) => {
    const cells = promise.cells?.filter(c => c.field !== field) || [];
    updatePromise({ cells });
  }, [updatePromise, promise.cells]);

  const handleDeletePromise = useCallback(() => {
    if (window.confirm("Delete this agreement?")) {
      dispatch({ type: "DELETE_PROMISE", contract_id: promise.contract_id, id: promise.id });
    }
  }, [dispatch, promise]);

  const statusColor = getStatusColor(promise.status);
  const statusOptions = getStatusOptions(promise, profile.id);

  return (
    <Paper sx={{ 
      borderLeft: `4px solid ${statusColor}`, 
      borderRadius: 1,
      overflow: 'hidden',
      mb: 1
    }}>
      <Box 
        onClick={onToggle}
        sx={{ 
          p: 2, 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          '&:hover': { bgcolor: 'action.hover' }
        }}
      >
        <Chip 
          label={formatStatus(promise.status)} 
          size="small"
          sx={{ 
            bgcolor: statusColor, 
            color: 'white',
            minWidth: 80,
            fontSize: '0.75rem'
          }} 
        />
        
        <Typography variant="body2" sx={{ flex: 1 }}>
          <Box component="span" sx={{ fontWeight: 500 }}>{getUserName(promise.sender)}</Box>
          {' → '}
          <Box component="span" sx={{ fontWeight: 500 }}>{getUserName(promise.receiver)}</Box>
        </Typography>
        
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'success.main', 
            fontWeight: 600,
            fontFamily: 'monospace'
          }}
        >
          ${promise.amount?.toLocaleString() || 0}
        </Typography>
        
        <Box sx={{ color: 'text.secondary', fontSize: '1.2rem' }}>
          {isExpanded ? '▼' : '▶'}
        </Box>
      </Box>

      <Collapse in={isExpanded}>
        <Divider />
        <Box sx={{ p: 2, pt: 1.5 }}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <TextField 
                label="Status" 
                select 
                fullWidth
                size="small"
                value={Object.keys(promise.status)[0] || "None"}
                onChange={e => handleStatusChange(e.target.value)}
              >
                {statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField 
                label="Amount" 
                type="number"
                fullWidth
                size="small"
                value={promise.amount || 0}
                onChange={e => handleAmountChange(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField 
                label="Receiver" 
                select 
                fullWidth
                size="small"
                value={getUserName(promise.receiver)}
                onChange={e => handleReceiverChange(e.target.value)}
              >
                {all_friends?.map(f => <MenuItem key={f.id} value={f.name}>{f.name}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Created: {new Date(promise.date_created / 1000000).toLocaleDateString()}
          </Typography>

          {promise.cells?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Agreement Conditions
                </Typography>
                <IconButton onClick={handleAddCell} size="small" color="primary">
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Stack spacing={2}>
                {promise.cells.map(cell => (
                  <Box key={cell.id} sx={{ 
                    p: 2,
                    bgcolor: isDarkMode ? 'grey.900' : 'grey.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      {editingKey === cell.field ? (
                        <TextField 
                          value={editingValue} 
                          onChange={e => setEditingValue(e.target.value)}
                          onBlur={e => handleKeyChange(cell.field, e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") handleKeyChange(cell.field, editingValue);
                            if (e.key === "Escape") { setEditingKey(null); setEditingValue(""); }
                          }}
                          autoFocus 
                          size="small"
                          variant="standard"
                          sx={{ 
                            '& .MuiInput-underline:before': { borderBottomColor: 'primary.main' },
                            '& .MuiInput-underline:after': { borderBottomColor: 'primary.main' }
                          }}
                        />
                      ) : (
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            cursor: 'pointer',
                            textDecoration: 'underline dotted',
                            textTransform: 'capitalize',
                            fontSize: '1.1rem',
                            fontWeight: 500,
                            '&:hover': { color: 'primary.main' }
                          }}
                          onClick={() => { setEditingKey(cell.field); setEditingValue(cell.field); }}
                        >
                          {cell.field.replace(/_/g, " ")}
                        </Typography>
                      )}
                      
                      <IconButton 
                        onClick={() => handleRemoveCell(cell.field)} 
                        size="small" 
                        sx={{ color: 'error.main' }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    {editingCell === cell.id ? (
                      <TextField
                        value={cell.value || ""}
                        onChange={e => handleCellChange(cell.field, e.target.value)}
                        onBlur={() => setEditingCell(null)}
                        autoFocus
                        multiline
                        rows={3}
                        fullWidth
                        variant="outlined"
                        placeholder="Enter condition description..."
                        sx={{ bgcolor: 'background.paper' }}
                      />
                    ) : (
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          lineHeight: 1.6,
                          cursor: 'text',
                          minHeight: '1.5rem',
                          color: cell.value ? 'text.primary' : 'text.secondary',
                          fontStyle: cell.value ? 'normal' : 'italic',
                          '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }
                        }}
                        onClick={() => setEditingCell(cell.id)}
                      >
                        {cell.value || "Click to add description..."}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {!promise.cells?.length && (
            <Button 
              onClick={handleAddCell} 
              startIcon={<AddIcon />} 
              variant="outlined" 
              size="small"
              sx={{ mb: 2 }}
            >
              Add Condition
            </Button>
          )}

          <Button 
            onClick={handleDeletePromise} 
            variant="outlined" 
            color="error" 
            size="small"
            startIcon={<DeleteIcon />}
            fullWidth
          >
            Delete Agreement
          </Button>
        </Box>
      </Collapse>
    </Paper>
  );
});

const AgreementView = memo(
  ({ contractId, promises, profile, isDarkMode, onSwitchToTable }) => {
    console.log({ promises });
    const dispatch = useDispatch();
    const contracts = useSelector((state) => state.filesState.contracts);
    const [expandedCards, setExpandedCards] = useState(new Set());

    const toggleCard = useCallback((id) => {
      setExpandedCards((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }, []);

    const handleAddPromise = useCallback(() => {
      dispatch({
        type: "ADD_PROMISE",
        contract_id: contractId,
        promise: createNewPromis(Principal.fromText(profile.id), contractId),
        insertIndex: promises?.length || 0,
      });
    }, [dispatch, promises, profile.id, contracts]);

    return (
      <Box sx={{ p: 2, maxHeight: "70vh", overflowY: "auto" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">
            Agreements ({promises?.length || 0})
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              onClick={handleAddPromise}
              variant="outlined"
              color="success"
              startIcon={<AddIcon />}
            >
              Add Promise
            </Button>
            <DeleteContractButton contractId={contractId} />
            <Button onClick={onSwitchToTable} variant="outlined">
              Switch to Table
            </Button>
          </Stack>
        </Box>

        {!promises?.length ? (
          <Box
            sx={{
              textAlign: "center",
              py: 5,
              color: isDarkMode ? "#aaa" : "#666",
            }}
          >
            <Typography>
              No agreements found. Click "Add Promise" to create your first
              agreement.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {promises.map((promise) => (
              <PromiseCard
                key={promise.id}
                promise={promise}
                isExpanded={expandedCards.has(promise.id)}
                onToggle={() => toggleCard(promise.id)}
                isDarkMode={isDarkMode}
              />
            ))}
          </Stack>
        )}
      </Box>
    );
  },
);

export default AgreementView;
