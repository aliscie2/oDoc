import {
  CCell,
  CColumn,
  CContract,
  CPayment,
  CRow,
  CustomContract,
} from "../../../declarations/backend/backend.did";
import { randomString } from "../../DataProcessing/dataSamples";
import { Principal } from "@dfinity/principal";
import { produce } from "immer";

export function updateCContractColumn(contract, new_column): CContract {
  contract.columns = contract.columns.map((column: CColumn) => {
    if (column.id === new_column.id) {
      return { ...column, ...new_column };
    }
    return column;
  });
  return contract;
}

export function updateContractColumn(
  contract: CustomContract,
  updated_column,
  view: any,
): CustomContract {
  return {
    ...contract,
    contracts: contract.contracts.map((c: CContract) => {
      if (c.id === view.id) {
        return updateCContractColumn(c, updated_column);
      }
      return c;
    }),
  };
}

export function serializeContractColumn(
  contract,
  addVarsToParser,
  evaluate,
  all_users?,
): Array<CColumn> {
  return contract.columns.map((col: CColumn) => {
    if (col.formula_string && col.formula_string.length > 0) {
      col["width"] = 150;
      col["valueGetter"] = (params: any) => {
        addVarsToParser(params, contract);
        let ev = evaluate(col.formula_string);
        if (ev.err) {
          return "Invalid formula";
        }
        return ev.value;
      };
    } else {
      delete col["valueGetter"];
    }
    col["type"] = col.column_type;
    if (col.column_type == "user") {
      col["type"] = "singleSelect";
      col["valueOptions"] = all_users ? all_users.map((user) => user.name) : [];
    }
    return col;
  });
}

export function serializeContractRows(
  rows: Array<CRow>,
  columns: Array<CColumn>,
) {
  return rows.map((row: CRow) => {
    let cells: any = {};
    row.cells &&
      row.cells.map((cell: CCell) => {
        let c = {};
        cells[cell.field] = cell.value || "";
        return c;
      });
    if (row.cells.length < 1) {
      for (let i = 0; i < columns.length; i++) {
        cells[columns[i].field] = "";
      }
    }

    return { id: row.id, ...cells };
  });
}

export function deserializeContractRows(rows: Array<any>): Array<CRow> {
  return rows.map((row) => {
    let cells: Array<any> = [];
    Object.keys(row).map((k: string) => {
      if (k != "id" && k != "cells") {
        cells.push({
          value: String(row[k]) || "",
          field: k,
        });
      }
    });
    let de_row: CRow = {
      id: row["id"],
      cells,
    };
    return de_row;
  });
}

export const PROMISES_CONTRACT_FIELDS = [
  "amount",
  "sender",
  "status",
  "receiver",
  "id",
];

export function serializeRowToPromise(
  row: any,
  all_users: any[],
  contract,
): CPayment {
  let cells: Array<CCell> = Object.keys(row)
    .filter((key) => !PROMISES_CONTRACT_FIELDS.includes(key))
    .map((key) => ({ field: key, value: row[key] || "" }));
  let status: any = {};
  status[row.status] = null;
  let sender = all_users.find((user: any) => user.name === row.sender);
  let receiver = all_users.find((user: any) => user.name === row.receiver);

  let promise: CPayment = {
    id: row.id,
    status: status,
    date_created: 0,
    date_released: 0,
    cells,
    contract_id: contract.id,
    sender: Principal.fromText(sender.id),
    amount: Number(row.amount),
    receiver: receiver
      ? Principal.fromText(receiver.id)
      : Principal.fromText("2vxsx-fae"),
  };
  return promise;
}

export function createCColumn(field: string): CColumn {
  return {
    id: "fresh_column" + randomString(),
    field,
    name: "Untitled",
    column_type: "string",
    filters: [],
    permissions: [{ AnyOneView: null }],
    formula_string: "",
    editable: true,
    deletable: false,
  };
}

export function createCContract(): CContract {
  let field = randomString();
  let new_cell: CCell = {
    field,
    value: "",
  };
  let new_row: CRow = {
    id: randomString(),
    cells: [new_cell],
  };

  let new_column: CColumn = createCColumn(field);
  let new_c_contract: CContract = {
    id: randomString(),
    name: "Untitled",
    columns: [new_column],
    rows: [new_row],
    date_created: 0,
    creator: Principal.fromText("2vxsx-fae"),
  };
  return new_c_contract;
}

