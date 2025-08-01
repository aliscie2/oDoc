
import { Principal } from "@dfinity/principal";
import { useSnackbar } from "notistack";
import { memo, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStatusOptions } from "./utils";
import { useBackendContext } from "@/contexts/BackendContext";
import { CircularProgress } from "@mui/material";
// Add these imports at the top
// Add these imports
const PromiseCard = memo(({ promise, isExpanded, onToggle, isDarkMode }) => {
 const dispatch = useDispatch();
 const { enqueueSnackbar } = useSnackbar();
 const { profile, all_friends, wallet, contracts } = useSelector((state) => state.filesState);
 const [editingKey, setEditingKey] = useState(null);
 const [editingValue, setEditingValue] = useState("");
 
 const getUserName = useCallback((principalId) => {
   const id = principalId?.toString();
   if (id === profile.id) return "You";
   return all_friends?.find(u => u.id === id)?.name || "Unknown";
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

 const startEditing = useCallback((field) => {
   setEditingKey(field);
   setEditingValue(field);
 }, []);

 const cancelEditing = useCallback(() => {
   setEditingKey(null);
   setEditingValue("");
 }, []);




 const getStatusColor = (status) => {
   const key = Object.keys(status || {})[0] || "None";
   const colors = {
     None: isDarkMode ? "#666" : "#999",
     Released: "#4caf50",
     Confirmed: "#2196f3", 
     Objected: "#f44336",
     HighPromise: "#ff9800"
   };
   return colors[key] || colors.None;
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
   if (!user) return;

   if (promise.sender.toString() === user.id) {
     enqueueSnackbar("Error: You can't send to yourself", { variant: "error" });
     return;
   }
   updatePromise({ receiver: Principal.fromText(user.id) });
 }, [updatePromise, all_friends, promise.sender, enqueueSnackbar]);

 const handleCellChange = useCallback((field, value) => {
   const cells = promise.cells?.filter(c => c.field !== field) || [];
   cells.push({ id: `${promise.id}_${field}`, field, value });
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
   <div 
     style={{
       border: `1px solid ${statusColor}`,
       borderRadius: "8px",
       padding: "12px",
       background: isDarkMode ? "#1e1e1e" : "#fff",
       transition: "all 0.2s ease",
       position: "relative"
     }}
   >
     <div 
       style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", cursor: "pointer" }}
       onClick={onToggle}
     >
       <span style={{ color: statusColor, fontWeight: "bold", minWidth: "80px" }}>
         {formatStatus(promise.status)}
       </span>
       <span>
         {getUserName(promise.sender)} → {getUserName(promise.receiver)}
       </span>
       <span style={{ fontWeight: "bold", marginLeft: "auto" }}>
         ${promise.amount?.toLocaleString() || 0}
       </span>
       <span style={{ color: isDarkMode ? "#888" : "#666", fontSize: "12px" }}>
         {isExpanded ? "▼" : "▶"}
       </span>
     </div>

     {isExpanded && (
       <div 
         style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${isDarkMode ? "#333" : "#eee"}` }}
         onClick={e => e.stopPropagation()}
       >
         <button
           onClick={handleDeletePromise}
           style={{
             top: "8px",
             right: "8px",
             padding: "4px 8px",
             border: "1px solid #f44336",
             borderRadius: "4px",
             background: "transparent",
             color: "#f44336",
             cursor: "pointer",
             fontSize: "11px"
           }}
         >
           Delete
         </button>

         <div style={{ display: "grid", gap: "8px", marginBottom: "12px" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
             <label style={{ minWidth: "80px", fontSize: "12px", color: isDarkMode ? "#aaa" : "#666" }}>Status:</label>
             <select
               value={Object.keys(promise.status)[0] || "None"}
               onChange={(e) => handleStatusChange(e.target.value)}
               style={{
                 flex: 1,
                 padding: "4px 8px",
                 border: "1px solid currentColor",
                 borderRadius: "4px",
                 background: "inherit",
                 color: "inherit"
               }}
             >
               {statusOptions.map(status => (
                 <option key={status} value={status}>{status}</option>
               ))}
             </select>
           </div>

           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
             <label style={{ minWidth: "80px", fontSize: "12px", color: isDarkMode ? "#aaa" : "#666" }}>Amount:</label>
             <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
               <span style={{ marginRight: "4px" }}>$</span>
               <input
                 type="number"
                 value={promise.amount || 0}
                 onChange={(e) => handleAmountChange(e.target.value)}
                 style={{
                   flex: 1,
                   padding: "4px 8px",
                   border: "1px solid currentColor",
                   borderRadius: "4px",
                   background: "inherit",
                   color: "inherit"
                 }}
               />
             </div>
           </div>

           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
             <label style={{ minWidth: "80px", fontSize: "12px", color: isDarkMode ? "#aaa" : "#666" }}>Receiver:</label>
             <select
               value={getUserName(promise.receiver)}
               onChange={(e) => handleReceiverChange(e.target.value)}
               style={{
                 flex: 1,
                 padding: "4px 8px",
                 border: "1px solid currentColor",
                 borderRadius: "4px",
                 background: "inherit",
                 color: "inherit"
               }}
             >
               {all_friends?.map(friend => (
                 <option key={friend.id} value={friend.name}>{friend.name}</option>
               ))}
             </select>
           </div>

           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
             <label style={{ minWidth: "80px", fontSize: "12px", color: isDarkMode ? "#aaa" : "#666" }}>Created:</label>
             <span style={{ fontSize: "12px" }}>
               {new Date(promise.date_created / 1000000).toLocaleString()}
             </span>
           </div>
         </div>

         {promise.cells?.length > 0 && (
           <div style={{ marginTop: "12px" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
               <span style={{ fontSize: "12px", color: isDarkMode ? "#aaa" : "#666" }}>
                 Conditions:
               </span>
               <button
                 onClick={handleAddCell}
                 style={{
                   padding: "2px 8px",
                   border: "1px solid currentColor",
                   borderRadius: "4px",
                   background: "transparent",
                   color: "inherit",
                   cursor: "pointer",
                   fontSize: "11px"
                 }}
               >
                 + Add
               </button>
             </div>
             <div style={{ display: "grid", gap: "6px" }}>
               {promise.cells.map(cell => (
                 <div 
                   key={cell.id}
                   style={{
                     display: "flex",
                     alignItems: "center",
                     gap: "8px",
                     padding: "6px",
                     background: isDarkMode ? "#2a2a2a" : "#f5f5f5",
                     borderRadius: "4px"
                   }}
                 >
                  {editingKey === cell.field ? (
  <input
    type="text"
    value={editingValue}
    onChange={(e) => setEditingValue(e.target.value)}
    onBlur={(e) => handleKeyChange(cell.field, e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter') handleKeyChange(cell.field, editingValue);
      if (e.key === 'Escape') cancelEditing();
    }}
    autoFocus
    style={{
      minWidth: "80px",
      padding: "2px 4px",
      border: "1px solid currentColor",
      borderRadius: "2px",
      background: "inherit",
      color: "inherit",
      fontSize: "11px"
    }}
  />
) : (
  <span 
    style={{ 
      minWidth: "80px", 
      fontSize: "11px", 
      color: isDarkMode ? "#aaa" : "#666",
      textTransform: "capitalize",
      cursor: "pointer",
      textDecoration: "underline dotted"
    }}
    onClick={() => startEditing(cell.field)}
  >
    {cell.field.replace(/_/g, " ")}:
  </span>
)}
                   <input
                     type="text"
                     value={cell.value || ""}
                     onChange={(e) => handleCellChange(cell.field, e.target.value)}
                     style={{
                       flex: 1,
                       padding: "2px 6px",
                       border: "1px solid transparent",
                       borderRadius: "2px",
                       background: "transparent",
                       color: "inherit",
                       fontSize: "12px"
                     }}
                     placeholder="Enter condition..."
                   />
                   <button
                     onClick={() => handleRemoveCell(cell.field)}
                     style={{
                       padding: "2px 6px",
                       border: "1px solid #f44336",
                       borderRadius: "2px",
                       background: "transparent",
                       color: "#f44336",
                       cursor: "pointer",
                       fontSize: "10px"
                     }}
                   >
                     ×
                   </button>
                 </div>
               ))}
             </div>
           </div>
         )}
         
         {!promise.cells?.length && (
           <button
             onClick={handleAddCell}
             style={{
               padding: "8px 16px",
               border: "1px solid currentColor",
               borderRadius: "4px",
               background: "transparent",
               color: "inherit",
               cursor: "pointer",
               fontSize: "12px",
               marginTop: "8px"
             }}
           >
             + Add Condition
           </button>
         )}
       </div>
     )}
   </div>
 );
});

const AgreementView = memo(({ promises, profile, all_friends, isDarkMode, onSwitchToTable }) => {
  const dispatch = useDispatch();
  const contracts = useSelector(state => state.filesState.contracts);
  const [expandedCards, setExpandedCards] = useState(new Set());




 const { backendActor } = useBackendContext();
const [isDeleting,setDeleting] = useState(false)

 const handleDeleteContract = useCallback(async () => {
   const contractId = Object.keys(contracts)[0];
   if (!contractId) return;
   
   if (window.confirm('Are you sure you want to delete this contract? This will delete all promises.')) {
     try {
        setDeleting(true)
       let res = await backendActor.delete_custom_contract(contractId);
       dispatch({type:"DELETE_CUSTOM_CONTRACT",id:contractId})
       setDeleting(false)
     } catch (error) {
       console.error('Failed to delete contract:', error);
     }
   }
 }, [backendActor, contracts]);


  const toggleCard = useCallback((id) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleAddPromise = useCallback(() => {
    const contractId = Object.keys(contracts)[0];
    if (!contractId) return;

    const newPromise = {
      id: `fresh_promise_${Date.now()}`,
      contract_id: contractId,
      amount: 0,
      sender: Principal.fromText(profile.id),
      receiver: Principal.fromText("2vxsx-fae"),
      status: { None: null },
      date_created: Date.now() * 1e6,
      date_released: 0,
      cells: [],
    };

    dispatch({
      type: "ADD_PROMISE",
      contract_id: contractId,
      promise: newPromise,
      insertIndex: promises?.length || 0,
    });
  }, [dispatch, promises, profile.id, contracts]);
  return (
    <div style={{ padding: "16px", maxHeight: "70vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3>Agreements ({promises?.length || 0})</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleAddPromise}
            style={{
              padding: "8px 16px",
              border: "1px solid #4caf50",
              borderRadius: "4px",
              background: "transparent",
              color: "#4caf50",
              cursor: "pointer"
            }}
          >
            + Add Promise
          </button>
          <button
           onClick={handleDeleteContract}
           style={{
             padding: "8px 16px",
             border: "1px solid #f44336",
             borderRadius: "4px",
             background: "transparent",
             color: "#f44336",
             cursor: "pointer"
           }}
         >
           {isDeleting?<CircularProgress/> :"Delete Contract"}
         </button>
          <button 
            onClick={onSwitchToTable}
            style={{ 
              padding: "8px 16px", 
              border: "1px solid currentColor", 
              borderRadius: "4px", 
              background: "transparent", 
              color: "inherit", 
              cursor: "pointer" 
            }}
          >
            Switch to Table
          </button>
        </div>
      </div>
      
      {!promises?.length ? (
        <div style={{ textAlign: "center", padding: "40px", color: isDarkMode ? "#aaa" : "#666" }}>
          No agreements found. Click "Add Promise" to create your first agreement.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {promises.map(promise => (
            <PromiseCard
              key={promise.id}
              promise={promise}
              isExpanded={expandedCards.has(promise.id)}
              onToggle={() => toggleCard(promise.id)}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      )}
    </div>
  );
});


export default AgreementView;