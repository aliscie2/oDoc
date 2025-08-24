import {
  CPayment,
  ContractUpdates,
} from "$/declarations/backend/backend.did.js";
import { createIdentity } from "@dfinity/pic";
import { deposit, registerUser } from "../utils";

describe("Contract Notification isSeen Tests", () => {
  test("should only mark changed promises as unseen", async () => {
    // Setup users
    const { user: sender } = await registerUser("sender");
    const receiver = createIdentity("receiver");
    await registerUser("receiver");
    await deposit(sender, 300_000_000);

    // Create contract with two promises
    globalThis.testActor.setIdentity(sender);
    const contractId = `test_${Date.now()}`;

    const promise1: CPayment = {
      id: `p1_${Date.now()}`,
      contract_id: contractId,
      sender: sender.getPrincipal(),
      receiver: receiver.getPrincipal(),
      amount: 0,
      date_created: Date.now(),
      date_released: 0,
      status: { None: null },
      cells: [],
    };

    const promise2: CPayment = {
      id: `p2_${Date.now()}`,
      contract_id: contractId,
      sender: sender.getPrincipal(),
      receiver: receiver.getPrincipal(),
      amount: 0,
      date_created: Date.now(),
      date_released: 0,
      status: { None: null },
      cells: [],
    };

    const createUpdate: ContractUpdates = {
      id: contractId,
      permissions: [],
      promises_indexes: [],
      name: ["Test Contract"],
      delete_tables: [],
      tables: [],
      delete_promises: [],
      promises: [promise1, promise2],
    };

    await globalThis.testActor.multi_updates([], [], [createUpdate], []);

    // Mark all notifications as seen
    globalThis.testActor.setIdentity(receiver);
    let notifications = await globalThis.testActor.get_user_notifications(0);
    await globalThis.testActor.see_notifications([promise1.id, promise2.id]);

    // Verify all are seen
    notifications = await globalThis.testActor.get_user_notifications(0);
    expect(notifications.every((n) => n.is_seen)).toBe(true);

    // Update only promise1 (change amount)
    globalThis.testActor.setIdentity(sender);
    const updatePromise1 = { ...promise1, amount: 100 };
    const updateContract: ContractUpdates = {
      id: contractId,
      permissions: [],
      promises_indexes: [],
      name: [],
      delete_tables: [],
      tables: [],
      delete_promises: [],
      promises: [updatePromise1],
    };

    await globalThis.testActor.multi_updates([], [], [updateContract], []);

    // Check notifications
    globalThis.testActor.setIdentity(receiver);
    notifications = await globalThis.testActor.get_user_notifications(0);

    const p1Notification = notifications.find((n) => n.id === promise1.id);
    const p2Notification = notifications.find((n) => n.id === promise2.id);

    // Only promise1 should be unseen
    expect(p1Notification?.is_seen).toBe(false);
    expect(p2Notification?.is_seen).toBe(true);
  });

  test("should not mark as unseen when no changes made", async () => {
    const { user: sender } = await registerUser("sender2");
    const receiver = createIdentity("receiver2");
    await registerUser("receiver2");
    await deposit(sender, 300_000_000);

    globalThis.testActor.setIdentity(sender);
    const contractId = `test_${Date.now()}`;

    const promise: CPayment = {
      id: `p_${Date.now()}`,
      contract_id: contractId,
      sender: sender.getPrincipal(),
      receiver: receiver.getPrincipal(),
      amount: 50,
      date_created: Date.now(),
      date_released: 0,
      status: { None: null },
      cells: [],
    };

    // Create promise
    const createUpdate: ContractUpdates = {
      id: contractId,
      permissions: [],
      promises_indexes: [],
      name: ["Test"],
      delete_tables: [],
      tables: [],
      delete_promises: [],
      promises: [promise],
    };

    await globalThis.testActor.multi_updates([], [], [createUpdate], []);

    // Mark as seen
    globalThis.testActor.setIdentity(receiver);
    await globalThis.testActor.see_notifications([promise.id]);

    // Update with same data
    globalThis.testActor.setIdentity(sender);
    const noChangeUpdate: ContractUpdates = {
      id: contractId,
      permissions: [],
      promises_indexes: [],
      name: [],
      delete_tables: [],
      tables: [],
      delete_promises: [],
      promises: [{ ...promise }], // Same data
    };

    await globalThis.testActor.multi_updates([], [], [noChangeUpdate], []);

    // Should remain seen
    globalThis.testActor.setIdentity(receiver);
    const notifications = await globalThis.testActor.get_user_notifications(0);
    const notification = notifications.find((n) => n.id === promise.id);
    expect(notification?.is_seen).toBe(true);
  });
});