export function updateCustomContractRows(
  contract: CustomContract,
  new_rows: Array<CRow>,
  view_id: string,
): CustomContract {
  return {
    ...contract,
    contracts: contract.contracts.map((c: CContract) => {
      if (c.id === view_id) {
        return { ...c, rows: new_rows };
      }
      return c;
    }),
  };
}

export function updateCustomContractColumns(
  contract: CustomContract,
  new_columns,
  view: any,
): CustomContract {
  return {
    ...contract,
    contracts: contract.contracts.map((c: CContract) => {
      if (c.id === view.id) {
        return { ...c, columns: new_columns };
      }
      return c;
    }),
  };
}

export function createNewPromis(sender): CPayment {
  let status = { None: null };
  let new_promise: CPayment = {
    contract_id: "", // the backend will handle this
    id: "fresh_promise" + randomString(),
    date_created: Date.now() * 1e6,
    date_released: 0,
    sender,
    status,
    amount: 0,
    receiver: Principal.fromText("2vxsx-fae"),
    cells: [],
  };
  return new_promise;
}

export const handleCustomCellChange = (params) => {
  const { data, colDef, newValue, context } = params;
  const contract = context.contractsState;
  const paymentId = data.id;
  const fieldName = colDef.field;

  // Update the promises array
  const updatedPromises = contract.promises.map((promise) => {
    if (promise.id !== paymentId) return promise;

    // Find and update or add the cell
    const updatedCells = [...promise.cells];
    const cellIndex = updatedCells.findIndex(
      (cell) => cell.field === fieldName,
    );

    if (cellIndex >= 0) {
      // Update existing cell
      updatedCells[cellIndex] = {
        ...updatedCells[cellIndex],
        value: newValue,
      };
    } else {
      // Add new cell
      updatedCells.push({
        id: `${paymentId}_${fieldName}`,
        field: fieldName,
        value: newValue,
      });
    }

    return {
      ...promise,
      cells: updatedCells,
    };
  });

  context.dispatch({
    type: "UPDATE_PROMISES",
    contract_id: contract.id,
    promises: updatedPromises,
  });
  return true;
};

export const transformPromisesDataAndColumns = (
  promises,
  existingColumnDefs,
  isPromise,
) => {
  // Transform rows and collect unique cell fields
  const uniqueFields = new Set();

  const rows = promises.map((promise) => {
    // Start with base fields
    const row = {
      id: promise.id,
      amount: promise.amount,
      sender: promise.sender,
      receiver: promise.receiver,
      date_created: promise.date_created,
      date_released: promise.date_released,
      status: promise.status,
    };

    // Add cell values and collect unique fields
    promise.cells.forEach((cell) => {
      row[cell.field] = cell.value;
      uniqueFields.add(cell.field);
    });

    return row;
  });

  // Add new columns for cell fields that don't exist in base columns
  const extraColumns = Array.from(uniqueFields)
    .filter((field) => !existingColumnDefs.some((col) => col.field === field))
    .map((field) => ({
      field,
      headerName:
        field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " "),
      editable: isPromise,
      sortable: true,
      filter: true,
      onCellValueChanged: handleCustomCellChange,
    }));

  return {
    rows,
    columns: [...existingColumnDefs, ...extraColumns],
  };
};

export const addColumnToContract = (
  contract: CustomContract,
  fieldName: string,
  defaultValue: string = "",
): Array<CPayment> => {
  // Helper to add cell to a payment
  const addCellToPayment = (payment: CPayment): CPayment => {
    const newCell: CCell = {
      id: `${payment.id}_${fieldName}`,
      field: fieldName,
      value: defaultValue,
    };

    return {
      ...payment,
      cells: [...payment.cells, newCell],
    };
  };

  // If promises is empty, create a new promise with the new column
  if (contract.promises.length === 0) {
    const newPromise = createNewPromis(Principal.fromText(contract.creator));
    newPromise.cells = [
      {
        id: `${newPromise.id}_${fieldName}`,
        field: fieldName,
        value: defaultValue,
      },
    ];
    return {
      ...contract,
      promises: [newPromise],
      // date_updated: Date.now() * 1e6,
    };
  }

  // Update promises array if not empty
  const updatedPromises = contract.promises.map(addCellToPayment);
  return updatedPromises;
};

export const deleteColumnFromContract = (
  contract: CustomContract,
  fieldName: string,
): Array<CPayment> => {
  // Helper to remove cell from a payment
  const removeCellFromPayment = (payment: CPayment): CPayment => ({
    ...payment,
    cells: payment.cells.filter((cell) => cell.field !== fieldName),
  });

  // Update both promises and payments arrays
  const updatedPromises = contract.promises.map(removeCellFromPayment);
  // const updatedPayments = contract.payments.map(removeCellFromPayment);

  return updatedPromises;
};

