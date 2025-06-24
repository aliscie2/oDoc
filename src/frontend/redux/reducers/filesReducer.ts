import { FilesActions, InitialState, initialState } from "../types/filesTypes";
import {
  FileNode,
  Friend,
  StoredContract,
} from "../../../declarations/backend/backend.did";
import { deserializeContents } from "../../DataProcessing/deserlize/deserializeContents";
import { deserializeContracts } from "../../DataProcessing/deserlize/deserializeContracts";

export function filesReducer(
  state: InitialState = initialState,
  action: FilesActions,
): InitialState {
  function changeFile(newFile: FileNode) {
    if (state.changes.files.find((file) => file.id === newFile.id)) {
      state.changes.files = state.changes.files.map((file) =>
        file.id === file.id ? newFile : file,
      );
    } else {
      state.changes.files.push(newFile);
    }
    return { ...state };
  }

  switch (action.type) {
    case "INIT_FILES_STATE":
      let all_friends = [action.data.Profile];
      action.data.Friends.forEach((f: Friend) => {
        if (f.sender.id !== action.data.Profile.id) {
          all_friends.push(f.sender);
        } else {
          all_friends.push(f.receiver);
        }
      });
      return {
        ...state,
        all_friends,
        files: action.data.Files,
        wallet: action.data.Wallet,
        files_content: deserializeContents(action.data.FilesContents[0]),
        contracts: deserializeContracts(action.data.Contracts),
        profile: action.data.Profile,
        friends: action.data.Friends,
        inited: true,
        profile_history: action.data.ProfileHistory,
        workspaces: action.data.workspaces,
        // friends: action.data.Friends.map(friend => friend.id === action.id ? {...friend, ...action} : friend)
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
      // console.log({ action });
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

    case "REMOVE":
      return {
        ...state,
        files: state.files.filter((file) => file.id !== action.id),
        changes: {
          ...state.changes,
          files: state.changes.files.filter((file) => file.id !== action.id),
        },
      };

    case "CURRENT_FILE":
      // console.log({ action });
      // localStorage.setItem("current_file", JSON.stringify({ ...action.file }));
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
      let stored_custom: StoredContract = { CustomContract: action.contract };
      return {
        ...state,
        changes: {
          ...state.changes,
          contracts: {
            ...state.changes.contracts,
            [id]: { ...stored_custom },
          },
        },
        contracts: {
          ...state.contracts,
          [id]: contract,
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

    // case "RENAME_TABLE": {
    //   const { contract_id, table_id, new_name } = action;

    //   // Update table name in the contract
    //   const updatedContracts = {
    //     ...state.contracts,
    //     [contract_id]: {
    //       ...state.contracts[contract_id],
    //       contracts: state.contracts[contract_id].contracts.map((table) =>
    //         table.id === table_id ? { ...table, name: new_name } : table,
    //       ),
    //     },
    //   };

    //   // Update changes
    //   const contractsArray = Array.isArray(state.changes.contracts)
    //     ? state.changes.contracts
    //     : [];
    //   const existingContractIndex = contractsArray.findIndex(
    //     (c) => c.id === contract_id,
    //   );
    //   let updatedChangesContracts;

    //   if (existingContractIndex !== -1) {
    //     updatedChangesContracts = contractsArray.map((c, index) => {
    //       if (index === existingContractIndex) {
    //         const existingTableIndex = c.tables.findIndex(
    //           (t) => t.id === table_id,
    //         );
    //         if (existingTableIndex !== -1) {
    //           return {
    //             ...c,
    //             tables: c.tables.map((t, tIndex) =>
    //               tIndex === existingTableIndex ? { ...t, name: new_name } : t,
    //             ),
    //           };
    //         } else {
    //           return {
    //             ...c,
    //             tables: [
    //               ...c.tables,
    //               {
    //                 id: table_id,
    //                 name: new_name,
    //                 rows: [],
    //                 rows_indexes: [],
    //                 delete_columns: [],
    //                 columns_indexes: [],
    //                 columns: [],
    //                 delete_rows: [],
    //               },
    //             ],
    //           };
    //         }
    //       }
    //       return c;
    //     });
    //   } else {
    //     const newContractUpdate = {
    //       permissions: [],
    //       promises_indexes: [],
    //       id: contract_id,
    //       name: [],
    //       delete_tables: [],
    //       tables: [
    //         {
    //           id: table_id,
    //           name: new_name,
    //           rows: [],
    //           rows_indexes: [],
    //           delete_columns: [],
    //           columns_indexes: [],
    //           columns: [],
    //           delete_rows: [],
    //         },
    //       ],
    //       delete_promises: [],
    //       promises: [],
    //     };
    //     updatedChangesContracts = [...contractsArray, newContractUpdate];
    //   }

    //   return {
    //     ...state,
    //     contracts: updatedContracts,
    //     changes: {
    //       ...state.changes,
    //       contracts: updatedChangesContracts,
    //     },
    //   };
    // }

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
      const { contract_id, table_id, row } = action;

      // Add row to the specific table in contract
      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...state.contracts[contract_id],
          contracts: state.contracts[contract_id].contracts.map((table) =>
            table.id === table_id
              ? { ...table, rows: [...table.rows, row] }
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
                    ? { ...t, rows: [...t.rows, row] }
                    : t,
                ),
              };
            } else {
              // Create new table update
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

    case "ADD_COLUMN": {
      const { contract_id, table_id, column } = action;

      // Add column to the specific table in contract
      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...state.contracts[contract_id],
          contracts: state.contracts[contract_id].contracts.map((table) =>
            table.id === table_id
              ? { ...table, columns: [...table.columns, column] }
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
                    ? { ...t, columns: [...t.columns, column] }
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
      console.log({ action });

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
      const { contract_id, promise } = action;

      // Update the contract's promises
      const updatedContracts = {
        ...state.contracts,
        [contract_id]: {
          ...state.contracts[contract_id],
          promises: [...state.contracts[contract_id].promises, promise],
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
        // Contract update exists, add promise to it
        updatedChangesContracts = contractsArray.map((c, index) =>
          index === existingContractIndex
            ? { ...c, promises: [...c.promises, promise] }
            : c,
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
          id: contract_id,
          permissions: [],
          promises_indexes: [],
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
          id: contract_id,
          permissions: [],
          promises_indexes: [],
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
          id: contract_id,
          permissions: [],
          promises_indexes: [],
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

    case "RESOLVE_CHANGES":
      state.changes = {
        files: [],
        contents: {},
        contracts: {},
        delete_contracts: [],
        files_indexing: [],
      };
      return { ...state };

    case "UPDATE_FILE_WORKSPACES":
      let newFile = state.files.find((file) => file.id === action.id)!;
      newFile.workspaces = action.workspaces;
      state = changeFile(newFile);
      return <InitialState>{
        ...state,
        files: state.files.map((file) =>
          file.id === action.id
            ? { ...file, workspaces: action.workspaces }
            : file,
        ),
        current_file: { ...state.current_file, workspaces: action.workspaces },
      };

    case "UPDATE_FILE_TITLE":
      const updatedFile = {
        ...state.files.find((file) => file.id === action.id),
        name: action.title,
      };
      state = changeFile(updatedFile);
      return {
        ...state,
        files: state.files.map((file) =>
          file.id === action.id ? { ...file, name: action.title } : file,
        ),
        current_file: { ...state.current_file, name: action.title },
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

      let friends = state.friends.filter((f) => checkf(f));

      return { ...state, friends };

    case "ADD_FRIEND":
      return { ...state, friends: [...state.friends, action.friend] };

    case "CONFIRM_FRIEND":
      let sender = action.friend.sender;
      let receiver = action.friend.receiver;
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
      delete state.changes.contracts[action.id];
      return {
        ...state,
      };

    default:
      return state;
  }
}
