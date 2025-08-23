import {
  CPayment,
  ContractUpdates,
} from "$/declarations/backend/backend.did.js";
import { createIdentity } from "@dfinity/pic";
import { deposit, registerUser } from "../utils";

async function createDummyUser(id: string) {
  const user = createIdentity(`dummy_${id}`);
  await registerUser(`dummy_${id}`);
  await deposit(user, 300_000_000);
  return user;
}

async function createContract() {
  const contractId = `test_${Date.now()}`;
  const update: ContractUpdates = {
    id: contractId,
    permissions: [],
    promises_indexes: [],
    name: ["Test Contract"],
    delete_tables: [],
    tables: [],
    delete_promises: [],
    promises: [],
  };

  const result = await globalThis.testActor.multi_updates([], [], [update], []);
  if (!("Ok" in result)) throw new Error("Failed to create contract");
  return contractId;
}

async function createPromise(
  contractId: string,
  sender: any,
  receiver: any,
  amount: number,
): Promise<CPayment> {
  const promise: CPayment = {
    id: `promise_${Date.now()}_${Math.random()}`,
    contract_id: contractId,
    sender: sender.getPrincipal(),
    receiver: receiver.getPrincipal(),
    amount,
    date_created: Date.now(),
    date_released: 0,
    status: { None: null },
    cells: [],
  };

  const update: ContractUpdates = {
    id: contractId,
    permissions: [],
    promises_indexes: [],
    name: [],
    delete_tables: [],
    tables: [],
    delete_promises: [],
    promises: [promise],
  };

  globalThis.testActor.setIdentity(sender);
  const result = await globalThis.testActor.multi_updates([], [], [update], []);
  if (!("Ok" in result)) throw new Error("Failed to create promise");
  return promise;
}

describe("Promise Actions Tests", () => {
  test("should confirm payment", async () => {
    const { user: sender } = await registerUser("sender");
    const receiver = await createDummyUser("receiver");
    await deposit(sender, 300_000_000);

    globalThis.testActor.setIdentity(sender);
    const contractId = await createContract();
    const promise = await createPromise(contractId, sender, receiver, 50);

    globalThis.testActor.setIdentity(receiver);
    const result = await globalThis.testActor.confirmed_c_payment(promise);
    expect("Ok" in result).toBe(true);

    globalThis.testActor.setIdentity(sender);
    const contract = await globalThis.testActor.get_contract(
      sender.getPrincipal().toString(),
      contractId,
    );

    if ("Ok" in contract && "CustomContract" in contract.Ok) {
      const updatedPromise = contract.Ok.CustomContract.promises.find(
        (p) => p.id === promise.id,
      );
      expect(updatedPromise?.status).toEqual({ Confirmed: null });
    }
  });

  test("should prevent double confirmation", async () => {
    const { user: sender } = await registerUser("sender2");
    const receiver = await createDummyUser("receiver2");
    await deposit(sender, 300_000_000);

    globalThis.testActor.setIdentity(sender);
    const contractId = await createContract();
    const promise = await createPromise(contractId, sender, receiver, 50);

    globalThis.testActor.setIdentity(receiver);
    await globalThis.testActor.confirmed_c_payment(promise);

    const result = await globalThis.testActor.confirmed_c_payment(promise);
    expect("Err" in result).toBe(true);
    expect(result.Err).toBe("Already confirmed");
  });

  test("should prevent unauthorized confirmation", async () => {
    const { user: sender } = await registerUser("sender3");
    const receiver = await createDummyUser("receiver3");
    const unauthorized = await createDummyUser("unauthorized");
    await deposit(sender, 300_000_000);

    globalThis.testActor.setIdentity(sender);
    const contractId = await createContract();
    const promise = await createPromise(contractId, sender, receiver, 50);

    globalThis.testActor.setIdentity(unauthorized);
    const result = await globalThis.testActor.confirmed_c_payment(promise);
    expect("Err" in result).toBe(true);
    expect(result.Err).toBe("Only receiver can confirm promise");
  });

  test("should delete promise", async () => {
    const { user: sender } = await registerUser("sender4");
    const receiver = await createDummyUser("receiver4");
    await deposit(sender, 300_000_000);

    globalThis.testActor.setIdentity(sender);
    const contractId = await createContract();
    const promise = await createPromise(contractId, sender, receiver, 75);

    const update: ContractUpdates = {
      id: contractId,
      permissions: [],
      promises_indexes: [],
      name: [],
      delete_tables: [],
      tables: [],
      delete_promises: [promise.id],
      promises: [],
    };

    const result = await globalThis.testActor.multi_updates(
      [],
      [],
      [update],
      [],
    );
    expect("Ok" in result).toBe(true);

    const contract = await globalThis.testActor.get_contract(
      sender.getPrincipal().toString(),
      contractId,
    );
    if ("Ok" in contract && "CustomContract" in contract.Ok) {
      const deletedPromise = contract.Ok.CustomContract.promises.find(
        (p) => p.id === promise.id,
      );
      expect(deletedPromise).toBeUndefined();
    }
  });

  test("should handle non-existent promise", async () => {
    const { user: sender } = await registerUser("sender5");
    const receiver = await createDummyUser("receiver5");
    await deposit(sender, 300_000_000);

    globalThis.testActor.setIdentity(sender);
    const contractId = await createContract();

    const fakePromise: CPayment = {
      id: "fake",
      contract_id: contractId,
      sender: sender.getPrincipal(),
      receiver: receiver.getPrincipal(),
      amount: 50,
      date_created: Date.now(),
      date_released: 0,
      status: { None: null },
      cells: [],
    };

    globalThis.testActor.setIdentity(receiver);
    const result = await globalThis.testActor.confirmed_c_payment(fakePromise);
    expect("Err" in result).toBe(true);
    expect(result.Err).toBe("Promise not found");
  });
});
