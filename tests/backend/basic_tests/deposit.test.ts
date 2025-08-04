import { createIdentity } from "@dfinity/pic";
import { RegisterUser, Result_6 } from "$/declarations/backend/backend.did.js";
import { logger } from "@/DevUtils/logData";
import { Principal } from "@dfinity/principal";
import { deposit, registerUser } from "../utils";

async function createDummyUser(id: string) {
  const user = createIdentity(`dummy_${id}`);
  await registerUser(`dummy_${id}`);
  await deposit(user, 300_000_000);
  return user;
}

test("should signup new user successfully and receive initial balance", async () => {
  const { user } = await registerUser("test1");
  await deposit(user, 300_000_000);

  const initialData = await globalThis.testActor.get_initial_data();
  expect("Ok" in initialData).toBe(true);

  if ("Ok" in initialData) {
    expect(initialData.Ok.Wallet.balance).toBe(299);
  }
});

test("reentrancy protection test - should prevent concurrent withdrawals", async () => {
  const { user: mainUser } = await registerUser("attacker");
  await deposit(mainUser, 300_000_000);

  const targetUser = await createDummyUser("target");
  const targetAddress = targetUser.getPrincipal().toString();

  globalThis.testActor.setIdentity(mainUser);

  const withdrawalPromises = Array.from({ length: 200 }, (_, i) =>
    globalThis.testActor
      .withdraw_ckusdt(BigInt(100_000_000), targetAddress)
      .then((result: Result_6) => {
        console.log(`Withdrawal ${i}:`, result);
        return result;
      })
      .catch((err) => {
        console.log(`Withdrawal ${i} error:`, err);
        return { error: err, index: i };
      }),
  );

  const results = await Promise.allSettled(withdrawalPromises);

  const successfulWithdrawals = results.filter(
    (r) => r.status === "fulfilled" && r.value && "Ok" in r.value,
  ).length;

  const reentrancyErrors = results.filter(
    (r) =>
      r.status === "fulfilled" &&
      r.value &&
      "Err" in r.value &&
      r.value.Err &&
      typeof r.value.Err === "object" &&
      "IcCdkError" in r.value.Err &&
      r.value.Err.IcCdkError?.message?.includes(
        "Already trenasfering, please wait few seconds",
      ),
  ).length;

  logger({
    totalAttempts: 200,
    successfulWithdrawals,
    reentrancyErrors,
    otherErrors: 200 - successfulWithdrawals - reentrancyErrors,
  });

  expect(reentrancyErrors).toBeGreaterThan(0);
  expect(successfulWithdrawals).toBeLessThanOrEqual(1);
  expect(reentrancyErrors + successfulWithdrawals).toBe(200);
});
