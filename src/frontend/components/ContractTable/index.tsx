import React, { memo, useCallback, useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import { Principal } from "@dfinity/principal";
import { debounce } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";

import AgGridDataGrid from "../MuiComponents/dataGridSheet";
import DialogComponent from "../MuiComponents/dialogComponent";
import { useBackendContext } from "../../contexts/BackendContext";
import { randomString } from "../../DataProcessing/dataSamples";
import { formatRelativeTime } from "../../utils/time";
import {
  addColumnToContract,
  contractContextMenu,
  createCColumn,
  createNewPromis,
  deleteColumnFromContract,
  getContractColumnDefs,
  handleAmountChange,
  handleReceiverChange,
  handleStatusChange,
  renameColumnInContract,
  transformPromisesDataAndColumns,
} from "./utils";
import { getAvailableStatusOptions } from "./statusOptions";
import EditIcon from "@mui/icons-material/Edit";

// Constants
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

const DATA_TYPES = {
  PAYMENT: "payment",
  PROMISE: "promise",
  CONTRACT: "contract",
};

const STORAGE_KEYS = {
  DATA_TYPE: (id) => `contract-${id}-dataType`,
  CONTRACT: (id) => `contract-${id}-contract`,
};

// Utility Components
const MetadataTooltip = memo(({ metadata }) => (
  <Box>
    {Object.entries(metadata).map(([key, val]) => (
      <Typography key={key} variant="body2">
        {key}: {val instanceof Date ? val.toLocaleDateString() : String(val)}
      </Typography>
    ))}
  </Box>
));

const EditableInput = memo(({ value, onSave }) => {
  const [localValue, setLocalValue] = useState(value);

  const debouncedSave = useCallback(
    debounce((val) => onSave(val), 500),
    [onSave],
  );

  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      debouncedSave(newValue);
    },
    [debouncedSave],
  );

  const handleBlur = useCallback(
    () => onSave(localValue),
    [onSave, localValue],
  );

  return (
    <TextField
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      size="small"
      variant="standard"
      autoFocus
      sx={{
        "& .MuiInputBase-input": {
          fontSize: "h6.fontSize",
          fontWeight: "h6.fontWeight",
        },
      }}
    />
  );
});

const EditableTitle = memo(({ value, onChange, metadata }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = useCallback(
    (newValue) => {
      onChange(newValue);
      setIsEditing(false);
    },
    [onChange],
  );

  const handleClick = useCallback(() => setIsEditing(true), []);

  return (
    <Tooltip
      title={<MetadataTooltip metadata={metadata} />}
      placement="bottom-start"
    >
      <Box>
        {isEditing ? (
          <EditableInput value={value} onSave={handleSave} />
        ) : (
          <Typography
            variant="subtitle1"
            onClick={handleClick}
            sx={{
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "action.hover",
                borderRadius: 1,
                px: 1,
              },
              px: 1,
              fontWeight: 500,
            }}
          >
            {value}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
});

// Custom Hooks
const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved || defaultValue;
  });

  const setStoredValue = useCallback(
    (newValue) => {
      setValue(newValue);
      localStorage.setItem(key, newValue);
    },
    [key],
  );

  return [value, setStoredValue];
};

const useContractData = (contractId) => {
  const { contracts, profile, all_friends } = useSelector(
    (state) => state.filesState,
  );
  return useMemo(
    () => ({
      currentContract: contracts[contractId],
      profile,
      users: all_friends,
    }),
    [contracts, contractId, profile, all_friends],
  );
};

