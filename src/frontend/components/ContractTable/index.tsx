import { randomString } from "@/DataProcessing/dataSamples";
import { Principal } from "@dfinity/principal";
import {
  ClientSideRowModelModule,
  colorSchemeDarkBlue,
  colorSchemeLightWarm,
  ModuleRegistry,
  NumberEditorModule,
  SelectEditorModule,
  TextEditorModule,
  themeBalham,
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
import AgreementView from "./agreementView";
import { createNewPromis, getStatusOptions } from "./utils";
import DeleteContractButton from "./deleteContractButton";

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

const DATA_TYPES = {
  PROMISE: "promise",
  PAYMENT: "payment",
  CONTRACT: "contract",
  AGREEMENT: "agreement",
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

// Hooks
const useContractData = (contractId, contracts) =>
  useMemo(
    () =>
      contracts[contractId] || { promises: [], payments: [], contracts: [] },
    [contractId, contracts],
  );

const useDataType = (contractId) => {
  const [dataType, setDataType] = useState(
    () =>
      localStorage.getItem(`contract-${contractId}-dataType`) ||
      DATA_TYPES.AGREEMENT,
  );
  useEffect(
    () => localStorage.setItem(`contract-${contractId}-dataType`, dataType),
    [contractId, dataType],
  );
  return [dataType, setDataType];
};

const useColumnConfig = (profile, all_friends, wallet) =>
  useMemo(
    () => ({
      amount: {
        headerName: "Amount",
        type: "numericColumn",
        cellEditor: "agNumberCellEditor",
        cellEditorParams: { min: 0 },
        valueFormatter: (p) => `${p.value?.toLocaleString() || 0}`,
        validation: (params) =>
          params.newValue > wallet.balance ? "Error: Not enough balance" : null,
      },
      status: {
        headerName: "Status",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: (p) => ({
          values: getStatusOptions(p.data, profile.id),
        }),
        valueGetter: (p) => {
          const key = Object.keys(p.data.status || {})[0] || "None";
          const val = p.data.status?.[key];
          return key === "Objected" && val ? `${key} (${val})` : key;
        },
        valueSetter: (p) => {
          if (p.newValue === "Objected") {
            const reason = prompt("Enter objection reason:");
            if (reason === null) return false;
            p.data.status = { [p.newValue]: reason || "" };
          } else {
            p.data.status = { [p.newValue]: PAYMENT_STATUSES[p.newValue] };
          }
          return true;
        },
      },
      sender: {
        headerName: "Sender",
        editable: false,
        valueFormatter: (p) => {
          const senderId = p.value?.toString();
          return senderId === profile.id
            ? "You"
            : all_friends?.find((u) => u.id === senderId)?.name || "Unknown";
        },
      },
      receiver: {
        headerName: "Receiver",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: all_friends?.map((u) => u.name) || [] },
        valueGetter: (p) => {
          const receiverId = p.data.receiver?.toString();
          return receiverId === profile.id
            ? "You"
            : all_friends?.find((u) => u.id === receiverId)?.name ||
                "Anonymous";
        },
        valueSetter: (p) => {
          const user = all_friends?.find((u) => u.name === p.newValue);
          if (user) {
            p.data.receiver = Principal.fromText(user.id);
            return true;
          }
          return false;
        },
        validation: (params) =>
          params.data.sender.toString() === params.receiver.toString()
            ? "Error: You can't send to yourself"
            : null,
      },
      date_created: {
        headerName: "Created",
        editable: false,
        type: "dateColumn",
        valueFormatter: (p) => new Date(p.value / 1000000).toLocaleDateString(),
      },
    }),
    [profile, all_friends, wallet],
  );

const useGridData = (currentContract, dataType, columnConfig) =>
  useMemo(() => {
    const isTable = !Object.values(DATA_TYPES).slice(0, 2).includes(dataType);

    if (isTable) {
      const table = currentContract.contracts?.find((t) => t.id === dataType);
      if (!table) return { rowData: [], columnDefs: [] };

      const rowData =
        table.rows?.map((row) => {
          const data = { id: row.id };
          row.cells?.forEach((cell) => (data[cell.field] = cell.value));
          return data;
        }) || [];

      const columnDefs =
        table.columns?.map((col) => ({
          field: col.field,
          headerName: col.name || col.field,
          editable: col.editable,
          type: col.column_type === "number" ? "numericColumn" : undefined,
        })) || [];

      return { rowData, columnDefs };
    }

    const sourceData =
      dataType === DATA_TYPES.PROMISE
        ? currentContract.promises
        : currentContract.payments;
    const rowData =
      sourceData?.map((item) => {
        const row = { ...item, id: item.id || randomString() };
        item.cells?.forEach((cell) => (row[cell.field] = cell.value));
        return row;
      }) || [];

    const cellFields = [
      ...new Set(
        sourceData?.flatMap((item) => item.cells?.map((c) => c.field) || []),
      ),
    ];
    const baseColumns = Object.entries(columnConfig).map(([field, config]) => ({
      field,
      ...config,
      editable: dataType === DATA_TYPES.PROMISE && config.editable !== false,
      cellStyle: (params) =>
        config.validation?.(params) ? { backgroundColor: "#ffebee" } : {},
    }));

    const dynamicColumns = cellFields.map((field) => ({
      field,
      headerName:
        field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " "),
      editable: dataType === DATA_TYPES.PROMISE,
      cellEditor: "agTextCellEditor",
    }));

    return { rowData, columnDefs: [...baseColumns, ...dynamicColumns] };
  }, [currentContract, dataType, columnConfig]);

