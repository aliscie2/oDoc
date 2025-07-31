import { Principal } from "@dfinity/principal";
import {
  ClientSideRowModelModule,
  ModuleRegistry,
  NumberEditorModule,
  SelectEditorModule,
  TextEditorModule,
  ValidationModule,
} from "ag-grid-community";
import {
  CellSelectionModule,
  ClipboardModule,
  ColumnMenuModule,
  ContextMenuModule,
  StatusBarModule,
} from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { useSnackbar } from "notistack";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ValidationModule,
  SelectEditorModule,
  NumberEditorModule,
  TextEditorModule,
  CellSelectionModule,
  ClipboardModule,
  ColumnMenuModule,
  ContextMenuModule,
  StatusBarModule,
]);

// Types & Constants
const DATA_TYPES = {
  PROMISE: "promise",
  PAYMENT: "payment",
  CONTRACT: "contract", // Add this
};

const PAYMENT_STATUSES = {
  None: null,
  RequestCancellation: null,
  Released: null,
  Objected: "",
  Confirmed: null,
  ConfirmedCancellation: null,
  ApproveHighPromise: null,
  HighPromise: null,
};


const getStatusOptions = (payment, profileId) => {
  return ["None", "Released","RequestCancellation","Objected","Confirmed"]
  // const isSender = profileId === payment.sender.toString();
  // const currentStatus = Object.keys(payment.status)[0];

  // if (isSender) {
  //   switch (currentStatus) {
  //     case "None":
  //       return ["None", "Released", "HighPromise"];
  //     case "ApproveHighPromise":
  //     case "Confirmed":
  //       return ["RequestCancellation", "Released"];
  //     default:
  //       return [];
  //   }
  // } else {
  //   switch (currentStatus) {
  //     case "None":
  //       return ["Objected", "Confirmed"];
  //     case "HighPromise":
  //       return ["Objected", "ApproveHighPromise"];
  //     case "RequestCancellation":
  //       return ["Objected", "ConfirmedCancellation"];
  //     default:
  //       return [];
  //   }
  // }
};

