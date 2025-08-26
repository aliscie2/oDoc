import { FilesActions, InitialState, initialState } from "../types/filesTypes";
import {
  Friend,
  StoredContract,
} from "../../../declarations/backend/backend.did";
import { deserializeContents } from "../../DataProcessing/deserlize/deserializeContents";
import { deserializeContracts } from "../../DataProcessing/deserlize/deserializeContracts";

export function filesReducer(
  state: InitialState = initialState,
  action: FilesActions,
): InitialState {
  switch (action.type) {
    case "INIT_FILES_STATE":
      const all_friends = [action.data.Profile];
      // Add defensive check for Friends array
      if (action.data.Friends && Array.isArray(action.data.Friends)) {
        action.data.Friends.forEach((f: Friend) => {
          if (f.sender.id !== action.data.Profile.id) {
            all_friends.push(f.sender);
          } else {
            all_friends.push(f.receiver);
          }
        });
      }
      return {
        ...state,
        all_friends,
        files: action.data.Files || [],
        wallet: action.data.Wallet,
        files_content: action.data.FilesContents && action.data.FilesContents[0] 
          ? deserializeContents(action.data.FilesContents[0]) 
          : {},
        contracts: action.data.Contracts ? deserializeContracts(action.data.Contracts) : {},
        profile: action.data.Profile,
        friends: action.data.Friends || [],
        inited: true,
        profile_history: action.data.ProfileHistory || state.profile_history,
        workspaces: action.data.workspaces || state.workspaces,
      };

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
      const { contract } = action;
      const id = contract.id;
      const stored_custom: StoredContract = { CustomContract: action.contract };

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
          [id]: contract,
        },
      };
    }

    case "SET_CONTRACT": {
      const { contract } = action;
      const id = contract.id;

      // Only update state, don't add to changes (no backend save needed)
      return {
        ...state,
        contracts: {
          ...state.contracts,
          [id]: contract,
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
          promises_indexes: currentContract.promises_indexes || [],
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
          promises_indexes: currentContract.promises_indexes || [],
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

    case "UPDATE_ROWS": {
      const { contract_id, table_id, rows } = action;

      // Update/add multiple rows in the specific table
      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...state.contracts[contract_id],
          contracts: state.contracts[contract_id].contracts.map((table) => {
            if (table.id === table_id) {
              const updatedRows = [...table.rows];
              rows.forEach((newRow) => {
                const existingIndex = updatedRows.findIndex(
                  (r) => r.id === newRow.id,
                );
                if (existingIndex !== -1) {
                  updatedRows[existingIndex] = newRow;
                } else {
                  updatedRows.push(newRow);
                }
              });
              return { ...table, rows: updatedRows };
            }
            return table;
          }),
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
                    const updatedRows = [...t.rows];
                    rows.forEach((newRow) => {
                      const existingIndex = updatedRows.findIndex(
                        (r) => r.id === newRow.id,
                      );
                      if (existingIndex !== -1) {
                        updatedRows[existingIndex] = newRow;
                      } else {
                        updatedRows.push(newRow);
                      }
                    });
                    return { ...t, rows: updatedRows };
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
                    rows: rows,
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
              rows: rows,
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
      console.log("ADD_PROMISE Debug:");
      console.log("- Contract ID:", contract_id);
      console.log("- Promise:", JSON.stringify(promise, null, 2));
      console.log("- Insert Index:", insertIndex);
      console.log("- Available Contracts:", Object.keys(state.contracts));
      console.log("- Contract Exists:", !!state.contracts[contract_id]);

      let currentContract = state.contracts[contract_id];

      // If contract doesn't exist, create a default one
      if (!currentContract) {
        console.log(
          "ADD_PROMISE: Creating default contract for ID:",
          contract_id,
        );
        currentContract = {
          id: contract_id,
          name: "Default Contract",
          owner: promise.sender,
          permissions: [],
          promises: [],
          promises_indexes: [],
          contracts: [],
          date_created: Date.now() * 1000000, // Convert to nanoseconds
        };

        // Add the new contract to state
        state = {
          ...state,
          contracts: {
            ...state.contracts,
            [contract_id]: currentContract,
          },
        };
      }

      // Handle promises array
      const currentPromises = [...(currentContract.promises || [])];
      if (insertIndex !== undefined && insertIndex < currentPromises.length) {
        currentPromises.splice(insertIndex, 0, promise);
      } else {
        currentPromises.push(promise);
      }

      // Handle promises_indexes array - this controls the display order
      const currentIndexes = [...(currentContract.promises_indexes || [])];
      if (insertIndex !== undefined && insertIndex < currentIndexes.length) {
        currentIndexes.splice(insertIndex, 0, [insertIndex, promise.id]);
        // Re-index all subsequent items
        for (let i = insertIndex + 1; i < currentIndexes.length; i++) {
          currentIndexes[i] = [i, currentIndexes[i][1]];
        }
      } else {
        currentIndexes.push([currentIndexes.length, promise.id]);
      }

      // Update the contract
      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...currentContract,
          promises: currentPromises,
          promises_indexes: currentIndexes,
        },
      };

      // Handle changes array
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
                promises: currentPromises,
                promises_indexes: currentIndexes, // Update indexes in changes too
              }
            : c,
        );
      } else {
        const newContractUpdate = {
          id: contract_id,
          permissions: [],
          promises_indexes: currentIndexes, // Include indexes
          name: [],
          delete_tables: [],
          tables: [],
          delete_promises: [],
          promises: currentPromises,
        };
        updatedChangesContracts = [...contractsArray, newContractUpdate];
      }

      console.log("ADD_PROMISE Final State:");
      console.log(
        "- Updated Contract:",
        JSON.stringify(updatedContracts[contract_id], null, 2),
      );
      console.log(
        "- Total Promises in Contract:",
        updatedContracts[contract_id]?.promises?.length || 0,
      );

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
      const { contract_id, promise } = action;

      // Update the contract's promises
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
        // Contract update exists, update or add promise
        updatedChangesContracts = contractsArray.map((c, index) => {
          if (index === existingContractIndex) {
            const existingPromiseIndex = c.promises.findIndex(
              (p) => p.id === promise.id,
            );
            if (existingPromiseIndex !== -1) {
              // Update existing promise
              return {
                ...c,
                promises: c.promises.map((p, pIndex) =>
                  pIndex === existingPromiseIndex ? promise : p,
                ),
              };
            } else {
              // Add new promise
              return { ...c, promises: [...c.promises, promise] };
            }
          }
          return c;
        });
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
          promises: [promise],
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

      // Remove promise from contract
      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...state.contracts[contract_id],
          promises: state.contracts[contract_id].promises.filter(
            (p) => p.id !== id,
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
        // Contract update exists, remove promise and handle delete_promises
        updatedChangesContracts = contractsArray.map((c, index) => {
          if (index === existingContractIndex) {
            const updatedPromises = c.promises.filter((p) => p.id !== id);
            const updatedDeletePromises = !id.includes("fresh_promise")
              ? [...c.delete_promises, id]
              : c.delete_promises;

            return {
              ...c,
              promises: updatedPromises,
              delete_promises: updatedDeletePromises,
            };
          }
          return c;
        });
      } else {
        // Contract update doesn't exist, create new one
        const newContractUpdate = {
          id: contract_id,
          permissions: [],
          promises_indexes: [],
          name: [],
          delete_tables: [],
          tables: [],
          delete_promises: !id.includes("fresh_promise") ? [id] : [],
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

    case "UPDATE_FILE_WORKSPACES":
      return {
        ...state,
        files: state.files.map((file) =>
          file.id === action.id
            ? { ...file, workspaces: action.workspaces }
            : file,
        ),
        current_file:
          state.current_file?.id === action.id
            ? { ...state.current_file, workspaces: action.workspaces }
            : state.current_file,
        changes: {
          ...state.changes,
          files: state.changes.files.find((f) => f.id === action.id)
            ? state.changes.files.map((f) =>
                f.id === action.id
                  ? { ...f, workspaces: action.workspaces }
                  : f,
              )
            : [
                ...state.changes.files,
                {
                  ...state.files.find((f) => f.id === action.id)!,
                  workspaces: action.workspaces,
                },
              ],
        },
      };

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
      function checkf(f: any) {
        let sender = f.sender.id;
        let receiver = f.receiver.id;
        if (typeof sender != "string") {
          sender = sender.toString();
        }
        if (typeof receiver != "string") {
          receiver = receiver.toString();
        }

        return sender !== action.id && receiver !== action.id;
      }

      const friends = state.friends.filter((f) => checkf(f));

      return { ...state, friends };

    case "ADD_FRIEND":
      return { ...state, friends: [...state.friends, action.friend] };

    case "CONFIRM_FRIEND":
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

    // TODO profile reducer
    case "CURRENT_USER_HISTORY":
      return {
        ...state,
        profile_history: action.profile_history,
      };

    case "REMOVE_CONTRACT":
      delete state.contracts[action.id];
      state.changes.delete_contracts.push(action.id);

      // Ensure changes.contracts is an array and remove the contract
      const contractsArray = Array.isArray(state.changes.contracts)
        ? state.changes.contracts
        : [];
      const filteredContracts = contractsArray.filter(
        (c) => c.contract_id !== action.id,
      );

      return {
        ...state,
        changes: {
          ...state.changes,
          contracts: filteredContracts,
        },
      };

    default:
      return state;
  }
}
