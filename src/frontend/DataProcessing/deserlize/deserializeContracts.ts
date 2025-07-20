import {
  CustomContract,
  StoredContract,
} from "../../../declarations/backend/backend.did";

// type ContractType = CustomContract;

export function deserializeContracts(json: Array<[string, StoredContract]>) {
  const contracts: Map<string, ContractType> = new Map();
  json &&
    json.map((item: [string, StoredContract]) => {
      const key: string = item[0];
      const value: StoredContract = item[1];
      const contract: CustomContract = Object.values(value)[0];
      contracts[key] = contract;
    });
  return contracts;
}