// Custom Status Bar Component
const DataTypeSelector = memo(({ currentType, onTypeChange, contractData }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "8px",
    }}
  >
    <span>View:</span>
    <select
      value={currentType}
      onChange={(e) => onTypeChange(e.target.value)}
      style={{
        background: "inherit",
        color: "inherit",
        border: "1px solid currentColor",
        borderRadius: "4px",
        padding: "4px 8px",
      }}
    >
      <option value={DATA_TYPES.PROMISE}>
        Promises ({contractData.promises?.length || 0})
      </option>
      {(contractData.payments?.length || 0) > 0 && (
        <option value={DATA_TYPES.PAYMENT}>
          Payments ({contractData.payments.length})
        </option>
      )}
      {/* Add custom tables */}
      {(contractData.contracts || []).map((table) => (
        <option key={table.id} value={table.id}>
          {table.name} ({table.rows?.length || 0} rows)
        </option>
      ))}
    </select>
  </div>
));
// Main Component
const CustomContractViewer = memo(({ contractId }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { contracts, profile, all_friends, wallet } = useSelector(state => state.filesState);
  const { isDarkMode } = useSelector(state => state.uiState);

  const currentContract = contracts[contractId] || { promises: [], payments: [], contracts: [] };
  const [dataType, setDataType] = useState(() => 
    localStorage.getItem(`contract-${contractId}-dataType`) || DATA_TYPES.PROMISE
  );

  useEffect(() => localStorage.setItem(`contract-${contractId}-dataType`, dataType), [contractId, dataType]);

  // Data-driven column configurations
  const COLUMN_CONFIGS = {
    amount: {
      headerName: "Amount", type: "numericColumn", cellEditor: "agNumberCellEditor",
      cellEditorParams: { min: 0 }, valueFormatter: p => `${p.value?.toLocaleString() || 0}`,
      validation: (params, wallet) => params.newValue > wallet.balance ? "Error: Not enough balance" : null
    },
    status: {
      headerName: "Status", cellEditor: "agSelectCellEditor",
      cellEditorParams: p => ({ values: getStatusOptions(p.data, profile.id) }),
      valueGetter: p => {
        const key = Object.keys(p.data.status || {})[0] || "None";
        const val = p.data.status?.[key];
        return key === "Objected" && val ? `${key} (${val})` : key;
      },
      valueSetter: p => {
        if (p.newValue === "Objected") {
          const reason = prompt("Enter objection reason:");
          if (reason === null) return false;
          p.data.status = { [p.newValue]: reason || "" };
        } else {
          p.data.status = { [p.newValue]: PAYMENT_STATUSES[p.newValue] };
        }
        return true;
      }
    },
    sender: {
      headerName: "Sender", editable: false,
      valueFormatter: p => all_friends?.find(u => u.id === p.value?.toString())?.name || "Unknown"
    },
    receiver: {
      headerName: "Receiver", cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: all_friends?.map(u => u.name) || [] },
      valueGetter: p => all_friends?.find(u => u.id === p.data.receiver?.toString())?.name || "Anonymous",
      valueSetter: p => {
        const user = all_friends?.find(u => u.name === p.newValue);
        if (user) { p.data.receiver = Principal.fromText(user.id); return true; }
        return false;
      },
      validation: (params, _, profile) => 
      {
        console.log({params})
        return params.data.sender.toString() === params.receiver.toString() ? "Error: You can't send to yourself" : null
      }
    },
    date_created: {
      headerName: "Created", editable: false, type: "dateColumn",
      valueFormatter: p => new Date(p.value / 1000000).toLocaleDateString()
    }
  };

  const { rowData, columnDefs } = useMemo(() => {
    const isPromise = dataType === DATA_TYPES.PROMISE;
    const isPayment = dataType === DATA_TYPES.PAYMENT;
    const isTable = !isPromise && !isPayment;

    if (isTable) {
      const table = currentContract.contracts?.find(t => t.id === dataType);
      if (!table) return { rowData: [], columnDefs: [] };

      const rows = table.rows?.map(row => {
        const data = { id: row.id };
        row.cells?.forEach(cell => data[cell.field] = cell.value);
        return data;
      }) || [];

      const columns = table.columns?.map(col => ({
        field: col.field, headerName: col.name || col.field, editable: col.editable,
        type: col.column_type === "number" ? "numericColumn" : undefined
      })) || [];

      return { rowData: rows, columnDefs: columns };
    }

    const sourceData = isPromise ? currentContract.promises : currentContract.payments;
    const rows = sourceData?.map(item => {
      const row = { ...item };
      item.cells?.forEach(cell => row[cell.field] = cell.value);
      return row;
    }) || [];

    const cellFields = [...new Set(sourceData?.flatMap(item => item.cells?.map(c => c.field) || []))];
    
    const baseColumns = Object.entries(COLUMN_CONFIGS).map(([field, config]) => ({
      field, ...config, editable: isPromise && config.editable !== false,
      cellStyle: params => {
        const validation = config.validation?.(params, wallet, profile);
        return validation ? { backgroundColor: "#ffebee" } : {};
      }
    }));

    const dynamicColumns = cellFields.map(field => ({
      field, headerName: field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " "),
      editable: isPromise, cellEditor: "agTextCellEditor"
    }));

    return { rowData: rows, columnDefs: [...baseColumns, ...dynamicColumns] };
  }, [currentContract, dataType, all_friends, profile, wallet]);

  const onCellValueChanged = useCallback(async (params) => {
    const config = COLUMN_CONFIGS[params.colDef.field];
    const validation = config?.validation?.(params, wallet, profile);
    
    if (validation) {
      enqueueSnackbar(validation, { variant: "error" });
      params.api.refreshCells({ rowNodes: [params.node], force: true });
      return;
    }

    const isTable = dataType !== DATA_TYPES.PROMISE && dataType !== DATA_TYPES.PAYMENT;
    const { data, colDef } = params;

    if (isTable) {
      const table = currentContract.contracts?.find(t => t.id === dataType);
      const updatedRow = {
        id: data.id,
        cells: table?.columns?.map(col => ({ 
          id: `${data.id}_${col.field}`, field: col.field, value: data[col.field] || "" 
        })) || []
      };
      dispatch({ type: "UPDATE_ROW", contract_id: contractId, table_id: dataType, row: updatedRow });
      return;
    }

    const isBaseField = Object.keys(COLUMN_CONFIGS).includes(colDef.field);
    const updateType = isBaseField ? "base" : "cell";
    
    const updatedPromises = currentContract.promises.map(p => {
      if (p.id !== data.id) return p;
      
      if (updateType === "base") {
        return { ...p, [colDef.field]: data[colDef.field] };
      } else {
        const cells = p.cells?.filter(c => c.field !== colDef.field) || [];
        cells.push({ id: `${p.id}_${colDef.field}`, field: colDef.field, value: data[colDef.field] });
        return { ...p, cells };
      }
    });

    dispatch({ type: "UPDATE_PROMISES", contract_id: contractId, promises: updatedPromises });
  }, [currentContract, contractId, dispatch, enqueueSnackbar, wallet, profile, dataType]);

  // Data-driven context menu
  const CONTEXT_MENU_ACTIONS = {
    promise: {
      "Add Promise": () => dispatch({
        type: "ADD_PROMISE", contract_id: contractId,
        promise: {
          id: `fresh_promise_${Date.now()}`, contract_id: contractId, amount: 0,
          sender: Principal.fromText(profile.id), receiver: Principal.fromText("2vxsx-fae"),
          status: { None: null }, date_created: Date.now() * 1e6, date_released: 0, cells: []
        }
      }),
      "Add Column": () => {
        const field = prompt("Column name:");
        if (!field) return;
        const updated = currentContract.promises.map(p => ({
          ...p, cells: [...(p.cells || []), { id: `${p.id}_${field}`, field, value: "" }]
        }));
        dispatch({ type: "UPDATE_PROMISES", contract_id: contractId, promises: updated });
      },
      "Add Table": () => {
        const name = prompt("Table name:");
        if (!name) return;
        dispatch({
          type: "ADD_TABLE", contract_id: contractId,
          table: {
            id: `table_${Date.now()}`, name, date_created: Date.now() * 1e6,
            creator: Principal.fromText(profile.id), rows: [],
            columns: [{
              id: `col_${Date.now()}`, field: "untitled", name: "Untitled",
              column_type: "string", filters: [], permissions: [{ AnyOneView: null }],
              formula_string: "", editable: true, deletable: false
            }]
          }
        });
      },
      "Release All": () => {
        const updated = currentContract.promises.map(p => ({ ...p, status: { Released: null } }));
        dispatch({ type: "UPDATE_PROMISES", contract_id: contractId, promises: updated });
      }
    },
    table: {
      "Add Row": () => {
        const table = currentContract.contracts?.find(t => t.id === dataType);
        dispatch({
          type: "ADD_ROW", contract_id: contractId, table_id: dataType,
          row: {
            id: `row_${Date.now()}`,
            cells: table.columns?.map(col => ({ 
              id: `cell_${Date.now()}_${col.field}`, field: col.field, value: "" 
            })) || []
          }
        });
      },
      "Add Column": () => {
        const field = prompt("Column name:");
        if (!field) return;
        dispatch({
          type: "ADD_COLUMN", contract_id: contractId, table_id: dataType,
          column: {
            id: `col_${Date.now()}`, field, name: field, column_type: "string",
            filters: [], permissions: [{ AnyOneView: null }], formula_string: "",
            editable: true, deletable: true
          }
        });
      }
    }
  };

  const getContextMenuItems = useCallback((params) => {
    const isTable = dataType !== DATA_TYPES.PROMISE && dataType !== DATA_TYPES.PAYMENT;
    const menuType = dataType === DATA_TYPES.PROMISE ? "promise" : isTable ? "table" : null;
    
    if (!menuType) return [];

    const items = Object.entries(CONTEXT_MENU_ACTIONS[menuType]).map(([name, action]) => ({ name, action }));
    
    // Add row/promise specific actions
    if (params.node) {
      const deleteAction = menuType === "promise" 
        ? () => dispatch({ type: "DELETE_PROMISE", contract_id: contractId, id: params.node.data.id })
        : () => dispatch({ type: "DELETE_ROW", contract_id: contractId, table_id: dataType, row_id: params.node.data.id });
      
      items.push({ name: `Delete ${menuType === "promise" ? "Promise" : "Row"}`, action: deleteAction });
    }

    // Add column actions for tables
    if (isTable && params.column) {
      const table = currentContract.contracts?.find(t => t.id === dataType);
      const column = table?.columns?.find(col => col.field === params.column.getColId());
      
      items.push({
        name: "Rename Column",
        action: () => {
          const newName = prompt("Enter new column name:", params.column.getColId());
          if (newName && newName !== params.column.getColId() && column) {
            dispatch({
              type: "UPDATE_COLUMN", contract_id: contractId, table_id: dataType,
              column: { ...column, field: newName, name: newName }
            });
          }
        }
      });

      if (column?.deletable) {
        items.push({
          name: "Delete Column",
          action: () => dispatch({
            type: "DELETE_COLUMN", contract_id: contractId, table_id: dataType, column_id: column.id
          })
        });
      }
    }

    return items.length ? [...items, "separator", "copy", "copyWithHeaders", "paste", "separator", "chartRange"] : [];
  }, [dataType, currentContract, contractId, dispatch, profile]);

  const gridHeight = Math.min(rowData.length || 1, 15) * 28 + 111;
  const gridTheme = isDarkMode ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  return (
    <div className={gridTheme} style={{ height: `${gridHeight}px`, width: "100%" }}>
      <AgGridReact
        rowData={rowData} columnDefs={columnDefs}
        defaultColDef={{ flex: 1, minWidth: 100, resizable: true, sortable: true, filter: true, menuTabs: ["generalMenuTab", "filterMenuTab"] }}
        onCellValueChanged={onCellValueChanged} getContextMenuItems={getContextMenuItems}
        statusBar={{
          statusPanels: [
            { statusPanel: "agTotalRowCountComponent", align: "left" },
            { statusPanel: DataTypeSelector, statusPanelParams: { currentType: dataType, onTypeChange: setDataType, contractData: currentContract }, align: "center" },
            { statusPanel: "agSelectedRowCountComponent", align: "right" }
          ]
        }}
        cellSelection={true} enableRangeSelection={true} enableCharts={true}
        rowHeight={28} headerHeight={56} animateRows={true} enableCellTextSelection={true}
        noRowsOverlayComponent={() => (
          <div style={{ fontSize: "1.2rem", textAlign: "center", padding: "20px" }}>
            {dataType === DATA_TYPES.PROMISE ? "Right click to add promises and columns"
             : dataType === DATA_TYPES.PAYMENT ? "Payments will appear here when promises are released"
             : "Right click to add rows or columns in table"}
          </div>
        )}
      />
    </div>
  );
});

export default CustomContractViewer;
