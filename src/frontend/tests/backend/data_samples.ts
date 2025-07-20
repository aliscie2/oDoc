import {
  CPayment,
  CustomContract,
} from "../../../declarations/backend/backend.did";
import { createNewPromis } from "../../components/ContractTable/utils";
import { Principal } from "@dfinity/principal";
import { randomString } from "../../DataProcessing/dataSamples";

export function newContract(): {
  custom_contract: CustomContract;
  promise: CPayment;
} {
  const contract_id: string = randomString();
  const promise: CPayment = createNewPromis(Principal.fromText("2vxsx-fae"));
  const custom_contract: CustomContract = {
    id: contract_id,
    creator: Principal.fromText("2vxsx-fae"),
    date_created: 0,
    payments: [],
    name: "string",
    formulas: [],
    contracts: [],
    date_updated: 0,
    promises: [promise],
    permissions: [],
  };
  return { custom_contract, promise };
}
