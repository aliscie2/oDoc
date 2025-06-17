export interface Subscription {
  tier: string;
  start_date: bigint;
  end_date: bigint;
}

export interface CycleLedger {
  total_cycles_consumed: bigint;
  operation_cycles: Record<string, bigint>;
  last_updated: bigint;
}

export interface UserState {
  is_transfering: boolean;
  ai_credits: number;
  subscription: Subscription;
  is_ai_free_tier: boolean;
  cycle_ledger: CycleLedger;
}

export class UserStateManager {
  private state: UserState;

  constructor(state: UserState) {
    this.state = state;
  }

  recordCycles(operation: string, cycles: bigint): void {
    this.state.cycle_ledger.total_cycles_consumed += cycles;
    this.state.cycle_ledger.operation_cycles[operation] = cycles;
    this.state.cycle_ledger.last_updated = BigInt(Date.now());
  }

  getOperationCycles(operation: string): bigint {
    return this.state.cycle_ledger.operation_cycles[operation] || BigInt(0);
  }

  getTotalCyclesConsumed(): bigint {
    return this.state.cycle_ledger.total_cycles_consumed;
  }

  getState(): UserState {
    return this.state;
  }
}
