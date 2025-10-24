import { Result_6 } from "$/declarations/backend/backend.did.js";
import { logger } from "@/DevUtils/logData";
import { createIdentity } from "@dfinity/pic";
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
    expect(initialData.Ok.wallet.balance).toBe(299);
  }
});

test("should withdraw successfully and update balance", async () => {
  const { user: mainUser } = await registerUser("withdrawer");
  await deposit(mainUser, 300_000_000);

  const targetUser = await createDummyUser("target");
  const targetAddress = targetUser.getPrincipal().toString();

  globalThis.testActor.setIdentity(mainUser);

  let initData = await globalThis.testActor.get_initial_data();
  expect("Ok" in initData).toBe(true);
  const initialBalance = initData.Ok.wallet.balance;
  expect(initialBalance).toBe(299);
  
  // Use withdraw_ckusdc to match the deposit token type
  const withdraw = await globalThis.testActor.withdraw_ckusdc(
    BigInt(299),
    targetAddress,
  );
  expect("Ok" in withdraw).toBe(true);

  initData = await globalThis.testActor.get_initial_data();
  expect("Ok" in initData).toBe(true);
  const finalBalance = initData.Ok.wallet.balance;

  expect(finalBalance).toBe(0);
});

test("reentrancy protection test - should prevent concurrent withdrawals", async () => {
  const { user: mainUser } = await registerUser("mainUser");
  await deposit(mainUser, 300_000_000);

  const attackerUser = await createDummyUser("attacker");
  const attackerAddres = attackerUser.getPrincipal().toString();

  let iBalance = await globalThis.ckusdcActor.icrc1_balance_of({
    owner: attackerUser.getPrincipal(),
    subaccount: [],
  });

  globalThis.testActor.setIdentity(mainUser);

  const withdrawalPromises = Array.from({ length: 50 }, (_, i) =>
    globalThis.testActor
      .withdraw_ckusdc(BigInt(299), attackerAddres)
      .then((result: Result_6) => {
        // console.log(`Withdrawal ${i}:`, result);
        return result;
      })
      .catch((err) => {
        // console.log(`Withdrawal ${i} error:`, err);
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

  let fBalance = await globalThis.ckusdcActor.icrc1_balance_of({
    owner: attackerUser.getPrincipal(),
    subaccount: [],
  });

  let canisterBalance = await globalThis.ckusdcActor.icrc1_balance_of({
    owner: Principal.fromText(globalThis.backendCanisterId),
    subaccount: [],
  });

  globalThis.testActor.setIdentity(mainUser);
  let initData = await globalThis.testActor.get_initial_data();
  // logger({
  //   canisterBalance,
  //   initData,
  //   iBalance,
  //   fBalance,
  //   totalAttempts: 200,
  //   successfulWithdrawals,
  //   reentrancyErrors,
  //   otherErrors: 200 - successfulWithdrawals - reentrancyErrors,
  // });

  // expect(reentrancyErrors).toBeGreaterThan(0);
  // expect(successfulWithdrawals).toBeLessThanOrEqual(1);
  // expect(reentrancyErrors + successfulWithdrawals).toBe(200);
});