export const handleAmountChange = (
  params,
  contract: CustomContract,
  dispatch: (contract: CustomContract) => void,
) => {
  const newAmount = parseFloat(params.newValue);

  // Validate amount
  if (isNaN(newAmount) || newAmount < 0) {
    alert("Please enter a valid positive number");
    return false;
  }

  const updatedPromises = contract.promises.map((promise) =>
    promise.id === params.data.id ? { ...promise, amount: newAmount } : promise,
  );
  dispatch({
    type: "UPDATE_PROMISES",
    contract_id: contract.id,
    promises: updatedPromises,
  });

  // const updatedContract = {
  //   ...contract,
  //   promises: updatedPromises,
  //   date_updated: Date.now(),
  // };

  return true;
};

export const handleStatusChange = (params, contract: CustomContract) => {
  const newStatus = params.newValue;

  const updatedPromises = contract.promises.map((promise) => {
    if (promise.id !== params.data.id) return promise;

    // If status is "Objected", include the reason

    const status =
      newStatus === "Objected"
        ? { [newStatus]: params.data.status[newStatus] || "" }
        : { [newStatus]: null };

    return { ...promise, status };
  });
  return updatedPromises;
};

export const handleReceiverChange = (
  params,
  contract: CustomContract,
  dispatch,
) => {
  const selectedName = params.newValue;
  const selectedUser = params.context.users.find(
    (u) => u.name === selectedName,
  );

  if (!selectedUser) {
    alert("Invalid user selected");
    return false;
  }

  const updatedPromises = contract.promises.map((promise) =>
    promise.id === params.data.id
      ? { ...promise, receiver: Principal.fromText(selectedUser.id) }
      : promise,
  );
  dispatch({
    type: "UPDATE_PROMISES",
    contract_id: contract.id,
    promises: updatedPromises,
  });

  // const updatedContract = {
  //   ...contract,
  //   promises: updatedPromises,
  //   date_updated: Date.now(),
  // };

  return true;
};

export const renameColumnInContract = (
  contract: CustomContract,
  oldFieldName: string,
  newFieldName: string,
): Array<CPayment> => {
  // Update both promises and payments arrays
  const updatedPromises = contract.promises.map((payment) => ({
    ...payment,
    cells: payment.cells.map((cell) =>
      cell.field === oldFieldName
        ? {
            ...cell,
            field: newFieldName,
            id: cell.id.replace(oldFieldName, newFieldName),
          }
        : cell,
    ),
  }));

  // const updatedPayments = contract.payments.map(payment => ({
  //   ...payment,
  //   cells: payment.cells.map(cell =>
  //     cell.field === oldFieldName
  //       ? { ...cell, field: newFieldName, id: cell.id.replace(oldFieldName, newFieldName) }
  //       : cell
  //   )
  // }));

  return updatedPromises;
};

