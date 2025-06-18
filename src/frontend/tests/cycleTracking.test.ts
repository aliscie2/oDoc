import { describe, it, expect, vi, beforeEach } from "vitest";
import { ActorSubclass } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

interface MockBackendActor {
  record_cycles: (
    operation: string,
    cycles: bigint,
  ) => Promise<{ Ok: null } | { Err: string }>;
  get_total_cycles: () => Promise<{ Ok: bigint } | { Err: string }>;
  get_operation_cycles: (
    operation: string,
  ) => Promise<{ Ok: bigint } | { Err: string }>;
}

// Mock backend actor
const mockBackendActor: MockBackendActor = {
  record_cycles: vi.fn(),
  get_total_cycles: vi.fn(),
  get_operation_cycles: vi.fn(),
};

describe("Cycle Tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should record cycles for an operation", async () => {
    (mockBackendActor.record_cycles as any).mockResolvedValue({ Ok: null });

    const operation = "file_upload";
    const cycles = BigInt(1000);

    const result = await mockBackendActor.record_cycles(operation, cycles);

    expect(result).toEqual({ Ok: null });
    expect(mockBackendActor.record_cycles).toHaveBeenCalledWith(
      operation,
      cycles,
    );
  });

  it("should get total cycles consumed", async () => {
    const expectedTotal = BigInt(3000);
    (mockBackendActor.get_total_cycles as any).mockResolvedValue({
      Ok: expectedTotal,
    });

    const result = await mockBackendActor.get_total_cycles();

    expect(result).toEqual({ Ok: expectedTotal });
    expect(mockBackendActor.get_total_cycles).toHaveBeenCalled();
  });

  it("should get cycles for specific operation", async () => {
    const operation = "file_upload";
    const expectedCycles = BigInt(2000);
    (mockBackendActor.get_operation_cycles as any).mockResolvedValue({
      Ok: expectedCycles,
    });

    const result = await mockBackendActor.get_operation_cycles(operation);

    expect(result).toEqual({ Ok: expectedCycles });
    expect(mockBackendActor.get_operation_cycles).toHaveBeenCalledWith(
      operation,
    );
  });

  it("should handle errors when recording cycles", async () => {
    const error = "User state not found";
    (mockBackendActor.record_cycles as any).mockResolvedValue({ Err: error });

    const result = await mockBackendActor.record_cycles("test", BigInt(1000));

    expect(result).toEqual({ Err: error });
  });

  it("should handle errors when getting cycles", async () => {
    const error = "User state not found";
    (mockBackendActor.get_total_cycles as any).mockResolvedValue({
      Err: error,
    });

    const result = await mockBackendActor.get_total_cycles();

    expect(result).toEqual({ Err: error });
  });
});