// Column Definitions Hook
const useColumnDefinitions = (
  currentContract,
  profile,
  dispatch,
  isPromise = false,
) => {
  return useMemo(
    () => [
      {
        field: "amount",
        headerName: "Amount",
        filter: "agNumberColumnFilter",
        editable: isPromise,
        valueFormatter: (params) => `${params.value.toLocaleString()}`,
        onCellValueChanged: (params) =>
          handleAmountChange(params, currentContract, dispatch),
      },
      {
        field: "status",
        headerName: "Status",
        valueGetter: (params) => {
          const statusKey = Object.keys(params.data.status)[0];
          const statusValue = params.data.status[statusKey];
          return statusKey === "Objected" && statusValue
            ? `${statusKey} (${statusValue})`
            : statusKey;
        },
        sortable: true,
        filter: true,
        editable: isPromise,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: (params) => ({
          values: getAvailableStatusOptions(params.data, profile.id),
        }),
        valueSetter: (params) => {
          const newValue = params.newValue;
          if (newValue === "Objected") {
            const reason = window.prompt("Enter objection reason:");
            if (reason !== null) {
              params.data.status = { [newValue]: reason || "" };
              return true;
            }
            return false;
          }
          params.data.status = { [newValue]: PAYMENT_STATUSES[newValue] };
          return true;
        },
        onCellValueChanged: (params) => {
          const updated_promises = handleStatusChange(params, currentContract);
          dispatch({ type: "UPDATE_PROMISES", promises: updated_promises });
        },
      },
      {
        field: "date_created",
        headerName: "Date Created",
        valueFormatter: (params) => formatRelativeTime(params.value),
        sortable: true,
        filter: "agDateColumnFilter",
        editable: false,
      },
      {
        field: "sender",
        headerName: "Sender",
        valueFormatter: (params) =>
          params.context.users?.find((u) => u.id == params.value.toString())
            ?.name || "None",
        sortable: true,
        filter: true,
        editable: false,
      },
      {
        field: "receiver",
        tooltipValueGetter: (params) =>
          params.context.users.length > 1
            ? "Double click here to select a receiver."
            : "Go to discover page to make new friends then select a receiver here.",
        headerName: "Receiver",
        valueGetter: (params) =>
          params.context.users?.find(
            (u) => u.id === params.data.receiver.toString(),
          )?.name || "Anonymous",
        sortable: true,
        filter: true,
        editable: isPromise,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: (params) => ({
          values: params.context.users.map((u) => u.name),
        }),
        valueSetter: (params) => {
          const selectedUser = params.context.users.find(
            (u) => u.name === params.newValue,
          );
          if (selectedUser) {
            params.data.receiver = selectedUser.id;
            return true;
          }
          return false;
        },
        onCellValueChanged: (params) =>
          handleReceiverChange(params, currentContract, dispatch),
      },
    ],
    [currentContract, profile, dispatch, isPromise],
  );
};

// Context Menu Hook
const useContextMenu = (currentContract, profile, dispatch) => {
  return useCallback(
    (params) => {
      const baseMenuItems = [
        {
          name: "add row",
          action: () => {
            const sender = profile && Principal.fromText(profile?.id);
            const promise = createNewPromis(sender);
            dispatch({
              type: "ADD_PROMISE",
              contract_id: currentContract.id,
              promise,
            });
          },
        },
        {
          name: "delete row",
          action: () => {
            dispatch({
              type: "DELETE_PROMISE",
              contract_id: currentContract.id,
              id: params.node?.data.id,
            });
          },
        },
        {
          name: "add column",
          action: () => {
            const updated_promises = addColumnToContract(
              currentContract,
              randomString(),
              "",
            );
            dispatch({
              type: "UPDATE_PROMISES",
              contract_id: currentContract.id,
              promises: updated_promises,
            });
          },
        },
        {
          icon: ClearAllIcon,
          name: "Release all",
          action: () => {
            const updated_promises = currentContract.promises.map((p) => ({
              ...p,
              status: { Released: null },
            }));
            dispatch({
              type: "UPDATE_PROMISES",
              contract_id: currentContract.id,
              promises: updated_promises,
            });
          },
        },
      ];

      const nonDeletableColumns = [
        "id",
        "amount",
        "sender",
        "receiver",
        "date_created",
        "date_released",
        "status",
      ];
      const currentColumnId = params.column?.getColId();

      if (params.column && !nonDeletableColumns.includes(currentColumnId)) {
        baseMenuItems.push(
          {
            name: "rename column",
            action: () => {
              const oldFieldName = params.column?.getColId();
              const newFieldName = window.prompt(
                "Enter new name for column:",
                oldFieldName,
              );

              if (!newFieldName || newFieldName === oldFieldName) return;
              if (params.api.getColumnDef(newFieldName)) {
                alert("A column with this name already exists.");
                return;
              }

              const update_promises = renameColumnInContract(
                currentContract,
                oldFieldName,
                newFieldName,
              );
              dispatch({
                type: "UPDATE_PROMISES",
                contract_id: currentContract.id,
                promises: update_promises,
              });
            },
          },
          {
            name: "delete column",
            action: () => {
              const fieldName = params.column.getColId();
              const update_promises = deleteColumnFromContract(
                currentContract,
                fieldName,
              );
              dispatch({
                type: "UPDATE_PROMISES",
                contract_id: currentContract.id,
                promises: update_promises,
              });
            },
          },
        );
      }

      return baseMenuItems;
    },
    [currentContract, profile, dispatch],
  );
};

