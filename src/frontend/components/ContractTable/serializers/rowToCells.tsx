import { MAIN_FIELDS } from "../views/Promises";
import { CCell } from "../../../../declarations/backend/backend.did";

function rowToCells(row): Array<CCell> {
  const rowKeys = Object.keys(row);
  const cellsKeys = rowKeys.filter((key) => !MAIN_FIELDS.includes(key));
  const cells = [];
  cellsKeys.forEach((key) => {
    if (key != "id") {
      cells.push({ id: key, field: key, value: row[key] });
    }
  });
  return cells;
}

export default rowToCells;
