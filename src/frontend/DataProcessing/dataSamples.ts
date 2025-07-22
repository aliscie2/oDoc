import { Principal } from "@dfinity/principal";
import { CustomContract } from "../../declarations/backend/backend.did";


export const custom_contract: CustomContract = {
  id: "change_later",
  name: "Custom contract",
  creator: Principal.fromText("2vxsx-fae"),
  date_created: Date.now() * 1e6,
  payments: [],
  promises: [],
  contracts: [],
  formulas: [],
  date_updated: 0,
  permissions: [],
};

export const fileContentSample = [{ type: "p", children: [{ text: "" }] }];

export function randomString() {
  return Math.random().toString(36).substring(2, 8);
}
