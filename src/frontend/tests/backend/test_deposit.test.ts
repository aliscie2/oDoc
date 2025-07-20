import {
  InitialData,
  RegisterUser,
} from "../../../declarations/backend/backend.did";

test("Test deposit", async () => {
  const input: RegisterUser = {
    name: ["name1"],
    description: ["Somthing"],
    photo: [[]],
  };
  // register user 1
  const res = await global.actor.register("", input);
  expect("Ok" in res).toBeTruthy();

  // deposit_usdt
  const res2 = await global.actor.deposit_usdt(Number(100));
  expect("Ok" in res2).toBeTruthy();

  const res3: { Ok: InitialData } | { Err: string } =
    await global.actor.get_initial_data();
  let balance = res3.Ok.Wallet.balance;
  expect(balance == 100).toBeTruthy();

  // withdraw_usdt
  const res4 = await global.actor.withdraw_usdt(Number(100));

  const res5: { Ok: InitialData } | { Err: string } =
    await global.actor.get_initial_data();
  balance = res5.Ok.Wallet.balance;
  expect(balance == 0).toBeTruthy();
});
