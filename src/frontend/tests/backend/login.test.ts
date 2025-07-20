import {
  _SERVICE,
  RegisterUser,
  User,
} from "../../../declarations/backend/backend.did";
import { AnonymousIdentity, Identity } from "@dfinity/agent";

test("Test render login", async () => {
  const input: RegisterUser = {
    name: ["string"],
    description: ["Somthing"],
    photo: [[]],
  };

  const res = await global.actor.register(input);

  const input2: RegisterUser = {
    name: ["user2"],
    description: ["Somthing"],
    photo: [[]],
  };
  const res2: { Ok: User } | { Err: string } =
    await global.actor.register(input2);
  // expect(res2.Ok.name === input.name[0]).toBeTruthy();

  // const user2 = createIdentity("2");
  const anonymous: Identity = new AnonymousIdentity();
  const anonymous_actor: _SERVICE = await global.actor.setIdentity(anonymous);
  const res3 = await global.actor.register(input2);
  expect(res3.Err).toBe("Anonymous users are not allowed to register.");
});