// Data Grid Components
const PaymentGrid = memo(({ currentContract, users, columns }) => (
  <AgGridDataGrid
    key={JSON.stringify(currentContract.payments)}
    noRowsOverlayComponent={() => (
      <Typography sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2rem" } }}>
        Only when you release promises it will appear here.
      </Typography>
    )}
    getContextMenuItems={() => []}
    context={{ users }}
    rows={
      transformPromisesDataAndColumns(currentContract.payments, columns, false)
        .rows
    }
    columns={
      transformPromisesDataAndColumns(currentContract.payments, columns, false)
        .columns
    }
  />
));

const PromiseGrid = memo(
  ({ currentContract, users, columns, getContextMenuItems, dispatch }) => (
    <AgGridDataGrid
      key={JSON.stringify(currentContract.promises)}
      noRowsOverlayComponent={() => (
        <Typography sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2rem" } }}>
          Right click here to add rows or columns.
        </Typography>
      )}
      getContextMenuItems={getContextMenuItems}
      context={{ users, contractsState: currentContract, dispatch }}
      rows={
        transformPromisesDataAndColumns(currentContract.promises, columns, true)
          .rows
      }
      columns={
        transformPromisesDataAndColumns(currentContract.promises, columns, true)
          .columns
      }
    />
  ),
);

const ContractGrid = memo(
  ({ selectedContract, contractId, dispatch, currentContract }) => {
    const { contracts, profile, all_friends } = useSelector(
      (state) => state.filesState,
    );
    const tableData = useMemo(() => {
      const contract = contracts[contractId].contracts.find(
        (c) => c.id === selectedContract.id,
      );
      return {
        rows: contract.rows.map((r) => {
          const row = { id: r.id };
          r.cells.forEach((c) => {
            row[c.field] = c.value;
          });
          return row;
        }),
        columns: getContractColumnDefs(contract.columns),
      };
    }, [contracts, contractId, selectedContract.id]);

    return (
      <AgGridDataGrid
        noRowsOverlayComponent={() => (
          <Typography
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2rem" } }}
          >
            Right click here to add rows or columns.
          </Typography>
        )}
        getContextMenuItems={contractContextMenu}
        context={{
          contractsState: currentContract,
          selectedContract,
          dispatch,
        }}
        rows={tableData.rows}
        columns={tableData.columns}
      />
    );
  },
);