export const NotificationPromiesContextMenu = (params) => {
  return [
    { name: "claim all promises" },
    { name: "claim selected promises" },
    { name: "release all promises" },
    { name: "release selected promises" },
  ];
};
export const contractContextMenu = (params) => {
  const { contractsState, selectedContract, dispatch } = params.context;

  const baseMenuItems = [
    {
      name: "Add Row",
      action: () => {
        const newRow = {
          id: randomString(),
          cells: selectedContract.columns.map((col) => ({
            id: randomString(),
            field: col.field,
            value: "",
          })),
        };
        // const updatedContract = {
        //   ...contractsState,
        //   contracts: contractsState.contracts.map((c) =>
        //     c.id === selectedContract.id
        //       ? { ...c, rows: [...c.rows, newRow] }
        //       : c,
        //   ),
        // };
        dispatch({
          type: "ADD_ROW",
          contract_id: contractsState.id,
          row: newRow,
          table_id: selectedContract.id,
        });
      },
    },
    {
      name: "Add Column",
      action: () => {
        const newColumn = createCColumn(`untitled_${randomString()}`);

        // const updatedRows = selectedContract.rows.map((row) => ({
        //   ...row,
        //   cells: [
        //     ...row.cells,
        //     {
        //       id: randomString(),
        //       field: newColumn.field,
        //       value: "",
        //     },
        //   ],
        // }));

        dispatch({
          type: "ADD_COLUMN",
          contract_id: contractsState.id,
          column: newColumn,
          table_id: selectedContract.id,
        });
      },
    },
  ];

  if (params.node) {
    baseMenuItems.push({
      name: "Delete Row",
      action: () => {
        // const updatedContract = {
        //   ...contractsState,
        //   contracts: contractsState.contracts.map((c) =>
        //     c.id === selectedContract.id
        //       ? {
        //           ...c,
        //           rows: c.rows.filter((row) => row.id !== params.node.data.id),
        //         }
        //       : c,
        //   ),
        // };
        // const { contract_id, table_id, row_id } = action;

        dispatch({
          type: "DELETE_ROW",
          contract_id: contractsState.id,
          table_id: selectedContract.id,
          row_id: params.node.data.id,
        });
      },
    });
  }

  if (params.column) {
    baseMenuItems.push({
      name: "Rename Column",
      action: () => {
        const oldFieldName = params.column.getColId();
        const newFieldName = window.prompt(
          "Enter new name for column:",
          oldFieldName,
        );

        if (!newFieldName || newFieldName === oldFieldName) return;
        // TODO fix later
        dispatch({
          type: "UPDATE_COLUMN",
          contract_id: contractsState.id,
          column: { ...params.column.colDef, name: newFieldName },
          table_id: selectedContract.id,
        });

        // const updatedContract = {
        //   ...contractsState,
        //   contracts: contractsState.contracts.map((c) =>
        //     c.id === selectedContract.id
        //       ? {
        //           ...c,
        //           columns: c.columns.map((col) =>
        //             col.field === oldFieldName
        //               ? { ...col, field: newFieldName, name: newFieldName }
        //               : col,
        //           ),
        //           rows: c.rows.map((row) => ({
        //             ...row,
        //             cells: row.cells.map((cell) =>
        //               cell.field === oldFieldName
        //                 ? { ...cell, field: newFieldName }
        //                 : cell,
        //             ),
        //           })),
        //         }
        //       : c,
        //   ),
        // };
      },
    });

    baseMenuItems.push({
      name: "Delete Column",
      action: () => {
        // const fieldName = params.column.getColId();
        dispatch({
          type: "DELETE_COLUMN",
          contract_id: contractsState.id,
          column_id: params.column.colDef.id,
          table_id: selectedContract.id,
        });
        // const updatedContract = {
        //   ...contractsState,
        //   contracts: contractsState.contracts.map((c) =>
        //     c.id === selectedContract.id
        //       ? {
        //           ...c,
        //           columns: c.columns.filter((col) => col.field !== fieldName),
        //           rows: c.rows.map((row) => ({
        //             ...row,
        //             cells: row.cells.filter((cell) => cell.field !== fieldName),
        //           })),
        //         }
        //       : c,
        //   ),
        // };
      },
    });
  }

  return baseMenuItems;
};

function serializeRowCellsData(data) {
  // Create the base structure with `id` and `cells`
  const transformedData = {
    id: data.id,
    cells: [],
  };

  // Process other keys in the data object
  for (const [key, value] of Object.entries(data)) {
    if (key === "id" || key === "cells") continue; // Skip 'id' and 'cells'

    // Check if a cell with the same field exists
    const existingCell = transformedData.cells.find(
      (cell) => cell.field === key,
    );

    if (existingCell) {
      // Update the value of the existing cell
      existingCell.value = value;
    } else {
      // Add a new cell with a random ID, the key as the field, and the value
      transformedData.cells.push({
        id: randomString(), // Generate a random ID
        field: key,
        value: value,
      });
    }

    // Remove the key from the top-level object
    delete data[key];
  }

  return transformedData;
}
export const getContractColumnDefs = (columns) => {
  return columns.map((col) => {
    return {
      ...col,
      field: col.field,
      headerName: col.name || col.field,
      editable: col.editable,

      onCellValueChanged: (params) => {
        const { data, context } = params;
        const { contractsState, selectedContract } = context;
        // const updatedContract = produce(contractsState, (draft) => {
        //   const contract = draft.contracts.find(
        //     (c) => c.id === selectedContract.id,
        //   );
        //   if (contract) {
        //     const row = contract.rows.find((row) => row.id === data.id);
        //     if (row) {
        //       Object.assign(row, serializeRowCellsData(data)); // Mutate the draft safely
        //     }
        //   }
        // });
        // const row = contract.rows.find((row) => row.id === data.id);
        // console.log({data})
        params.context.dispatch({
          type: "UPDATE_ROW",
          contract_id: contractsState.id,
          table_id: selectedContract.id,
          row: serializeRowCellsData(data),
        });
      },
    };
  });
};
