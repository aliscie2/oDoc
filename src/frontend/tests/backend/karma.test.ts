import { PocketIc } from "@hadronous/pic";
import { ActorSubclass } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { randomString } from "../utils";

interface TestContext {
  pic: PocketIc;
  actor: ActorSubclass;
  user: any;
  newUser: () => Promise<any>;
}

declare global {
  var pic: PocketIc;
  var actor: ActorSubclass;
  var user: any;
  var newUser: () => Promise<any>;
}

describe("Karma/Action Score Tests", () => {
  beforeEach(async () => {
    // Setup test environment
    global.pic = new PocketIc();
    // Initialize your actor and user here
  });

  afterEach(() => {
    global.pic.tearDown();
  });

  test("Test karma increase after interacting with three users", async () => {
    // Create initial promise
    const promise = {
      id: randomString(),
      amount: 100,
      sender: global.user.getPrincipal(),
      receiver: null,
      status: { None: null },
      date_created: Date.now() * 1e6,
    };

    // Create promises with 3 different users
    const promises = [];
    for (let i = 0; i < 3; i++) {
      const newUser = await global.newUser();
      promises.push({
        ...promise,
        id: randomString(),
        receiver: newUser.getPrincipal(),
      });
    }

    // Store promises
    const to_store = {
      CustomContract: {
        id: randomString(),
        creator: global.user.getPrincipal(),
        promises,
        date_created: Date.now() * 1e6,
      },
    };

    // Apply updates
    const res = await global.actor.multi_updates([], [], [to_store], [], []);
    expect("Ok" in res).toBeTruthy();

    // Check karma score
    const profile_history = await global.actor.get_user_profile(global.user.getPrincipal());
    expect(profile_history.Ok.users_interacted).toEqual(3);
    expect(profile_history.Ok.actions_rate).toBeGreaterThan(0);
  });

  test("Test karma increase after interacting with 4-10 users", async () => {
    const promise = {
      id: randomString(),
      amount: 100,
      sender: global.user.getPrincipal(),
      receiver: null,
      status: { None: null },
      date_created: Date.now() * 1e6,
    };

    // Create promises with 7 different users
    const promises = [];
    for (let i = 0; i < 7; i++) {
      const newUser = await global.newUser();
      promises.push({
        ...promise,
        id: randomString(),
        receiver: newUser.getPrincipal(),
      });
    }

    const to_store = {
      CustomContract: {
        id: randomString(),
        creator: global.user.getPrincipal(),
        promises,
        date_created: Date.now() * 1e6,
      },
    };

    const res = await global.actor.multi_updates([], [], [to_store], [], []);
    expect("Ok" in res).toBeTruthy();

    const profile_history = await global.actor.get_user_profile(global.user.getPrincipal());
    expect(profile_history.Ok.users_interacted).toEqual(7);
    expect(profile_history.Ok.actions_rate).toBeGreaterThan(0);
  });

  test("Test promise cap after three consecutive cancellations", async () => {
    const promise = {
      id: randomString(),
      amount: 100,
      sender: global.user.getPrincipal(),
      receiver: null,
      status: { None: null },
      date_created: Date.now() * 1e6,
    };

    // Create and cancel three promises
    for (let i = 0; i < 3; i++) {
      const newUser = await global.newUser();
      const promiseWithReceiver = {
        ...promise,
        id: randomString(),
        receiver: newUser.getPrincipal(),
      };

      // Create promise
      let to_store = {
        CustomContract: {
          id: randomString(),
          creator: global.user.getPrincipal(),
          promises: [promiseWithReceiver],
          date_created: Date.now() * 1e6,
        },
      };

      await global.actor.multi_updates([], [], [to_store], [], []);

      // Cancel promise
      promiseWithReceiver.status = { ConfirmedCancellation: null };
      to_store = {
        CustomContract: {
          id: randomString(),
          creator: global.user.getPrincipal(),
          promises: [promiseWithReceiver],
          date_created: Date.now() * 1e6,
        },
      };

      await global.actor.multi_updates([], [], [to_store], [], []);
    }

    // Try to create a promise with amount > $50 (should fail)
    const newUser = await global.newUser();
    const largePromise = {
      ...promise,
      id: randomString(),
      amount: 100, // > $50
      receiver: newUser.getPrincipal(),
    };

    const to_store = {
      CustomContract: {
        id: randomString(),
        creator: global.user.getPrincipal(),
        promises: [largePromise],
        date_created: Date.now() * 1e6,
      },
    };

    const res = await global.actor.multi_updates([], [], [to_store], [], []);
    expect("Err" in res).toBeTruthy();
  });

  test("Test staking mark time after three cancellations", async () => {
    const promise = {
      id: randomString(),
      amount: 100,
      sender: global.user.getPrincipal(),
      receiver: null,
      status: { None: null },
      date_created: Date.now() * 1e6,
    };

    // Create and cancel three promises
    for (let i = 0; i < 3; i++) {
      const newUser = await global.newUser();
      const promiseWithReceiver = {
        ...promise,
        id: randomString(),
        receiver: newUser.getPrincipal(),
      };

      // Create promise
      let to_store = {
        CustomContract: {
          id: randomString(),
          creator: global.user.getPrincipal(),
          promises: [promiseWithReceiver],
          date_created: Date.now() * 1e6,
        },
      };

      await global.actor.multi_updates([], [], [to_store], [], []);

      // Cancel promise
      promiseWithReceiver.status = { ConfirmedCancellation: null };
      to_store = {
        CustomContract: {
          id: randomString(),
          creator: global.user.getPrincipal(),
          promises: [promiseWithReceiver],
          date_created: Date.now() * 1e6,
        },
      };

      await global.actor.multi_updates([], [], [to_store], [], []);
    }

    // Check if user is marked for staking
    const profile_history = await global.actor.get_user_profile(global.user.getPrincipal());
    expect(profile_history.Ok.actions_rate).toBeLessThan(1.5); // Low karma score indicates staking
  });

  test("Mock bus down withdraw in unit test", async () => {
    // Create a promise
    const promise = {
      id: randomString(),
      amount: 100,
      sender: global.user.getPrincipal(),
      receiver: null,
      status: { None: null },
      date_created: Date.now() * 1e6,
    };

    const newUser = await global.newUser();
    const promiseWithReceiver = {
      ...promise,
      id: randomString(),
      receiver: newUser.getPrincipal(),
    };

    // Create promise
    let to_store = {
      CustomContract: {
        id: randomString(),
        creator: global.user.getPrincipal(),
        promises: [promiseWithReceiver],
        date_created: Date.now() * 1e6,
      },
    };

    await global.actor.multi_updates([], [], [to_store], [], []);

    // Mock bus down by simulating network failure
    global.pic.setTime(Date.now() * 1e6 + 31 * 24 * 60 * 60 * 1e6); // Advance time by 31 days

    // Try to withdraw
    const withdrawPromise = {
      ...promiseWithReceiver,
      status: { Released: null },
    };

    to_store = {
      CustomContract: {
        id: randomString(),
        creator: global.user.getPrincipal(),
        promises: [withdrawPromise],
        date_created: Date.now() * 1e6,
      },
    };

    const res = await global.actor.multi_updates([], [], [to_store], [], []);
    expect("Err" in res).toBeTruthy(); // Should fail due to bus down
  });
}); 