// Components
const DataTypeSelector = memo(
  ({
    currentType,
    onTypeChange,
    contractData,
    onAddTable,
    onRename,
    onSwitchToAgreement,
    onDeleteTable,
  }) => {
    const getCurrentName = () => {
      if (
        [DATA_TYPES.PROMISE, DATA_TYPES.PAYMENT, DATA_TYPES.AGREEMENT].includes(
          currentType,
        )
      ) {
        return contractData.name || "Unnamed Contract";
      }
      return (
        contractData.contracts?.find((t) => t.id === currentType)?.name ||
        "Unnamed Table"
      );
    };

    const handleRename = () => {
      const currentName = getCurrentName();
      const isContract = [
        DATA_TYPES.PROMISE,
        DATA_TYPES.PAYMENT,
        DATA_TYPES.AGREEMENT,
      ].includes(currentType);
      const newName = prompt(
        `Rename ${isContract ? "Contract" : "Table"}:`,
        currentName,
      );
      if (newName && newName !== currentName) onRename(currentType, newName);
    };

    const handleDeleteTable = () => {
      if (window.confirm("Are you sure you want to delete this table?")) {
        onDeleteTable(currentType);
      }
    };

    const buttonStyle = {
      background: "inherit",
      color: "inherit",
      border: "1px solid currentColor",
      borderRadius: "4px",
      padding: "4px 8px",
      cursor: "pointer",
    };

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "8px",
        }}
      >
        <span style={{ fontWeight: "bold", marginLeft: "8px" }}>
          {getCurrentName()}
        </span>
        <button onClick={handleRename} style={buttonStyle}>
          Rename
        </button>

        <span>View:</span>
        <select
          value={currentType}
          onChange={(e) => onTypeChange(e.target.value)}
          style={{ ...buttonStyle }}
        >
          <option value={DATA_TYPES.PROMISE}>
            Promises ({contractData.promises?.length || 0})
          </option>
          {(contractData.payments?.length || 0) > 0 && (
            <option value={DATA_TYPES.PAYMENT}>
              Payments ({contractData.payments.length})
            </option>
          )}
          {(contractData.contracts || []).map((table) => (
            <option key={table.id} value={table.id}>
              {table.name} ({table.rows?.length || 0} rows)
            </option>
          ))}
        </select>

        <button onClick={onAddTable} style={buttonStyle}>
          Add Table
        </button>
        <button onClick={onSwitchToAgreement} style={buttonStyle}>
          Switch to Agreement View
        </button>
        {![DATA_TYPES.PROMISE, DATA_TYPES.PAYMENT].includes(currentType) && (
          <button onClick={handleDeleteTable} style={buttonStyle}>
            Delete Table
          </button>
        )}
        <DeleteContractButton contractId={contractData.id} />
      </div>
    );
  },
);
const AgGridContainer = memo(
  ({
    contractId,
    dataType,
    currentContract,
    gridData,
    onCellValueChanged,
    getContextMenuItems,
    isDarkMode,
    statusBarProps,
  }) => {
    const gridHeight = Math.min(gridData.rowData.length || 1, 15) * 28 + 111;
    const myTheme = themeBalham.withPart(
      isDarkMode ? colorSchemeDarkBlue : colorSchemeLightWarm,
    );

    const noRowsMessages = {
      [DATA_TYPES.PROMISE]: "Right click to add promises and columns",
      [DATA_TYPES.PAYMENT]:
        "Payments will appear here when promises are released",
      default: "Right click to add rows or columns in table",
    };

    return (
      <div style={{ height: `${gridHeight}px`, width: "100%" }}>
        <AgGridReact
          theme={myTheme}
          getRowId={(params) => params.data.id}
          key={`${contractId}-${dataType}`}
          rowData={gridData.rowData}
          columnDefs={gridData.columnDefs}
          defaultColDef={{
            flex: 1,
            minWidth: 100,
            resizable: true,
            sortable: true,
            filter: true,
            menuTabs: ["generalMenuTab", "filterMenuTab"],
          }}
          onCellValueChanged={onCellValueChanged}
          getContextMenuItems={getContextMenuItems}
          statusBar={{
            statusPanels: [
              {
                statusPanel: DataTypeSelector,
                statusPanelParams: statusBarProps,
                align: "center",
              },
            ],
          }}
          cellSelection={true}
          enableRangeSelection={true}
          enableCharts={true}
          rowHeight={25}
          headerHeight={30}
          animateRows={true}
          enableCellTextSelection={true}
          noRowsOverlayComponent={() => (
            <div
              style={{
                fontSize: "1.2rem",
                textAlign: "center",
                padding: "20px",
              }}
            >
              {noRowsMessages[dataType] || noRowsMessages.default}
            </div>
          )}
        />
      </div>
    );
  },
);

