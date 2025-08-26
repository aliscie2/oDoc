import { Principal } from "@dfinity/principal";
import { CPayment } from "$/declarations/backend/backend.did";
import { randomString } from "../../DataProcessing/dataSamples";

export function createNewPromis(
  sender: Principal,
  contract_id: string,
): CPayment {
  const status = { None: null };
  return {
    contract_id,
    id: "fresh_promise_" + randomString(),
    date_created: Date.now() * 1e6,
    date_released: 0,
    sender,
    status,
    amount: 0,
    receiver: Principal.fromText("2vxsx-fae"),
    cells: [],
  };
}

export const transformPromisesDataAndColumns = (
  promises: any[],
  existingColumnDefs: any[],
  isPromise: boolean,
  handleCustomCellChange: any,
) => {
  // Transform rows and collect unique cell fields
  const uniqueFields = new Set();

  const rows = promises.map((promise: any) => {
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
    promise.cells.forEach((cell: any) => {
      (row as any)[cell.field] = cell.value;
      uniqueFields.add(cell.field);
    });

    return row;
  });

  // Add new columns for cell fields that don't exist in base columns
  const extraColumns = Array.from(uniqueFields)
    .filter((field) => !existingColumnDefs.some((col: any) => col.field === field))
    .map((field: any) => ({
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

export const NotificationPromiesContextMenu = (_params: any) => {
  return [
    { name: "claim all promises" },
    { name: "claim selected promises" },
    { name: "release all promises" },
    { name: "release selected promises" },
  ];
};

export const getStatusOptions = (payment: CPayment, profileId: string) => {
  if (!payment.status) {
    return ["None"]; // or whatever default you want
  }

  const isSender = profileId === payment.sender.toString();
  const isReceiver = profileId === payment.receiver.toString();
  const currentStatus = Object.keys(payment.status)[0];

  if (isSender) {
    switch (currentStatus) {
      case "ApproveHighPromise":
      case "Confirmed":
        return ["RequestCancellation", "Released"];
      default:
        return ["None", "Released", "HighPromise"];
    }
  } else if (isReceiver) {
    switch (currentStatus) {
      case "HighPromise":
        return ["Objected", "ApproveHighPromise"];
      case "RequestCancellation":
        return ["Objected", "ConfirmedCancellation"];
      default:
        return ["Objected", "Confirmed"];
    }
  } else {
    // If user is neither sender nor receiver, they can't change status
    return [];
  }
};
