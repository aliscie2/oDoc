import { FEFriend, StoredContract } from "$/declarations/backend/backend.did";
import { deserializeContracts } from "../../DataProcessing/deserlize/deserializeContracts";
import { initializeApp } from "../slices/appSlice";
import { FilesActions, InitialState, initialState } from "../types/filesTypes";
import { unwrapContract } from "../../utils/contractUtils";

export function filesReducer(
  state: InitialState = initialState,
  action: FilesActions, // Changed to any to handle both old actions and thunk actions
): InitialState {
  // Handle the new thunk fulfilled action
  if (action.type === initializeApp.fulfilled.type) {
    // Skip if already initialized or no valid payload
    if (!action.payload || !action.payload.Profile) {
      return state;
    }

    const all_friends = [action.payload.Profile];
    // Add defensive check for Friends array
    if (action.payload.Friends && Array.isArray(action.payload.Friends)) {
      action.payload.Friends.forEach((f: FEFriend) => {
        // FEFriend contains the friend's info directly, no need to check sender/receiver
        all_friends.push({
          id: f.id,
          name: f.name,
          description: f.description,
          email: f.email,
          photo: f.photo,
        });
      });
    }
    return {
      ...state,
      all_friends,
      wallet: action.payload.Wallet,
      contracts: action.payload.Contracts
        ? deserializeContracts(action.payload.Contracts)
        : {},
      profile: action.payload.Profile,
      friends: action.payload.Friends || [],
      inited: true,
      profile_history: action.payload.ProfileHistory || state.profile_history,
      workspaces: action.payload.workspaces || state.workspaces,
      files: action.payload.files || [],
      files_content: action.payload.files_content || {},
    };
  }

  switch (action.type) {
    case "CHANGE_CURRENT_WORKSPACE":
      return {
        ...state,
        currentWorkspace: action.currentWorkspace,
      };

    case "DELETE_WORKSPACE":
      return {
        ...state,
        workspaces: state.workspaces.filter(
          (w) => w.id !== action.workspace.id,
        ),
      };

    case "UPDATE_WORKSPACE":
      return {
        ...state,
        workspaces: state.workspaces.map((w) => {
          if (w.id == action.workspace.id) {
            return action.workspace;
          }
          return w;
        }),
      };

    case "ADD_WORKSPACE":
      return {
        ...state,
        workspaces: [...state.workspaces, action.workspace],
      };
    case "ADD_CONTENT":
      return {
        ...state,
        files_content: { ...state.files_content, [action.id]: action.content },
      };

    // case 'INIT_CONTENTS':
    //     return {
    //         ...state,
    //         files_content: action.files_content
    //     };
    case "ADD_FILES_LIST":
      return {
        ...state,
        files: [...state.files, ...action.files],
      };
    case "ADD_POSTS":
      return {
        ...state,
        posts: [...state.posts, ...action.posts],
      };
    case "SET_POSTS":
      return {
        ...state,
        posts: action.posts,
      };

    case "ADD_POST":
      return {
        ...state,
        posts: [...state.posts, action.post],
      };

    case "UPDATE_POST":
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === action.id ? { ...post, ...action.post } : post,
        ),
      };

    case "DELETE_POST":
      return {
        ...state,
        posts: state.posts.filter((post) => post.id !== action.id),
      };
    case "ADD_CONTENTS_LIST":
      return {
        ...state,
        files_content: { ...state.files_content, ...action.contents },
      };
    case "ADD_FILE":
      return {
        ...state,
        files: [...state.files, action.new_file],
        changes: {
          ...state.changes,
          files: [...state.changes.files, action.new_file],
        },
      };

    case "UPDATE":
      return {
        ...state,
        files: state.files.map((file) =>
          file.id === action.id ? { ...file, ...action.file } : file,
        ),
      };

    case "REMOVE_FILE":
      return {
        ...state,
        current_file:
          state.current_file?.id === action.id ? null : state.current_file,
        files: state.files.filter((file) => file.id !== action.id),
        changes: {
          ...state.changes,
          files: state.changes.files.filter((file) => file.id !== action.id),
        },
      };

    case "CURRENT_FILE":
      localStorage.setItem("current_file", JSON.stringify({ ...action.file }));
      return {
        ...state,
        current_file: action.file,
        lookingForFile: action.file ? false : true,
      };

    case "CHANGE_FILE_PARENT": {
      const { updatedFile1, updatedFile2, reIndexing, flattenedFiles } = action;
      return {
        ...state,
        files: flattenedFiles.map((f) => {
          return { ...f, name: state.files.find((i) => f.id === i.id).name };
        }),
        changes: {
          ...state.changes,
          files_indexing: [...state.changes.files_indexing, reIndexing], // Create a new array with reIndexing added
          files: [...state.changes.files, updatedFile1, updatedFile2], // Create a new array with updatedFile1 and updatedFile2 added
        },
      };
    }

    case "UPDATE_CONTENT":
      return {
        ...state,
        changes: {
          ...state.changes,
          contents: { ...state.changes.contents, [action.id]: action.content },
        },
        files_content: { ...state.files_content, [action.id]: action.content },
        files: state.files.map((file) =>
          file.id === action.id ? { ...file, content: action.content } : file,
        ),
      };

    case "ADD_CONTRACT": {
      // Unwrap contract if needed
      const unwrappedContract = unwrapContract(action.contract);
      
      if (!unwrappedContract) {
        console.error("Failed to unwrap contract:", action.contract);
        return state;
      }
      
      const id = unwrappedContract.id;

      // Ensure changes.contracts is an array
      const contractsArray = Array.isArray(state.changes.contracts)
        ? state.changes.contracts
        : [];

      // Check if contract already exists in changes
      const existingIndex = contractsArray.findIndex((c) => c.id === id);
      const newContractUpdate = {
        id: id,
        permissions: [],
        promises_indexes: [],
        name: [],
        delete_tables: [],
        tables: [],
        delete_promises: [],
        promises: [],
      };

      const updatedContracts =
        existingIndex >= 0
          ? contractsArray
          : [...contractsArray, newContractUpdate];

      return {
        ...state,
        changes: {
          ...state.changes,
          contracts: updatedContracts,
        },
        contracts: {
          ...state.contracts,
          [id]: unwrappedContract,
        },
      };
    }
    case "SET_CONTRACT": {
      // SET_CONTRACT is used when fetching contracts from backend
      // It ONLY updates state.contracts, NOT state.changes.contracts
      // This is intentional because:
      // 1. When receiver actions (confirmed_c_payment, object_on_cancel, etc.) call backend,
      //    the backend already persists the changes, so no need to add to changes
      // 2. When loading contracts from backend, they are already saved
      
      // CRITICAL: Unwrap StoredContract to CustomContract here
      // This ensures Redux always stores unwrapped contracts
      const unwrappedContract = unwrapContract(action.contract);
      
      if (!unwrappedContract) {
        console.error("Failed to unwrap contract:", action.contract);
        return state;
      }
      
      const id = unwrappedContract.id;

      return {
        ...state,
        contracts: {
          ...state.contracts,
          [id]: unwrappedContract,
        },
      };
    }
    case "SET_PROMISE_STATUS": {
      const { contract_id, promise } = action;

      // Only update state, don't add to changes (no backend save needed)
      return {
        ...state,
        contracts: {
          ...state.contracts,
          [contract_id]: {
            ...state.contracts[contract_id],
            promises: state.contracts[contract_id].promises.map((p) =>
              p.id === promise.id ? promise : p,
            ),
          },
        },
      };
    }

    case "RENAME_TABLE": {
      const { contract_id, table_id, new_name } = action;

      // Update table name in the contract
      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...state.contracts[contract_id],
          contracts: state.contracts[contract_id].contracts.map((table) =>
            table.id === table_id ? { ...table, name: new_name } : table,
          ),
        },
      };

      // Update changes
      const contractsArray = Array.isArray(state.changes.contracts)
        ? state.changes.contracts
        : [];
      const existingContractIndex = contractsArray.findIndex(
        (c) => c.id === contract_id,
      );
      let updatedChangesContracts;

      if (existingContractIndex !== -1) {
        updatedChangesContracts = contractsArray.map((c, index) => {
          if (index === existingContractIndex) {
            const existingTableIndex = c.tables.findIndex(
              (t) => t.id === table_id,
            );
            if (existingTableIndex !== -1) {
              return {
                ...c,
                tables: c.tables.map((t, tIndex) =>
                  tIndex === existingTableIndex ? { ...t, name: new_name } : t,
                ),
              };
            } else {
              return {
                ...c,
                tables: [
                  ...c.tables,
                  {
                    id: table_id,
                    name: new_name,
                    rows: [],
                    rows_indexes: [],
                    delete_columns: [],
                    columns_indexes: [],
                    columns: [],
                    delete_rows: [],
                  },
                ],
              };
            }
          }
          return c;
        });
      } else {
        const newContractUpdate = {
          id: contract_id,
          permissions: [],
          promises_indexes: [],
          name: [],
          delete_tables: [],
          tables: [
            {
              id: table_id,
              name: new_name,
              rows: [],
              rows_indexes: [],
              delete_columns: [],
              columns_indexes: [],
              columns: [],
              delete_rows: [],
            },
          ],
          delete_promises: [],
          promises: [],
        };
        updatedChangesContracts = [...contractsArray, newContractUpdate];
      }

      return {
        ...state,
        contracts: updatedContracts,
        changes: {
          ...state.changes,
          contracts: updatedChangesContracts,
        },
      };
    }
    case "RENAME_SMART_CONTRACT": {
      const { contract_id, new_name } = action;

      // Update contract name
      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...state.contracts[contract_id],
          name: new_name,
        },
      };

      // Update changes
      const contractsArray = Array.isArray(state.changes.contracts)
        ? state.changes.contracts
        : [];
      const existingContractIndex = contractsArray.findIndex(
        (c) => c.id === contract_id,
      );
      let updatedChangesContracts;

      if (existingContractIndex !== -1) {
        updatedChangesContracts = contractsArray.map((c, index) =>
          index === existingContractIndex ? { ...c, name: [new_name] } : c,
        );
      } else {
        const newContractUpdate = {
          permissions: [],
          promises_indexes: [],
          id: contract_id,
          name: [new_name],
          delete_tables: [],
          tables: [],
          delete_promises: [],
          promises: [],
        };
        updatedChangesContracts = [...contractsArray, newContractUpdate];
      }

      return {
        ...state,
        contracts: updatedContracts,
        changes: {
          ...state.changes,
          contracts: updatedChangesContracts,
        },
      };
    }

    case "ADD_TABLE": {
      const { contract_id, table } = action;

      // Add table to the contract's contracts array
      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...state.contracts[contract_id],
          contracts: [...state.contracts[contract_id].contracts, table],
        },
      };

      // Ensure changes.contracts is an array
      const contractsArray = Array.isArray(state.changes.contracts)
        ? state.changes.contracts
        : [];

      // Find existing contract update in changes
      const existingContractIndex = contractsArray.findIndex(
        (c) => c.id === contract_id,
      );
      let updatedChangesContracts;

      if (existingContractIndex !== -1) {
        // Contract update exists, add table to it
        updatedChangesContracts = contractsArray.map((c, index) => {
          if (index === existingContractIndex) {
            const existingTableIndex = c.tables.findIndex(
              (t) => t.id === table.id,
            );
            if (existingTableIndex !== -1) {
              // Update existing table
              return {
                ...c,
                tables: c.tables.map((t, tIndex) =>
                  tIndex === existingTableIndex
                    ? {
                        id: table.id,
                        name: table.name,
                        rows: table.rows,
                        rows_indexes: table.rows_indexes || [],
                        delete_columns: t.delete_columns || [],
                        columns_indexes: table.columns_indexes || [],
                        columns: table.columns,
                        delete_rows: t.delete_rows || [],
                      }
                    : t,
                ),
              };
            } else {
              // Add new table
              return {
                ...c,
                tables: [
                  ...c.tables,
                  {
                    id: table.id,
                    name: table.name,
                    rows: table.rows,
                    rows_indexes: table.rows_indexes || [],
                    delete_columns: [],
                    columns_indexes: table.columns_indexes || [],
                    columns: table.columns,
                    delete_rows: [],
                  },
                ],
              };
            }
          }
          return c;
        });
      } else {
        // Contract update doesn't exist, create new one
        const newContractUpdate = {
          permissions: [],
          promises_indexes: [],
          id: contract_id,
          name: [],
          delete_tables: [],
          tables: [
            {
              id: table.id,
              name: table.name,
              rows: table.rows,
              rows_indexes: table.rows_indexes || [],
              delete_columns: [],
              columns_indexes: table.columns_indexes || [],
              columns: table.columns,
              delete_rows: [],
            },
          ],
          delete_promises: [],
          promises: [],
        };
        updatedChangesContracts = [...contractsArray, newContractUpdate];
      }

      return {
        ...state,
        contracts: updatedContracts,
        changes: {
          ...state.changes,
          contracts: updatedChangesContracts,
        },
      };
    }

    case "DELETE_TABLE": {
      const { contract_id, table_id } = action;

      // Remove table from contract's contracts array
      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...state.contracts[contract_id],
          contracts: state.contracts[contract_id].contracts.filter(
            (t) => t.id !== table_id,
          ),
        },
      };

      // Ensure changes.contracts is an array
      const contractsArray = Array.isArray(state.changes.contracts)
        ? state.changes.contracts
        : [];

      // Find existing contract update in changes
      const existingContractIndex = contractsArray.findIndex(
        (c) => c.id === contract_id,
      );
      let updatedChangesContracts;

      if (existingContractIndex !== -1) {
        // Contract update exists
        updatedChangesContracts = contractsArray.map((c, index) => {
          if (index === existingContractIndex) {
            // Remove table from tables array
            const updatedTables = c.tables.filter((t) => t.id !== table_id);
            const updatedDeleteTables = !table_id.includes("fresh_table")
              ? [...c.delete_tables, table_id]
              : c.delete_tables;

            return {
              ...c,
              tables: updatedTables,
              delete_tables: updatedDeleteTables,
            };
          }
          return c;
        });
      } else {
        // Contract update doesn't exist, create new one
        const newContractUpdate = {
          permissions: [],
          promises_indexes: [],
          id: contract_id,
          name: [],
          delete_tables: !table_id.includes("fresh_table") ? [table_id] : [],
          tables: [],
          delete_promises: [],
          promises: [],
        };
        updatedChangesContracts = [...contractsArray, newContractUpdate];
      }

      return {
        ...state,
        contracts: updatedContracts,
        changes: {
          ...state.changes,
          contracts: updatedChangesContracts,
        },
      };
    }

    case "ADD_ROW": {
      const { contract_id, table_id, row, insertIndex } = action;

      // Safety checks
      if (!state.contracts[contract_id]) {
        console.error("Contract not found:", contract_id);
        return state;
      }

      const currentContract = state.contracts[contract_id];
      if (!currentContract.contracts) {
        console.error("No contracts array found");
        return state;
      }

      const currentTable = currentContract.contracts.find(
        (t) => t.id === table_id,
      );
      if (!currentTable) {
        console.error("Table not found:", table_id);
        return state;
      }

      // Handle rows array
      const currentRows = [...(currentTable.rows || [])];
      if (insertIndex !== undefined && insertIndex <= currentRows.length) {
        currentRows.splice(insertIndex, 0, row);
      } else {
        currentRows.push(row);
      }

      // Handle rows_indexes array
      const currentRowIndexes = [...(currentTable.rows_indexes || [])];
      if (
        insertIndex !== undefined &&
        insertIndex <= currentRowIndexes.length
      ) {
        currentRowIndexes.splice(insertIndex, 0, [insertIndex, row.id]);
        // Re-index all subsequent items
        for (let i = insertIndex + 1; i < currentRowIndexes.length; i++) {
          currentRowIndexes[i] = [i, currentRowIndexes[i][1]];
        }
      } else {
        currentRowIndexes.push([currentRowIndexes.length, row.id]);
      }

      // Update contracts
      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...currentContract,
          contracts: currentContract.contracts.map((table) =>
            table.id === table_id
              ? { ...table, rows: currentRows, rows_indexes: currentRowIndexes }
              : table,
          ),
        },
      };

      // Update changes
      const contractsArray = Array.isArray(state.changes.contracts)
        ? state.changes.contracts
        : [];
      const existingContractIndex = contractsArray.findIndex(
        (c) => c.id === contract_id,
      );
      let updatedChangesContracts;

      if (existingContractIndex !== -1) {
        updatedChangesContracts = contractsArray.map((c, index) => {
          if (index === existingContractIndex) {
            const existingTableIndex = c.tables.findIndex(
              (t) => t.id === table_id,
            );
            if (existingTableIndex !== -1) {
              return {
                ...c,
                tables: c.tables.map((t, tIndex) =>
                  tIndex === existingTableIndex
                    ? {
                        ...t,
                        rows: currentRows,
                        rows_indexes: currentRowIndexes,
                      }
                    : t,
                ),
              };
            } else {
              return {
                ...c,
                tables: [
                  ...c.tables,
                  {
                    id: table_id,
                    name: "",
                    rows: currentRows,
                    rows_indexes: currentRowIndexes,
                    delete_columns: [],
                    columns_indexes: currentTable.columns_indexes || [],
                    columns: currentTable.columns || [],
                    delete_rows: [],
                  },
                ],
              };
            }
          }
          return c;
        });
      } else {
        const newContractUpdate = {
          permissions: [],
          promises_indexes: [],
          id: contract_id,
          name: [],
          delete_tables: [],
          tables: [
            {
              id: table_id,
              name: currentTable.name || "",
              rows: currentRows,
              rows_indexes: currentRowIndexes,
              delete_columns: [],
              columns_indexes: currentTable.columns_indexes || [],
              columns: currentTable.columns || [],
              delete_rows: [],
            },
          ],
          delete_promises: [],
          promises: [],
        };
        updatedChangesContracts = [...contractsArray, newContractUpdate];
      }

      return {
        ...state,
        contracts: updatedContracts,
        changes: { ...state.changes, contracts: updatedChangesContracts },
      };
    }

    case "ADD_COLUMN": {
      const { contract_id, table_id, column, insertIndex } = action;

      // Safety checks
      if (!state.contracts[contract_id]) {
        console.error("Contract not found:", contract_id);
        return state;
      }

      const currentContract = state.contracts[contract_id];
      if (!currentContract.contracts) {
        console.error("No contracts array found");
        return state;
      }

      const currentTable = currentContract.contracts.find(
        (t) => t.id === table_id,
      );
      if (!currentTable) {
        console.error("Table not found:", table_id);
        return state;
      }

      // Handle columns array
      const currentColumns = [...(currentTable.columns || [])];
      if (insertIndex !== undefined && insertIndex <= currentColumns.length) {
        currentColumns.splice(insertIndex, 0, column);
      } else {
        currentColumns.push(column);
      }

      // Handle columns_indexes array
      const currentColumnIndexes = [...(currentTable.columns_indexes || [])];
      if (
        insertIndex !== undefined &&
        insertIndex <= currentColumnIndexes.length
      ) {
        currentColumnIndexes.splice(insertIndex, 0, [insertIndex, column.id]);
        // Re-index all subsequent items
        for (let i = insertIndex + 1; i < currentColumnIndexes.length; i++) {
          currentColumnIndexes[i] = [i, currentColumnIndexes[i][1]];
        }
      } else {
        currentColumnIndexes.push([currentColumnIndexes.length, column.id]);
      }

      // Add empty cells to existing rows for the new column (preserve existing cells)
      const updatedRows = (currentTable.rows || []).map((row) => ({
        ...row,
        cells: [
          ...(row.cells || []), // Preserve all existing cells
          {
            id: `${row.id}_${column.field}`,
            field: column.field,
            value: "",
          },
        ],
      }));

      // Update contracts
      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...currentContract,
          contracts: currentContract.contracts.map((table) =>
            table.id === table_id
              ? {
                  ...table,
                  columns: currentColumns,
                  columns_indexes: currentColumnIndexes,
                  rows: updatedRows,
                }
              : table,
          ),
        },
      };

      // Update changes
      const contractsArray = Array.isArray(state.changes.contracts)
        ? state.changes.contracts
        : [];
      const existingContractIndex = contractsArray.findIndex(
        (c) => c.id === contract_id,
      );
      let updatedChangesContracts;

      if (existingContractIndex !== -1) {
        updatedChangesContracts = contractsArray.map((c, index) => {
          if (index === existingContractIndex) {
            const existingTableIndex = c.tables.findIndex(
              (t) => t.id === table_id,
            );
            if (existingTableIndex !== -1) {
              return {
                ...c,
                tables: c.tables.map((t, tIndex) =>
                  tIndex === existingTableIndex
                    ? {
                        ...t,
                        columns: currentColumns,
                        columns_indexes: currentColumnIndexes,
                        rows: updatedRows,
                      }
                    : t,
                ),
              };
            } else {
              return {
                ...c,
                tables: [
                  ...c.tables,
                  {
                    id: table_id,
                    name: currentTable.name || "",
                    rows: updatedRows,
                    rows_indexes: currentTable.rows_indexes || [],
                    delete_columns: [],
                    columns_indexes: currentColumnIndexes,
                    columns: currentColumns,
                    delete_rows: [],
                  },
                ],
              };
            }
          }
          return c;
        });
      } else {
        const newContractUpdate = {
          permissions: [],
          promises_indexes: [],
          id: contract_id,
          name: [],
          delete_tables: [],
          tables: [
            {
              id: table_id,
              name: currentTable.name || "",
              rows: updatedRows,
              rows_indexes: currentTable.rows_indexes || [],
              delete_columns: [],
              columns_indexes: currentColumnIndexes,
              columns: currentColumns,
              delete_rows: [],
            },
          ],
          delete_promises: [],
          promises: [],
        };
        updatedChangesContracts = [...contractsArray, newContractUpdate];
      }

      return {
        ...state,
        contracts: updatedContracts,
        changes: { ...state.changes, contracts: updatedChangesContracts },
      };
    }

    case "DELETE_CUSTOM_CONTRACT": {
      const { [action.id]: deleted, ...remaining } = state.contracts;
      return {
        ...state,
        contracts: remaining,
      };
    }

    case "UPDATE_COLUMN": {
      const { contract_id, table_id, column } = action;

      // Update column in the specific table in contract
      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...state.contracts[contract_id],
          contracts: state.contracts[contract_id].contracts.map((table) =>
            table.id === table_id
              ? {
                  ...table,
                  columns: table.columns.map((col) =>
                    col.id === column.id ? column : col,
                  ),
                }
              : table,
          ),
        },
      };

      // Update changes
      const contractsArray = Array.isArray(state.changes.contracts)
        ? state.changes.contracts
        : [];
      const existingContractIndex = contractsArray.findIndex(
        (c) => c.id === contract_id,
      );
      let updatedChangesContracts;

      if (existingContractIndex !== -1) {
        updatedChangesContracts = contractsArray.map((c, index) => {
          if (index === existingContractIndex) {
            const existingTableIndex = c.tables.findIndex(
              (t) => t.id === table_id,
            );
            if (existingTableIndex !== -1) {
              return {
                ...c,
                tables: c.tables.map((t, tIndex) => {
                  if (tIndex === existingTableIndex) {
                    const existingColumnIndex = t.columns.findIndex(
                      (col) => col.id === column.id,
                    );
                    if (existingColumnIndex !== -1) {
                      return {
                        ...t,
                        columns: t.columns.map((col, colIndex) =>
                          colIndex === existingColumnIndex ? column : col,
                        ),
                      };
                    } else {
                      return { ...t, columns: [...t.columns, column] };
                    }
                  }
                  return t;
                }),
              };
            } else {
              return {
                ...c,
                tables: [
                  ...c.tables,
                  {
                    id: table_id,
                    name: "",
                    rows: [],
                    rows_indexes: [],
                    delete_columns: [],
                    columns_indexes: [],
                    columns: [column],
                    delete_rows: [],
                  },
                ],
              };
            }
          }
          return c;
        });
      } else {
        const newContractUpdate = {
          permissions: [],
          promises_indexes: [],
          id: contract_id,
          name: [],
          delete_tables: [],
          tables: [
            {
              id: table_id,
              name: "",
              rows: [],
              rows_indexes: [],
              delete_columns: [],
              columns_indexes: [],
              columns: [column],
              delete_rows: [],
            },
          ],
          delete_promises: [],
          promises: [],
        };
        updatedChangesContracts = [...contractsArray, newContractUpdate];
      }

      return {
        ...state,
        contracts: updatedContracts,
        changes: {
          ...state.changes,
          contracts: updatedChangesContracts,
        },
      };
    }

    case "UPDATE_ROW": {
      const { contract_id, table_id, row } = action;

      // Update row in the specific table in contract
      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...state.contracts[contract_id],
          contracts: state.contracts[contract_id].contracts.map((table) =>
            table.id === table_id
              ? {
                  ...table,
                  rows: table.rows.map((r) => (r.id === row.id ? row : r)),
                }
              : table,
          ),
        },
      };

      // Update changes - similar logic to UPDATE_COLUMN but for rows
      const contractsArray = Array.isArray(state.changes.contracts)
        ? state.changes.contracts
        : [];
      const existingContractIndex = contractsArray.findIndex(
        (c) => c.id === contract_id,
      );
      let updatedChangesContracts;

      if (existingContractIndex !== -1) {
        updatedChangesContracts = contractsArray.map((c, index) => {
          if (index === existingContractIndex) {
            const existingTableIndex = c.tables.findIndex(
              (t) => t.id === table_id,
            );
            if (existingTableIndex !== -1) {
              return {
                ...c,
                tables: c.tables.map((t, tIndex) => {
                  if (tIndex === existingTableIndex) {
                    const existingRowIndex = t.rows.findIndex(
                      (r) => r.id === row.id,
                    );
                    if (existingRowIndex !== -1) {
                      return {
                        ...t,
                        rows: t.rows.map((r, rIndex) =>
                          rIndex === existingRowIndex ? row : r,
                        ),
                      };
                    } else {
                      return { ...t, rows: [...t.rows, row] };
                    }
                  }
                  return t;
                }),
              };
            } else {
              return {
                ...c,
                tables: [
                  ...c.tables,
                  {
                    id: table_id,
                    name: "",
                    rows: [row],
                    rows_indexes: [],
                    delete_columns: [],
                    columns_indexes: [],
                    columns: [],
                    delete_rows: [],
                  },
                ],
              };
            }
          }
          return c;
        });
      } else {
        const newContractUpdate = {
          permissions: [],
          promises_indexes: [],
          id: contract_id,
          name: [],
          delete_tables: [],
          tables: [
            {
              id: table_id,
              name: "",
              rows: [row],
              rows_indexes: [],
              delete_columns: [],
              columns_indexes: [],
              columns: [],
              delete_rows: [],
            },
          ],
          delete_promises: [],
          promises: [],
        };
        updatedChangesContracts = [...contractsArray, newContractUpdate];
      }

      return {
        ...state,
        contracts: updatedContracts,
        changes: {
          ...state.changes,
          contracts: updatedChangesContracts,
        },
      };
    }

    case "DELETE_ROW": {
      const { contract_id, table_id, row_id } = action;

      // Remove row from the specific table in contract
      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...state.contracts[contract_id],
          contracts: state.contracts[contract_id].contracts.map((table) =>
            table.id === table_id
              ? { ...table, rows: table.rows.filter((r) => r.id !== row_id) }
              : table,
          ),
        },
      };

      // Update changes
      const contractsArray = Array.isArray(state.changes.contracts)
        ? state.changes.contracts
        : [];
      const existingContractIndex = contractsArray.findIndex(
        (c) => c.id === contract_id,
      );
      let updatedChangesContracts;

      if (existingContractIndex !== -1) {
        updatedChangesContracts = contractsArray.map((c, index) => {
          if (index === existingContractIndex) {
            const existingTableIndex = c.tables.findIndex(
              (t) => t.id === table_id,
            );
            if (existingTableIndex !== -1) {
              return {
                ...c,
                tables: c.tables.map((t, tIndex) => {
                  if (tIndex === existingTableIndex) {
                    const updatedRows = t.rows.filter((r) => r.id !== row_id);
                    const updatedDeleteRows = !row_id.includes("fresh_row")
                      ? [...t.delete_rows, row_id]
                      : t.delete_rows;

                    return {
                      ...t,
                      rows: updatedRows,
                      delete_rows: updatedDeleteRows,
                    };
                  }
                  return t;
                }),
              };
            } else {
              return {
                ...c,
                tables: [
                  ...c.tables,
                  {
                    id: table_id,
                    name: "",
                    rows: [],
                    rows_indexes: [],
                    delete_columns: [],
                    columns_indexes: [],
                    columns: [],
                    delete_rows: !row_id.includes("fresh_row") ? [row_id] : [],
                  },
                ],
              };
            }
          }
          return c;
        });
      } else {
        const newContractUpdate = {
          permissions: [],
          promises_indexes: [],
          id: contract_id,
          name: [],
          delete_tables: [],
          tables: [
            {
              id: table_id,
              name: "",
              rows: [],
              rows_indexes: [],
              delete_columns: [],
              columns_indexes: [],
              columns: [],
              delete_rows: !row_id.includes("fresh_row") ? [row_id] : [],
            },
          ],
          delete_promises: [],
          promises: [],
        };
        updatedChangesContracts = [...contractsArray, newContractUpdate];
      }

      return {
        ...state,
        contracts: updatedContracts,
        changes: {
          ...state.changes,
          contracts: updatedChangesContracts,
        },
      };
    }

    case "DELETE_COLUMN": {
      const { contract_id, table_id, column_id } = action;

      // Remove column from the specific table in contract
      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...state.contracts[contract_id],
          contracts: state.contracts[contract_id].contracts.map((table) =>
            table.id === table_id
              ? {
                  ...table,
                  columns: table.columns.filter((col) => col.id !== column_id),
                }
              : table,
          ),
        },
      };

      // Update changes
      const contractsArray = Array.isArray(state.changes.contracts)
        ? state.changes.contracts
        : [];
      const existingContractIndex = contractsArray.findIndex(
        (c) => c.id === contract_id,
      );
      let updatedChangesContracts;

      if (existingContractIndex !== -1) {
        updatedChangesContracts = contractsArray.map((c, index) => {
          if (index === existingContractIndex) {
            const existingTableIndex = c.tables.findIndex(
              (t) => t.id === table_id,
            );
            if (existingTableIndex !== -1) {
              return {
                ...c,
                tables: c.tables.map((t, tIndex) => {
                  if (tIndex === existingTableIndex) {
                    const updatedColumns = t.columns.filter(
                      (col) => col.id !== column_id,
                    );
                    const updatedDeleteColumns = !column_id.includes(
                      "fresh_column",
                    )
                      ? [...t.delete_columns, column_id]
                      : t.delete_columns;

                    return {
                      ...t,
                      columns: updatedColumns,
                      delete_columns: updatedDeleteColumns,
                    };
                  }
                  return t;
                }),
              };
            } else {
              return {
                ...c,
                tables: [
                  ...c.tables,
                  {
                    id: table_id,
                    name: "",
                    rows: [],
                    rows_indexes: [],
                    delete_columns: !column_id.includes("fresh_column")
                      ? [column_id]
                      : [],
                    columns_indexes: [],
                    columns: [],
                    delete_rows: [],
                  },
                ],
              };
            }
          }
          return c;
        });
      } else {
        const newContractUpdate = {
          permissions: [],
          promises_indexes: [],
          id: contract_id,
          name: [],
          delete_tables: [],
          tables: [
            {
              id: table_id,
              name: "",
              rows: [],
              rows_indexes: [],
              delete_columns: !column_id.includes("fresh_column")
                ? [column_id]
                : [],
              columns_indexes: [],
              columns: [],
              delete_rows: [],
            },
          ],
          delete_promises: [],
          promises: [],
        };
        updatedChangesContracts = [...contractsArray, newContractUpdate];
      }

      return {
        ...state,
        contracts: updatedContracts,
        changes: {
          ...state.changes,
          contracts: updatedChangesContracts,
        },
      };
    }
    case "ADD_PROMISE": {
      const { contract_id, promise, insertIndex } = action;

      let currentContract = state.contracts[contract_id];

      if (!currentContract) {
        currentContract = {
          id: contract_id,
          name: "Default Contract",
          owner: promise.sender,
          permissions: [],
          promises: [],
          promises_indexes: [],
          contracts: [],
          date_created: Date.now() * 1000000,
        };

        state = {
          ...state,
          contracts: {
            ...state.contracts,
            [contract_id]: currentContract,
          },
        };
      }

      const currentPromises = [...(currentContract.promises || [])];
      const actualIndex =
        insertIndex !== undefined && insertIndex < currentPromises.length
          ? insertIndex
          : currentPromises.length;

      currentPromises.splice(actualIndex, 0, promise);

      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...currentContract,
          promises: currentPromises,
        },
      };

      const contractsArray = Array.isArray(state.changes.contracts)
        ? state.changes.contracts
        : [];
      const existingContractIndex = contractsArray.findIndex(
        (c) => c.id === contract_id,
      );

      let updatedChangesContracts;
      if (existingContractIndex !== -1) {
        updatedChangesContracts = contractsArray.map((c, index) =>
          index === existingContractIndex
            ? {
                ...c,
                promises: [...(c.promises || []), promise],
              }
            : c,
        );
      } else {
        updatedChangesContracts = [
          ...contractsArray,
          {
            id: contract_id,
            permissions: [],
            promises_indexes: [],
            name: [],
            delete_tables: [],
            tables: [],
            delete_promises: [],
            promises: [promise],
          },
        ];
      }

      return {
        ...state,
        contracts: updatedContracts,
        changes: {
          ...state.changes,
          contracts: updatedChangesContracts,
        },
      };
    }

    case "UPDATE_PROMISE": {
      // UPDATE_PROMISE is used for SENDER actions (editing draft promises)
      // It updates BOTH state.contracts AND state.changes.contracts
      // This is correct because sender edits need to be batched and sent to backend via multi_updates
      //
      // IMPORTANT: Receiver actions (confirmed_c_payment, object_on_cancel, etc.) should NOT use this
      // They call backend directly and use SET_CONTRACT to refetch, which doesn't update changes
      const { contract_id, promise } = action;

      // Update the contract's promises in state
      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...state.contracts[contract_id],
          promises: state.contracts[contract_id].promises.map((p) =>
            p.id === promise.id ? promise : p,
          ),
        },
      };

      // Ensure changes.contracts is an array
      const contractsArray = Array.isArray(state.changes.contracts)
        ? state.changes.contracts
        : [];

      // Find existing contract update in changes
      const existingContractIndex = contractsArray.findIndex(
        (c) => c.id === contract_id,
      );

      let updatedChangesContracts;

      if (existingContractIndex !== -1) {
        // Contract update exists
        updatedChangesContracts = contractsArray.map((c, index) => {
          if (index === existingContractIndex) {
            const existingPromiseIndex = c.promises.findIndex(
              (p) => p.id === promise.id,
            );

            if (existingPromiseIndex !== -1) {
              // ✅ FIX: Replace the existing promise, don't add duplicates
              return {
                ...c,
                promises: c.promises.map((p) =>
                  p.id === promise.id ? promise : p,
                ),
              };
            } else {
              // ✅ FIX: Only add if it doesn't exist
              return {
                ...c,
                promises: [...c.promises, promise],
              };
            }
          }
          return c;
        });
      } else {
        // Create new contract update with ONLY this promise
        const newContractUpdate = {
          id: contract_id,
          permissions: [],
          promises_indexes: [],
          name: [],
          delete_tables: [],
          tables: [],
          delete_promises: [],
          promises: [promise], // ✅ Only the changed promise
        };
        updatedChangesContracts = [...contractsArray, newContractUpdate];
      }

      return {
        ...state,
        contracts: updatedContracts,
        changes: {
          ...state.changes,
          contracts: updatedChangesContracts,
        },
      };
    }
    case "DELETE_PROMISE": {
      const { contract_id, id } = action;

      const existingContract = state.contracts[contract_id];
      if (!existingContract) return state;

      const currentChanges = state.changes.contracts.find(
        (c) => c.id === contract_id,
      );
      const promiseInChanges = currentChanges?.promises.some(
        (p) => p.id === id,
      );

      const updatedChanges = currentChanges
        ? {
            ...currentChanges,
            promises: currentChanges.promises.filter((p) => p.id !== id),
            delete_promises: promiseInChanges
              ? currentChanges.delete_promises
              : [...currentChanges.delete_promises, id],
          }
        : {
            id: contract_id,
            permissions: [],
            promises_indexes: [],
            name: [],
            delete_tables: [],
            tables: [],
            delete_promises: [id],
            promises: [],
          };

      return {
        ...state,
        contracts: {
          ...state.contracts,
          [contract_id]: {
            ...existingContract,
            promises: existingContract.promises.filter((p) => p.id !== id),
          },
        },
        changes: {
          ...state.changes,
          contracts: currentChanges
            ? state.changes.contracts.map((c) =>
                c.id === contract_id ? updatedChanges : c,
              )
            : [...state.changes.contracts, updatedChanges],
        },
      };
    }

    case "UPDATE_PROMISES": {
      const { contract_id, promises } = action;

      // Replace all promises in the contract
      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...state.contracts[contract_id],
          promises: promises,
        },
      };

      // Ensure changes.contracts is an array
      const contractsArray = Array.isArray(state.changes.contracts)
        ? state.changes.contracts
        : [];

      // Find existing contract update in changes
      const existingContractIndex = contractsArray.findIndex(
        (c) => c.id === contract_id,
      );
      let updatedChangesContracts;

      if (existingContractIndex !== -1) {
        // Contract update exists, replace all promises
        updatedChangesContracts = contractsArray.map((c, index) =>
          index === existingContractIndex ? { ...c, promises: promises } : c,
        );
      } else {
        // Contract update doesn't exist, create new one
        const newContractUpdate = {
          id: contract_id,
          permissions: [],
          promises_indexes: [],
          name: [],
          delete_tables: [],
          tables: [],
          delete_promises: [],
          promises: promises,
        };
        updatedChangesContracts = [...contractsArray, newContractUpdate];
      }

      return {
        ...state,
        contracts: updatedContracts,
        changes: {
          ...state.changes,
          contracts: updatedChangesContracts,
        },
      };
    }

    case "RESOLVE_CHANGES":
      return {
        ...state,
        changes: {
          files: [],
          contents: {},
          contracts: [],
          delete_contracts: [],
          files_indexing: [],
        },
      };

    case "SET_INITED":
      return {
        ...state,
        inited: action.inited,
      };

    case "REPLACE_FILES_AND_CONTENTS":
      return {
        ...state,
        files: action.files,
        files_content: action.files_content,
      };

    case "UPDATE_FILE_WORKSPACES": {
      const { id, workspaces } = action.payload;

      const updateFile = (file: File) =>
        file.id === id ? { ...file, workspaces } : file;

      const updatedFile = state.files.find((f) => f.id === id);
      if (!updatedFile) return state;

      return {
        ...state,
        files: state.files.map(updateFile),
        current_file:
          state.current_file?.id === id
            ? { ...state.current_file, workspaces }
            : state.current_file,
        changes: {
          ...state.changes,
          files: state.changes.files.some((f) => f.id === id)
            ? state.changes.files.map(updateFile)
            : [...state.changes.files, { ...updatedFile, workspaces }],
        },
      };
    }

    case "UPDATE_FILE_TITLE":
      return {
        ...state,
        files: state.files.map((file) =>
          file.id === action.id ? { ...file, name: action.title } : file,
        ),
        current_file:
          state.current_file?.id === action.id
            ? { ...state.current_file, name: action.title }
            : state.current_file,
        changes: {
          ...state.changes,
          files: state.changes.files.find((f) => f.id === action.id)
            ? state.changes.files.map((f) =>
                f.id === action.id ? { ...f, name: action.title } : f,
              )
            : [
                ...state.changes.files,
                {
                  ...state.files.find((f) => f.id === action.id)!,
                  name: action.title,
                },
              ],
        },
      };

    case "UPDATE_BALANCE":
      return {
        ...state,
        wallet: { ...state.wallet, balance: action.balance },
      };

    case "SET_WALLET":
      return {
        ...state,
        wallet: action.wallet,
      };

    case "UPDATE_PROFILE":
      return {
        ...state,
        profile: { ...state.profile, ...action.profile },
      };
    // TODO firndRecuer

    case "UPDATE_FRIEND":
      return {
        ...state,
        friends: state.friends.map((friend) =>
          friend.id === action.id ? { ...friend, ...action } : friend,
        ),
      };

    case "REMOVE_FRIEND":
      return {
        ...state,
        friends: state.friends.filter((f) => f.id !== action.id),
        all_friends: state.all_friends.filter((u) => u.id !== action.id),
      };

    case "ADD_FRIEND":
      return {
        ...state,
        friends: [...state.friends, action.friend],

        all_friends: action.user
          ? [...state.all_friends, action.user]
          : state.all_friends,
      };

    case "CONFIRM_FRIEND": {
      const sender = action.friend.sender;
      const receiver = action.friend.receiver;
      return {
        ...state,
        friends: state.friends.map((f) => {
          if (f.sender.id === sender.id && receiver.id === f.receiver.id) {
            f.confirmed = true;
          }
          return f;
        }),
      };
    }

    // TODO profile reducer
    case "CURRENT_USER_HISTORY":
      return {
        ...state,
        profile_history: action.profile_history,
      };

    case "REMOVE_CONTRACT": {
      // Create a new contracts object without the deleted contract
      const { [action.id]: removed, ...remainingContracts } = state.contracts;

      // Ensure changes.contracts is an array and remove the contract
      const contractsArray = Array.isArray(state.changes.contracts)
        ? state.changes.contracts
        : [];
      const filteredContracts = contractsArray.filter(
        (c) => c.contract_id !== action.id,
      );

      return {
        ...state,
        contracts: remainingContracts,
        changes: {
          ...state.changes,
          contracts: filteredContracts,
          delete_contracts: [...state.changes.delete_contracts, action.id],
        },
      };
    }

    default:
      return state;
  }
}