// Main Component
const CustomContractViewer = memo(({ contractId }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { contracts, profile, all_friends, wallet, backendActor } = useSelector(
    (state) => state.filesState,
  );
  const { isDarkMode } = useSelector((state) => state.uiState);

  const currentContract = useContractData(contractId, contracts);
  const [dataType, setDataType] = useDataType(contractId);
  const columnConfig = useColumnConfig(profile, all_friends, wallet);
  const gridData = useGridData(currentContract, dataType, columnConfig);

  const handleDeleteTable = useCallback(
    (tableId) => {
      dispatch({
        type: "DELETE_TABLE",
        contract_id: contractId,
        table_id: tableId,
      });
      setDataType(DATA_TYPES.PROMISE);
    },
    [dispatch, contractId, setDataType],
  );

  const handleSwitchToAgreement = useCallback(() => {
    setDataType(DATA_TYPES.AGREEMENT);
  }, [setDataType]);

  const handleAddTable = useCallback(() => {
    const name = prompt("Table name:");
    if (!name) return;
    dispatch({
      type: "ADD_TABLE",
      contract_id: contractId,
      table: {
        id: `table_${Date.now()}`,
        name,
        date_created: Date.now() * 1e6,
        creator: Principal.fromText(profile.id),
        rows: [],
        columns: [
          {
            id: `col_${Date.now()}`,
            field: "untitled",
            name: "Untitled",
            column_type: "string",
            filters: [],
            permissions: [{ AnyOneView: null }],
            formula_string: "",
            editable: true,
            deletable: false,
          },
        ],
      },
    });
  }, [dispatch, contractId, profile.id]);

  const handleRename = useCallback(
    (currentType, newName) => {
      const actionType = [DATA_TYPES.PROMISE, DATA_TYPES.PAYMENT].includes(
        currentType,
      )
        ? "RENAME_SMART_CONTRACT"
        : "RENAME_TABLE";
      const payload = { contract_id: contractId, new_name: newName };
      if (actionType === "RENAME_TABLE") payload.table_id = currentType;
      dispatch({ type: actionType, ...payload });
    },
    [dispatch, contractId],
  );

  const onCellValueChanged = useCallback(
    async (params) => {
      const config = columnConfig[params.colDef.field];
      const validation = config?.validation?.(params);

      if (validation) {
        enqueueSnackbar(validation, { variant: "error" });
        params.api.refreshCells({ rowNodes: [params.node], force: true });
        return;
      }

      const isTable = ![DATA_TYPES.PROMISE, DATA_TYPES.PAYMENT].includes(
        dataType,
      );
      const { data, colDef } = params;

      if (isTable) {
        const table = currentContract.contracts?.find((t) => t.id === dataType);
        const updatedRow = {
          id: data.id,
          cells:
            table?.columns?.map((col) => ({
              id: `${data.id}_${col.field}`,
              field: col.field,
              value: data[col.field] || "",
            })) || [],
        };
        dispatch({
          type: "UPDATE_ROW",
          contract_id: contractId,
          table_id: dataType,
          row: updatedRow,
        });
        return;
      }

      const isBaseField = Object.keys(columnConfig).includes(colDef.field);
      const updatedPromises = currentContract.promises.map((p) => {
        if (p.id !== data.id) return p;
        if (isBaseField) return { ...p, [colDef.field]: data[colDef.field] };

        const cells = p.cells?.filter((c) => c.field !== colDef.field) || [];
        cells.push({
          id: `${p.id}_${colDef.field}`,
          field: colDef.field,
          value: data[colDef.field],
        });
        return { ...p, cells };
      });

      dispatch({
        type: "UPDATE_PROMISES",
        contract_id: contractId,
        promises: updatedPromises,
      });
    },
    [
      currentContract,
      contractId,
      dispatch,
      enqueueSnackbar,
      columnConfig,
      dataType,
    ],
  );

  const getContextMenuItems = useCallback(
    (params) => {
      const isTable = ![DATA_TYPES.PROMISE, DATA_TYPES.PAYMENT].includes(
        dataType,
      );

      const promiseActions = {
        "Add Promise": (params) => {
          const insertIndex =
            params?.node?.rowIndex !== undefined
              ? params.node.rowIndex + 1
              : currentContract.promises.length;
          dispatch({
            type: "ADD_PROMISE",
            contract_id: contractId,
            promise: createNewPromis(
              Principal.fromText(profile.id),
              contractId,
            ),
            insertIndex,
          });
        },
        "Add Column": () => {
          const field = prompt("Column name:");
          if (!field) return;
          const updated = currentContract.promises.map((p) => ({
            ...p,
            cells: [
              ...(p.cells || []),
              { id: `${p.id}_${field}`, field, value: "" },
            ],
          }));
          dispatch({
            type: "UPDATE_PROMISES",
            contract_id: contractId,
            promises: updated,
          });
        },
        "Release All": () => {
          const updated = currentContract.promises.map((p) => ({
            ...p,
            status: { Released: null },
          }));
          dispatch({
            type: "UPDATE_PROMISES",
            contract_id: contractId,
            promises: updated,
          });
        },
      };

      const tableActions = {
        "Add Row": (params) => {
          const table = currentContract.contracts?.find(
            (t) => t.id === dataType,
          );
          const insertIndex =
            params?.node?.rowIndex !== undefined
              ? params.node.rowIndex + 1
              : table?.rows?.length || 0;
          const newRow = {
            id: `row_${Date.now()}`,
            cells:
              table?.columns?.map((col) => ({
                id: `cell_${Date.now()}_${col.field}`,
                field: col.field,
                value: "",
              })) || [],
          };
          dispatch({
            type: "ADD_ROW",
            contract_id: contractId,
            table_id: dataType,
            row: newRow,
            insertIndex,
          });
        },
        "Add Column": (params) => {
          const field = prompt("Column name:");
          if (!field) return;
          const table = currentContract.contracts?.find(
            (t) => t.id === dataType,
          );
          const insertIndex = params?.column
            ? table?.columns?.findIndex(
                (col) => col.field === params.column.getColId(),
              ) + 1
            : undefined;
          const newColumn = {
            id: `col_${Date.now()}`,
            field,
            name: field,
            column_type: "string",
            filters: [],
            permissions: [{ AnyOneView: null }],
            formula_string: "",
            editable: true,
            deletable: true,
          };
          dispatch({
            type: "ADD_COLUMN",
            contract_id: contractId,
            table_id: dataType,
            column: newColumn,
            insertIndex,
          });
        },
      };

      const actions =
        dataType === DATA_TYPES.PROMISE
          ? promiseActions
          : isTable
            ? tableActions
            : {};
      const items = Object.entries(actions).map(([name, action]) => ({
        name,
        action: () => action(params),
      }));

      if (params.node) {
        const deleteAction =
          dataType === DATA_TYPES.PROMISE
            ? () =>
                dispatch({
                  type: "DELETE_PROMISE",
                  contract_id: contractId,
                  id: params.node.data.id,
                })
            : () =>
                dispatch({
                  type: "DELETE_ROW",
                  contract_id: contractId,
                  table_id: dataType,
                  row_id: params.node.data.id,
                });
        items.push({
          name: `Delete ${dataType === DATA_TYPES.PROMISE ? "Promise" : "Row"}`,
          action: deleteAction,
        });
      }

      if (isTable && params.column) {
        const table = currentContract.contracts?.find((t) => t.id === dataType);
        const column = table?.columns?.find(
          (col) => col.field === params.column.getColId(),
        );

        items.push({
          name: "Rename Column",
          action: () => {
            const newName = prompt(
              "Enter new column name:",
              params.column.getColId(),
            );
            if (newName && newName !== params.column.getColId() && column) {
              dispatch({
                type: "UPDATE_COLUMN",
                contract_id: contractId,
                table_id: dataType,
                column: { ...column, field: newName, name: newName },
              });
            }
          },
        });

        if (column?.deletable) {
          items.push({
            name: "Delete Column",
            action: () =>
              dispatch({
                type: "DELETE_COLUMN",
                contract_id: contractId,
                table_id: dataType,
                column_id: column.id,
              }),
          });
        }
      }

      return items.length
        ? [
            ...items,
            "separator",
            "copy",
            "copyWithHeaders",
            "paste",
            "separator",
            "chartRange",
          ]
        : [];
    },
    [dataType, currentContract, contractId, dispatch, profile],
  );

  if (dataType === DATA_TYPES.AGREEMENT) {
    return (
      <div style={{ height: "auto", width: "100%" }}>
        <AgreementView
          contract={currentContract}
          profile={profile}
          isDarkMode={isDarkMode}
          onSwitchToTable={() => setDataType(DATA_TYPES.PROMISE)}
        />
      </div>
    );
  }

  return (
    <AgGridContainer
      contractId={contractId}
      dataType={dataType}
      currentContract={currentContract}
      gridData={gridData}
      onCellValueChanged={onCellValueChanged}
      getContextMenuItems={getContextMenuItems}
      isDarkMode={isDarkMode}
      statusBarProps={{
        onRename: handleRename,
        currentType: dataType,
        onTypeChange: setDataType,
        contractData: currentContract,
        onAddTable: handleAddTable,

        onSwitchToAgreement: handleSwitchToAgreement,
        onDeleteTable: handleDeleteTable,
      }}
    />
  );
});

export default CustomContractViewer;
