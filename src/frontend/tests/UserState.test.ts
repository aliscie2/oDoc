import { UserState, Subscription } from "../types/UserState";
import { describe, it, expect, vi } from "vitest";

describe("UserState", () => {
  // Test data
  const mockSubscription: Subscription = {
    tier: "premium",
    start_date: 1234567890,
    end_date: 1234567890 + 30 * 24 * 60 * 60, // 30 days later
  };

  // const mockUserState: UserState = {
  //     is_transfering: false,
  //     ai_credits: 100.0,
  //     subscription: mockSubscription,
  //     is_ai_free_tier: false,
  //     cycles_consumed: 0,
  //     cycles_ledger: new Map()
  // };

  // Test backend canister calls
  describe("Backend Integration", () => {
    it("should record cycles for an operation", async () => {
      // Mock the backend call
      const mockBackendCall = vi.fn().mockResolvedValue({
        cycles_consumed: 1000,
        cycles_ledger: { test_operation: 1000 },
      });

      const state = new UserState();
      state.record_cycles_mock("test_operation", 1000);

      expect(state.cycles_consumed).toBe(1000);
      expect(state.cycles_ledger.get("test_operation")).toBe(1000);
    });

    it("should track multiple operations", async () => {
      const mockBackendCall = vi.fn().mockResolvedValue({
        cycles_consumed: 2000,
        cycles_ledger: {
          operation1: 500,
          operation2: 1500,
        },
      });

      const state = new UserState();
      state.record_cycles_mock("operation1", 500);
      state.record_cycles_mock("operation2", 1500);

      expect(state.cycles_consumed).toBe(2000);
      expect(state.cycles_ledger.get("operation1")).toBe(500);
      expect(state.cycles_ledger.get("operation2")).toBe(1500);
    });
  });

  describe("UserState Cycle Tracking", () => {
    it("should record cycles for an operation", () => {
      const state = new UserState();
      state.record_cycles_mock("test_operation", 1000);

      expect(state.cycles_consumed).toBe(1000);
      expect(state.cycles_ledger.get("test_operation")).toBe(1000);
    });

    it("should track multiple operations", () => {
      const state = new UserState();

      state.record_cycles_mock("operation1", 500);
      state.record_cycles_mock("operation2", 1500);

      expect(state.cycles_consumed).toBe(2000);
      expect(state.cycles_ledger.get("operation1")).toBe(500);
      expect(state.cycles_ledger.get("operation2")).toBe(1500);
    });
  });
});
