export interface Subscription {
  tier: string;
  start_date: number;
  end_date: number;
}

export class UserState {
  is_transfering: boolean;
  ai_credits: number;
  subscription: Subscription;
  is_ai_free_tier: boolean;
  cycles_consumed: number;
  cycles_ledger: Map<string, number>;

  constructor() {
    this.is_transfering = false;
    this.ai_credits = 0;
    this.subscription = {
      tier: "free",
      start_date: 0,
      end_date: 0,
    };
    this.is_ai_free_tier = true;
    this.cycles_consumed = 0;
    this.cycles_ledger = new Map();
  }

  record_cycles_mock(operation: string, cycles: number) {
    this.cycles_consumed += cycles;
    this.cycles_ledger.set(operation, cycles);
  }
}
