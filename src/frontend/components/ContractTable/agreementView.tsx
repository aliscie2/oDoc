
import { Principal } from "@dfinity/principal";
import { useSnackbar } from "notistack";
import { memo, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Box, Button, Collapse, IconButton, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import DeleteContractButton from "./deleteContractButton";
import { createNewPromis, getStatusOptions } from "./utils";
// Add these imports at the top
// Add these imports
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
const PromiseCard = memo(({ promise, isExpanded, onToggle, isDarkMode }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { profile, all_friends, wallet, contracts } = useSelector((state) => state.filesState);
  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  
  const getUserName = useCallback((principalId) => {
    const id = principalId?.toString();
    return id === profile.id ? "You" : all_friends?.find(u => u.id === id)?.name || "Unknown";
  }, [profile.id, all_friends]);

  const updatePromise = useCallback((updates) => {
    const currentContract = Object.values(contracts).find(c => 
      c.promises?.some(p => p.id === promise.id)
    );
    
    const updatedPromises = currentContract.promises.map(p =>
      p.id === promise.id ? { ...p, ...updates } : p
    );

    dispatch({
      type: "UPDATE_PROMISES",
      contract_id: promise.contract_id,
      promises: updatedPromises,
    });
  }, [dispatch, promise, contracts]);

  const handleKeyChange = useCallback((oldKey, newKey) => {
    if (!newKey || oldKey === newKey) return;
    const cells = promise.cells?.map(c => 
      c.field === oldKey ? { ...c, field: newKey, id: `${promise.id}_${newKey}` } : c
    ) || [];
    updatePromise({ cells });
    setEditingKey(null);
    setEditingValue("");
  }, [updatePromise, promise.cells]);

  const getStatusColor = (status) => {
    const key = Object.keys(status || {})[0] || "None";
    const colors = {
      None: isDarkMode ? "#666" : "#999",
      Released: "#4caf50",
      Confirmed: "#2196f3", 
      Objected: "#f44336",
      HighPromise: "#ff9800"
    };
    return colors[key];
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
    const cells = [...(promise.cells?.filter(c => c.field !== field) || []), 
                    { id: `${promise.id}_${field}`, field, value }];
    updatePromise({ cells });
  }, [updatePromise, promise]);

  const handleAddCell = useCallback(() => {
    const existingUntitled = promise.cells?.filter(c => c.field.startsWith('untitled')).length || 0;
    const field = existingUntitled === 0 ? 'untitled' : `untitled_${existingUntitled}`;
    handleCellChange(field, "");
  }, [handleCellChange, promise.cells]);

  const handleRemoveCell = useCallback((field) => {
    const cells = promise.cells?.filter(c => c.field !== field) || [];
    updatePromise({ cells });
  }, [updatePromise, promise.cells]);

  const handleDeletePromise = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this promise?')) {
      dispatch({
        type: "DELETE_PROMISE",
        contract_id: promise.contract_id,
        id: promise.id,
      });
    }
  }, [dispatch, promise]);

  const statusColor = getStatusColor(promise.status);
  const statusOptions = getStatusOptions(promise, profile.id);

  return (
    <Paper 
      sx={{ 
        border: `1px solid ${statusColor}`, 
        p: 1.5, 
        transition: 'all 0.2s ease',
        bgcolor: isDarkMode ? '#1e1e1e' : '#fff'
      }}
    >
      <Box onClick={onToggle} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: 14, cursor: 'pointer' }}>
        <Typography variant="caption" sx={{ color: statusColor, fontWeight: 'bold', minWidth: 80 }}>
          {formatStatus(promise.status)}
        </Typography>
        <Typography variant="body2">
          {getUserName(promise.sender)} → {getUserName(promise.receiver)}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 'auto' }}>
          ${promise.amount?.toLocaleString() || 0}
        </Typography>
        <Typography variant="caption" sx={{ color: isDarkMode ? '#888' : '#666' }}>
          {isExpanded ? '▼' : '▶'}
        </Typography>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${isDarkMode ? '#333' : '#eee'}` }} onClick={e => e.stopPropagation()}>
          <IconButton 
            onClick={handleDeletePromise}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8, color: '#f44336' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>

          <Stack spacing={1} sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ minWidth: 80, color: isDarkMode ? '#aaa' : '#666' }}>Status:</Typography>
              <Select
                value={Object.keys(promise.status)[0] || "None"}
                onChange={(e) => handleStatusChange(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              >
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ minWidth: 80, color: isDarkMode ? '#aaa' : '#666' }}>Amount:</Typography>
              <TextField
                type="number"
                value={promise.amount || 0}
                onChange={(e) => handleAmountChange(e.target.value)}
                size="small"
                fullWidth
                InputProps={{ startAdornment: '$' }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ minWidth: 80, color: isDarkMode ? '#aaa' : '#666' }}>Receiver:</Typography>
              <Select
                value={getUserName(promise.receiver)}
                onChange={(e) => handleReceiverChange(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              >
                {all_friends?.map(friend => (
                  <MenuItem key={friend.id} value={friend.name}>{friend.name}</MenuItem>
                ))}
              </Select>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ minWidth: 80, color: isDarkMode ? '#aaa' : '#666' }}>Created:</Typography>
              <Typography variant="caption">
                {new Date(promise.date_created / 1000000).toLocaleString()}
              </Typography>
            </Box>
          </Stack>

          {promise.cells?.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: isDarkMode ? '#aaa' : '#666' }}>Conditions:</Typography>
                <IconButton onClick={handleAddCell} size="small">
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
              <Stack spacing={0.75}>
                {promise.cells.map(cell => (
                  <Box key={cell.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.75, bgcolor: isDarkMode ? '#2a2a2a' : '#f5f5f5', borderRadius: 0.5 }}>
                    {editingKey === cell.field ? (
                      <TextField
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={(e) => handleKeyChange(cell.field, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleKeyChange(cell.field, editingValue);
                          if (e.key === 'Escape') { setEditingKey(null); setEditingValue(""); }
                        }}
                        autoFocus
                        size="small"
                        sx={{ minWidth: 80 }}
                      />
                    ) : (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          minWidth: 80, 
                          color: isDarkMode ? '#aaa' : '#666',
                          textTransform: 'capitalize',
                          cursor: 'pointer',
                          textDecoration: 'underline dotted'
                        }}
                        onClick={() => { setEditingKey(cell.field); setEditingValue(cell.field); }}
                      >
                        {cell.field.replace(/_/g, " ")}:
                      </Typography>
                    )}
                    <TextField
                      value={cell.value || ""}
                      onChange={(e) => handleCellChange(cell.field, e.target.value)}
                      size="small"
                      fullWidth
                      placeholder="Enter condition..."
                      variant="standard"
                    />
                    <IconButton onClick={() => handleRemoveCell(cell.field)} size="small" sx={{ color: '#f44336' }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
          
          {!promise.cells?.length && (
            <Button onClick={handleAddCell} startIcon={<AddIcon />} sx={{ mt: 1 }}>
              Add Condition
            </Button>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
});

const AgreementView = memo(({ contractId, promises, profile, isDarkMode, onSwitchToTable }) => {
  console.log({promises})
  const dispatch = useDispatch();
  const contracts = useSelector(state => state.filesState.contracts);
  const [expandedCards, setExpandedCards] = useState(new Set());

  const toggleCard = useCallback((id) => {
    setExpandedCards(prev => {
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
    <Box sx={{ p: 2, maxHeight: '70vh', overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Agreements ({promises?.length || 0})</Typography>
        <Stack direction="row" spacing={1}>
          <Button onClick={handleAddPromise} variant="outlined" color="success" startIcon={<AddIcon />}>
            Add Promise
          </Button>
          <DeleteContractButton contractId={contractId} />
          <Button onClick={onSwitchToTable} variant="outlined">
            Switch to Table
          </Button>
        </Stack>
      </Box>
      
      {!promises?.length ? (
        <Box sx={{ textAlign: 'center', py: 5, color: isDarkMode ? '#aaa' : '#666' }}>
          <Typography>No agreements found. Click "Add Promise" to create your first agreement.</Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {promises.map(promise => (
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
});


export default AgreementView;