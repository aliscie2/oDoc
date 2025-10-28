import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../reducers";
import { CustomContract, CPayment } from "$/declarations/backend/backend.did";

/**
 * Select a contract by ID from Redux state
 */
export const selectContractById = (contractId: string) =>
  createSelector(
    [(state: RootState) => state.filesState.contracts],
    (contracts) => contracts[contractId] || null
  );

/**
 * Select a contract with promises and payments merged
 * This is the main selector for displaying contracts
 */
export const selectContractWithMergedPromises = (contractId: string) =>
  createSelector(
    [selectContractById(contractId)],
    (contract): CustomContract | null => {
      if (!contract) return null;

      // Merge promises and payments
      const allPromises = [
        ...(contract.promises || []),
        ...(contract.payments || []),
      ];

      // Deduplicate by ID - keep first occurrence
      const uniquePromises = Array.from(
        new Map(allPromises.map((p) => [p.id, p])).values()
      );

      // Return contract with merged promises and empty payments
      return {
        ...contract,
        promises: uniquePromises,
        payments: [],
      };
    }
  );

/**
 * Select contracts filtered by user (for non-creators)
 */
export const selectFilteredContract = (
  contractId: string,
  userId: string | undefined
) =>
  createSelector(
    [selectContractWithMergedPromises(contractId)],
    (contract): CustomContract | null => {
      if (!contract) return null;

      // If no user or user is creator, return all promises
      if (!userId || !contract.creator || userId === contract.creator) {
        return contract;
      }

      // Filter promises for non-creator
      const filteredPromises = contract.promises.filter(
        (p: CPayment) => p.receiver.toString() === userId
      );

      return {
        ...contract,
        promises: filteredPromises,
      };
    }
  );

/**
 * Select all contracts as an array
 */
export const selectAllContracts = createSelector(
  [(state: RootState) => state.filesState.contracts],
  (contracts) => Object.values(contracts)
);

/**
 * Select contracts count
 */
export const selectContractsCount = createSelector(
  [selectAllContracts],
  (contracts) => contracts.length
);