// Main Component
const CustomContractViewer = ({ contractId }) => {
  const dispatch = useDispatch();
  const { backendActor } = useBackendContext();
  const { enqueueSnackbar } = useSnackbar();
  const { currentContract, contracts, profile, all_friends, users } =
    useContractData(contractId);

  const [selectedDataType, setSelectedDataType] = useLocalStorage(
    STORAGE_KEYS.DATA_TYPE(contractId),
    DATA_TYPES.PROMISE,
  );

  const [selectedContract, setSelectedContract] = useState(() => {
    const id = localStorage.getItem(STORAGE_KEYS.CONTRACT(contractId));
    const contract = currentContract?.contracts.find((c) => c.id === id);
    return contract || null;
  });

  // Save selected contract to localStorage
  useEffect(() => {
    if (selectedContract?.id) {
      localStorage.setItem(
        STORAGE_KEYS.CONTRACT(contractId),
        selectedContract.id,
      );
    }
  }, [selectedContract, contractId]);

  const promiseColumns = useColumnDefinitions(
    currentContract,
    profile,
    dispatch,
    true,
  );
  const paymentColumns = useColumnDefinitions(
    currentContract,
    profile,
    dispatch,
    false,
  );
  const getContextMenuItems = useContextMenu(
    currentContract,
    profile,
    dispatch,
  );

  // Event Handlers
  const handleMainContractNameChange = useCallback(
    (new_name) => {
      dispatch({
        type: "RENAME_SMART_CONTRACT",
        contract_id: currentContract.id,
        new_name,
      });
    },
    [dispatch, currentContract.id],
  );

  const handleDataTypeChange = useCallback(
    (event) => {
      const value = event.target.value;

      if (value === DATA_TYPES.PAYMENT || value === DATA_TYPES.PROMISE) {
        setSelectedDataType(value);
        setSelectedContract(null);
      } else if (value !== "create_new") {
        const contract = currentContract.contracts.find((c) => c.id === value);
        if (contract) {
          setSelectedContract(contract);
          setSelectedDataType(value); // Set to the contract ID instead of DATA_TYPES.CONTRACT
        }
      }
    },
    [currentContract.contracts, setSelectedDataType],
  );

  const handleCreateNewContract = useCallback(() => {
    const newContract = {
      id: randomString(),
      name: `New Table ${currentContract.contracts.length + 1}`,
      date_created: Date.now() * 1e6,
      creator: Principal.fromText(profile.id),
      rows: [],
      columns: [createCColumn("untitled")],
    };

    dispatch({
      type: "ADD_TABLE",
      contract_id: currentContract.id,
      table: newContract,
    });
    setSelectedContract(newContract);
    setSelectedDataType(newContract.id); // Set to the new contract ID
  }, [currentContract, profile.id, dispatch, setSelectedDataType]);

  const handleDeleteContract = useCallback(async () => {
    const res = await backendActor.delete_custom_contract(currentContract.id);
    if (res.Ok == null || res.Err === "Not found") {
      dispatch({ type: "REMOVE_CONTRACT", id: currentContract.id });
    } else if (res.Err) {
      enqueueSnackbar(res.Err, { variant: "error" });
    }
  }, [backendActor, currentContract.id, dispatch, enqueueSnackbar]);

  const handleDeleteTable = useCallback(
    (contractToDelete, e) => {
      e.stopPropagation();
      if (
        window.confirm(
          `Are you sure you want to delete table "${contractToDelete.name}"?`,
        )
      ) {
        dispatch({
          type: "DELETE_TABLE",
          contract_id: currentContract.id,
          table_id: contractToDelete.id,
        });
        if (selectedContract?.id === contractToDelete.id) {
          setSelectedContract(null);
          setSelectedDataType(DATA_TYPES.PROMISE);
        }
      }
    },
    [currentContract.id, selectedContract?.id, dispatch, setSelectedDataType],
  );

  const handleEditTable = useCallback(
    (contractToEdit, e) => {
      e.stopPropagation();
      const newName = prompt("Enter new table name:", contractToEdit.name);
      if (newName && newName.trim() !== "" && newName !== contractToEdit.name) {
        dispatch({
          type: "RENAME_TABLE",
          contract_id: currentContract.id,
          table_id: contractToEdit.id,
          new_name: newName.trim(),
        });
      }
    },
    [dispatch, currentContract.id],
  );

  if (!currentContract) {
    return <Typography>Contract not found</Typography>;
  }

  // Determine if we're showing a contract table
  const isContractMode =
    selectedDataType !== DATA_TYPES.PAYMENT &&
    selectedDataType !== DATA_TYPES.PROMISE;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack direction="row" alignItems="center">
          <EditableTitle
            value={currentContract.name || "Untitled"}
            onChange={handleMainContractNameChange}
            metadata={{
              Created: new Date(currentContract.date_created),
              Updated: new Date(currentContract.date_updated),
              Creator: currentContract.creator,
            }}
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Data</InputLabel>
            <Select
              value={selectedDataType}
              label="Data Type"
              onChange={handleDataTypeChange}
              renderValue={(value) => {
                if (value === DATA_TYPES.PROMISE) return "Promises";
                if (value === DATA_TYPES.PAYMENT) return "Payments";
                const contract = currentContract.contracts.find(
                  (c) => c.id === value,
                );
                return contract ? contract.name : value;
              }}
            >
              <MenuItem value={DATA_TYPES.PROMISE}>Promises</MenuItem>
              {currentContract.payments.length > 0 && (
                <MenuItem value={DATA_TYPES.PAYMENT}>Payments</MenuItem>
              )}

              {currentContract.contracts.map((contract) => (
                <MenuItem
                  key={contract.id}
                  value={contract.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>{contract.name}</Box>
                  <Box sx={{ display: "flex" }}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleEditTable(contract, e)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteTable(contract, e)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </MenuItem>
              ))}

              <MenuItem>
                <Button
                  fullWidth
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNewContract}
                >
                  New Table
                </Button>
              </MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />

          <DialogComponent
            onConfirm={handleDeleteContract}
            button={
              <Button color="error" size="small">
                Delete
              </Button>
            }
            title="Delete post"
            content="Are you sure you want to delete this contract?"
          />
        </Stack>
      </Box>

      {/* Content */}
      <Box>
        <Box>
          {selectedDataType === DATA_TYPES.PAYMENT && (
            <PaymentGrid
              currentContract={currentContract}
              users={users}
              columns={paymentColumns}
            />
          )}

          {selectedDataType === DATA_TYPES.PROMISE && (
            <PromiseGrid
              currentContract={currentContract}
              users={users}
              columns={promiseColumns}
              getContextMenuItems={getContextMenuItems}
              dispatch={dispatch}
            />
          )}

          {isContractMode && selectedContract && (
            <ContractGrid
              selectedContract={selectedContract}
              contractId={contractId}
              dispatch={dispatch}
              currentContract={currentContract}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CustomContractViewer;
