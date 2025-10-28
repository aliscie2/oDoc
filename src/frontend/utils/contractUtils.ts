import { CustomContract, StoredContract } from "$/declarations/backend/backend.did";

/**
 * Type guard to check if an object is a StoredContract (wrapped)
 */
export function isStoredContract(obj: unknown): obj is StoredContract {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "CustomContract" in obj &&
    obj.CustomContract !== null &&
    typeof obj.CustomContract === "object"
  );
}

/**
 * Type guard to check if an object is a CustomContract (unwrapped)
 */
export function isCustomContract(obj: unknown): obj is CustomContract {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "id" in obj &&
    "promises" in obj &&
    "name" in obj
  );
}

/**
 * Unwraps a StoredContract to CustomContract
 * If already unwrapped, returns as-is
 * This ensures consistent contract format throughout the app
 */
export function unwrapContract(
  contract: CustomContract | StoredContract | null | undefined
): CustomContract | null {
  if (!contract) return null;
  
  if (isStoredContract(contract)) {
    return contract.CustomContract;
  }
  
  if (isCustomContract(contract)) {
    return contract;
  }
  
  console.warn("Unknown contract format:", contract);
  return null;
}

/**
 * Unwraps multiple contracts
 */
export function unwrapContracts(
  contracts: Record<string, CustomContract | StoredContract>
): Record<string, CustomContract> {
  const unwrapped: Record<string, CustomContract> = {};
  
  Object.entries(contracts).forEach(([key, contract]) => {
    const unwrappedContract = unwrapContract(contract);
    if (unwrappedContract) {
      unwrapped[key] = unwrappedContract;
    }
  });
  
  return unwrapped;
}
