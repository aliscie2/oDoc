import { createIdentity } from "@dfinity/pic";
import { deposit, registerUser } from "../utils";

/**
 * Tests for withdrawal transaction safety
 * Ensures wallet balance is only deducted after successful token transfer
 */

test("should NOT deduct wallet balance if transfer fails", async () => {
  const { user } = await registerUser("safe_user");
  await deposit(user, 300_000_000);

  globalThis.testActor.setIdentity(user);

  // Get initial balance
  const initData = await globalThis.testActor.get_initial_data();
  expect("Ok" in initData).toBe(true);
  const initialBalance = initData.Ok.wallet.balance;
  expect(initialBalance).toBe(299);

  // Try to withdraw to invalid address (should fail)
  const invalidAddress = "invalid-principal-address";
  const withdrawResult = await globalThis.testActor.withdraw_ckusdc(
    BigInt(100),
    invalidAddress,
  );

  // Withdrawal should fail
  expect("Err" in withdrawResult).toBe(true);

  // Wallet balance should remain unchanged
  const finalData = await globalThis.testActor.get_initial_data();
  expect("Ok" in finalData).toBe(true);
  expect(finalData.Ok.wallet.balance).toBe(initialBalance);
});

test("should deduct wallet balance only after successful transfer", async () => {
  const { user: sender } = await registerUser("sender_user");
  await deposit(sender, 300_000_000);

  const receiver = createIdentity("receiver_user");
  const receiverAddress = receiver.getPrincipal().toString();

  globalThis.testActor.setIdentity(sender);

  // Get initial balances
  const initData = await globalThis.testActor.get_initial_data();
  expect("Ok" in initData).toBe(true);
  const initialWalletBalance = initData.Ok.wallet.balance;

  const initialReceiverBalance = await globalThis.ckusdcActor.icrc1_balance_of({
    owner: receiver.getPrincipal(),
    subaccount: [],
  });

  // Perform withdrawal
  const withdrawResult = await globalThis.testActor.withdraw_ckusdc(
    BigInt(100),
    receiverAddress,
  );

  expect("Ok" in withdrawResult).toBe(true);

  // Verify wallet balance was deducted
  const finalData = await globalThis.testActor.get_initial_data();
  expect("Ok" in finalData).toBe(true);
  expect(finalData.Ok.wallet.balance).toBe(initialWalletBalance - 100);

  // Verify receiver got the tokens
  const finalReceiverBalance = await globalThis.ckusdcActor.icrc1_balance_of({
    owner: receiver.getPrincipal(),
    subaccount: [],
  });

  expect(Number(finalReceiverBalance)).toBeGreaterThan(
    Number(initialReceiverBalance),
  );
});

test("should prevent withdrawal to self", async () => {
  const { user } = await registerUser("self_withdraw_user");
  await deposit(user, 300_000_000);

  globalThis.testActor.setIdentity(user);

  const initData = await globalThis.testActor.get_initial_data();
  expect("Ok" in initData).toBe(true);
  const initialBalance = initData.Ok.wallet.balance;

  // Try to withdraw to own address
  const ownAddress = user.getPrincipal().toString();
  const withdrawResult = await globalThis.testActor.withdraw_ckusdc(
    BigInt(50),
    ownAddress,
  );

  // Should fail with self-withdrawal error
  expect("Err" in withdrawResult).toBe(true);
  if ("Err" in withdrawResult && "IcCdkError" in withdrawResult.Err) {
    expect(withdrawResult.Err.IcCdkError.message).toContain(
      "Cannot withdraw to yourself",
    );
  }

  // Balance should remain unchanged
  const finalData = await globalThis.testActor.get_initial_data();
  expect("Ok" in finalData).toBe(true);
  expect(finalData.Ok.wallet.balance).toBe(initialBalance);
});
