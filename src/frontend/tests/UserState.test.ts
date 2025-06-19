import { describe, it, expect } from "vitest";
import { UserState, UserStateManager } from "../types/UserState";

describe("UserStateManager", () => {
  const createTestState = (): UserState => ({
    is_transfering: false,
    ai_credits: 0,
    subscription: {
      tier: "basic",
      start_date: BigInt(Date.now()),
      end_date: BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    is_ai_free_tier: true,
    cycle_ledger: {
      total_cycles_consumed: BigInt(0),
      operation_cycles: {},
      last_updated: BigInt(Date.now()),
    },
  });

  it("should initialize with correct default values", () => {
    const state = createTestState();
    const manager = new UserStateManager(state);

    expect(manager.getState().is_transfering).toBe(false);
    expect(manager.getState().ai_credits).toBe(0);
    expect(manager.getState().subscription.tier).toBe("basic");
    expect(manager.getState().is_ai_free_tier).toBe(true);
    expect(manager.getTotalCyclesConsumed()).toBe(BigInt(0));
  });

  it("should record cycles for operations", () => {
    const state = createTestState();
    const manager = new UserStateManager(state);

    manager.recordCycles("file_upload", BigInt(1000));
    manager.recordCycles("chat_message", BigInt(500));
    manager.recordCycles("file_upload", BigInt(2000)); // Update existing operation

    expect(manager.getTotalCyclesConsumed()).toBe(BigInt(3000));
    expect(manager.getOperationCycles("file_upload")).toBe(BigInt(2000));
    expect(manager.getOperationCycles("chat_message")).toBe(BigInt(500));
    expect(manager.getOperationCycles("nonexistent")).toBe(BigInt(0));
  });

  it("should update last_updated timestamp when recording cycles", () => {
    const state = createTestState();
    const manager = new UserStateManager(state);
    const initialTimestamp = manager.getState().cycle_ledger.last_updated;

    // Wait a bit to ensure timestamp changes
    setTimeout(() => {
      manager.recordCycles("test_operation", BigInt(1000));
      expect(manager.getState().cycle_ledger.last_updated).toBeGreaterThan(
        initialTimestamp,
      );
    }, 100);
  });
});
