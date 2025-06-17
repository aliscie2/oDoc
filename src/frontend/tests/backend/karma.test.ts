import { PocketIc } from "@hadronous/pic";
import { ActorSubclass } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { IDL } from "@dfinity/candid";
import { randomString } from "../../DataProcessing/dataSamples";
import test, { describe, beforeEach, afterEach } from "node:test";
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";

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
    
    // Create a subnet for the canister
    const subnet = await global.pic.createSubnet({
      kind: "Application"
    });
    
    // Install your canister
    const canisterId = await global.pic.createCanister(subnet);
    
    // TODO: Replace these paths with your actual canister files
    const wasmPath = path.join(__dirname, "canister.wasm");
    const candidPath = path.join(__dirname, "canister.did");
    
    // Check if files exist before trying to read them
    if (!fs.existsSync(wasmPath)) {
      throw new Error(`WASM file not found: ${wasmPath}. Please update the path in the test.`);
    }
    
    await global.pic.installCode({
      canisterId,
      wasmModule: fs.readFileSync(wasmPath),
      candidPath: candidPath
    });
    
    // Create actor instance with your canister interface
    global.actor = global.pic.createActor({
      canisterId,
      interfaceFactory: ({ IDL }) => {
        // TODO: Update this interface to match the actual canister
       
        
        const Promise = IDL.Record({
          id: IDL.Text,
          amount: IDL.Nat,
          sender: IDL.Principal,
          receiver: IDL.Opt(IDL.Principal),
          status: IDL.Variant({
            None: IDL.Null,
            ConfirmedCancellation: IDL.Null,
            Released: IDL.Null,
            // Add other status variants as needed
          }),
          date_created: IDL.Nat64
        });
        
        const CustomContract = IDL.Record({
          id: IDL.Text,
          creator: IDL.Principal,
          promises: IDL.Vec(Promise),
          date_created: IDL.Nat64
        });
        
        const UserProfile = IDL.Record({
          users_interacted: IDL.Nat,
          actions_rate: IDL.Float64,
          staking_end_time: IDL.Opt(IDL.Nat64),
          // Add other profile fields from your backend
        });
        
        return IDL.Service({
          multi_updates: IDL.Func(
            [
              IDL.Vec(IDL.Text), // Update these parameter types to match your actual function
              IDL.Vec(IDL.Text),
              IDL.Vec(IDL.Variant({ CustomContract: CustomContract })),
              IDL.Vec(IDL.Text),
              IDL.Vec(IDL.Text)
            ],
            [IDL.Variant({ Ok: IDL.Text, Err: IDL.Text })]
          ),
          get_user_profile: IDL.Func(
            [IDL.Principal],
            [IDL.Variant({ Ok: UserProfile, Err: IDL.Text })]
          ),
          // Add other canister methods you need for testing
        });
      }
    });
    
    // Create main test user
    const userIdentity = global.pic.createIdentity();
    global.user = {
      identity: userIdentity,
      getPrincipal: () => userIdentity.getPrincipal()
    };
    
    // Helper function to create new users for testing
    global.newUser = async () => {
      const newIdentity = global.pic.createIdentity();
      return {
        identity: newIdentity,  
        getPrincipal: () => newIdentity.getPrincipal()
      };
    };
    
    // Optional: Initialize user in the system if needed
    // This depends on how your canister handles new users
    try {
      const profile = await global.actor.get_user_profile(global.user.getPrincipal());
      if ("Err" in profile) {
        console.log("User not found, may need to create user first");
        // Add user creation logic here if your canister requires it
      }
    } catch (error) {
      console.log("Could not fetch user profile:", error);
      // Handle initialization as needed
    }
  });

  afterEach(() => {
    global.pic.tearDown();
  });

  test("Test karma increase after interacting with three users and releasing promises", async () => {
    // Get initial karma score
    const initialProfile = await global.actor.get_user_profile(global.user.getPrincipal());
    const initialKarma = initialProfile.Ok?.actions_rate || 0;
    const initialInteractions = initialProfile.Ok?.users_interacted || 0;

    // Create initial promise template
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
    const newUsers = [];
    
    for (let i = 0; i < 3; i++) {
      const newUser = await global.newUser();
      newUsers.push(newUser);
      promises.push({
        ...promise,
        id: randomString(),
        receiver: newUser.getPrincipal(),
      });
    }

    // Store promises (create them)
    const to_store = {
      CustomContract: {
        id: randomString(),
        creator: global.user.getPrincipal(),
        promises,
        date_created: Date.now() * 1e6,
      },
    };

    const createRes = await global.actor.multi_updates([], [], [to_store], [], []);
    expect("Ok" in createRes).toBeTruthy();

    // Now release the promises to increase karma
    const releasedPromises = promises.map(p => ({
      ...p,
      status: { Released: null }
    }));

    const releaseStore = {
      CustomContract: {
        id: randomString(),
        creator: global.user.getPrincipal(),
        promises: releasedPromises,
        date_created: Date.now() * 1e6,
      },
    };

    const releaseRes = await global.actor.multi_updates([], [], [releaseStore], [], []);
    expect("Ok" in releaseRes).toBeTruthy();

    // Check karma score increased
    const finalProfile = await global.actor.get_user_profile(global.user.getPrincipal());
    expect(finalProfile.Ok.users_interacted).toEqual(initialInteractions + 3);
    expect(finalProfile.Ok.actions_rate).toBeGreaterThan(initialKarma);
    
    console.log(`Initial karma: ${initialKarma}, Final karma: ${finalProfile.Ok.actions_rate}`);
  });

  test("Test karma increase after interacting with 4-10 users and releasing promises", async () => {
    // Get initial karma score
    const initialProfile = await global.actor.get_user_profile(global.user.getPrincipal());
    const initialKarma = initialProfile.Ok?.actions_rate || 0;
    const initialInteractions = initialProfile.Ok?.users_interacted || 0;

    const promise = {
      id: randomString(),
      amount: 100,
      sender: global.user.getPrincipal(),
      receiver: null,
      status: { None: null },
      date_created: Date.now() * 1e6,
    };

    // Create promises with 7 different users (between 4-10)
    const promises = [];
    const newUsers = [];
    
    for (let i = 0; i < 7; i++) {
      const newUser = await global.newUser();
      newUsers.push(newUser);
      promises.push({
        ...promise,
        id: randomString(),
        receiver: newUser.getPrincipal(),
      });
    }

    // Store promises (create them)
    const to_store = {
      CustomContract: {
        id: randomString(),
        creator: global.user.getPrincipal(),
        promises,
        date_created: Date.now() * 1e6,
      },
    };

    const createRes = await global.actor.multi_updates([], [], [to_store], [], []);
    expect("Ok" in createRes).toBeTruthy();

    // Release the promises to increase karma
    const releasedPromises = promises.map(p => ({
      ...p,
      status: { Released: null }
    }));

    const releaseStore = {
      CustomContract: {
        id: randomString(),
        creator: global.user.getPrincipal(),
        promises: releasedPromises,
        date_created: Date.now() * 1e6,
      },
    };

    const releaseRes = await global.actor.multi_updates([], [], [releaseStore], [], []);
    expect("Ok" in releaseRes).toBeTruthy();

    // Check karma score increased more significantly for more interactions
    const finalProfile = await global.actor.get_user_profile(global.user.getPrincipal());
    expect(finalProfile.Ok.users_interacted).toEqual(initialInteractions + 7);
    expect(finalProfile.Ok.actions_rate).toBeGreaterThan(initialKarma);
    
    console.log(`Initial karma: ${initialKarma}, Final karma: ${finalProfile.Ok.actions_rate}`);
  });

  test("Test promise amount cap after three consecutive cancellations", async () => {
    const promise = {
      id: randomString(),
      amount: 100,
      sender: global.user.getPrincipal(),
      receiver: null,
      status: { None: null },
      date_created: Date.now() * 1e6,
    };

    // Create and cancel three promises consecutively
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

      const createRes = await global.actor.multi_updates([], [], [to_store], [], []);
      expect("Ok" in createRes).toBeTruthy();

      // Cancel promise
      const cancelledPromise = {
        ...promiseWithReceiver,
        status: { ConfirmedCancellation: null }
      };
      
      const cancelStore = {
        CustomContract: {
          id: randomString(),
          creator: global.user.getPrincipal(),
          promises: [cancelledPromise],
          date_created: Date.now() * 1e6,
        },
      };

      const cancelRes = await global.actor.multi_updates([], [], [cancelStore], [], []);
      expect("Ok" in cancelRes).toBeTruthy();
    }

    // Try to create a promise with amount > $50 (should fail due to cap)
    const newUser = await global.newUser();
    const largePromise = {
      ...promise,
      id: randomString(),
      amount: 100, // > $50 cap
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
    // This should fail when the cap is implemented
    expect("Err" in res).toBeTruthy();
    
    // Test that smaller amounts still work
    const smallPromise = {
      ...promise,
      id: randomString(),
      amount: 50, // <= $50 cap
      receiver: newUser.getPrincipal(),
    };

    const smallStore = {
      CustomContract: {
        id: randomString(),
        creator: global.user.getPrincipal(),
        promises: [smallPromise],
        date_created: Date.now() * 1e6,
      },
    };

    const smallRes = await global.actor.multi_updates([], [], [smallStore], [], []);
    expect("Ok" in smallRes).toBeTruthy();
  });

  test("Test staking mark and 30-day promise lock after three cancellations", async () => {
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
      const cancelledPromise = {
        ...promiseWithReceiver,
        status: { ConfirmedCancellation: null }
      };
      
      const cancelStore = {
        CustomContract: {
          id: randomString(),
          creator: global.user.getPrincipal(),
          promises: [cancelledPromise],
          date_created: Date.now() * 1e6,
        },
      };

      await global.actor.multi_updates([], [], [cancelStore], [], []);
    }

    // Check if user is marked for staking (low karma score)
    const profile_history = await global.actor.get_user_profile(global.user.getPrincipal());
    expect(profile_history.Ok.actions_rate).toBeLessThan(1.5); // Low karma indicates penalty
    
    // The third cancellation should trigger staking
    // Check if staking period is set (this would be in user profile/history)
    expect(profile_history.Ok.staking_end_time).toBeDefined();
    
    // Verify staking period is approximately 30 days from now
    const thirtyDaysInNs = 30 * 24 * 60 * 60 * 1e9; // 30 days in nanoseconds
    const currentTime = Date.now() * 1e6;
    const expectedStakingEnd = currentTime + thirtyDaysInNs;
    
    // Allow for some variance in timing
    expect(profile_history.Ok.staking_end_time).toBeCloseTo(expectedStakingEnd, -7); // Within ~100ms
    
    // Try to create a new promise during staking period (should fail)
    const newUser = await global.newUser();
    const stakedPromise = {
      ...promise,
      id: randomString(),
      receiver: newUser.getPrincipal(),
    };

    const stakedStore = {
      CustomContract: {
        id: randomString(),
        creator: global.user.getPrincipal(),
        promises: [stakedPromise],
        date_created: Date.now() * 1e6,
      },
    };

    const stakedRes = await global.actor.multi_updates([], [], [stakedStore], [], []);
    expect("Err" in stakedRes).toBeTruthy(); // Should fail during staking period
  });

  test("Mock bus down scenario and test withdraw failure", async () => {
    // Create a promise first
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

    // Create the promise
    let to_store = {
      CustomContract: {
        id: randomString(),
        creator: global.user.getPrincipal(),
        promises: [promiseWithReceiver],
        date_created: Date.now() * 1e6,
      },
    };

    const createRes = await global.actor.multi_updates([], [], [to_store], [], []);
    expect("Ok" in createRes).toBeTruthy();

    // Mock bus down by advancing time significantly (31 days)
    // This simulates a network outage/bus down scenario
    const thirtyOneDaysInNs = 31 * 24 * 60 * 60 * 1e9;
    global.pic.setTime(Date.now() * 1e6 + thirtyOneDaysInNs);

    // Try to withdraw/release the promise after bus down period
    const withdrawPromise = {
      ...promiseWithReceiver,
      status: { Released: null },
    };

    const withdrawStore = {
      CustomContract: {
        id: randomString(),
        creator: global.user.getPrincipal(),
        promises: [withdrawPromise],
        date_created: Date.now() * 1e6,
      },
    };

    // This should fail due to bus down timeout
    const withdrawRes = await global.actor.multi_updates([], [], [withdrawStore], [], []);
    expect("Err" in withdrawRes).toBeTruthy();
    
    // Verify the error is related to bus down/timeout
    if ("Err" in withdrawRes) {
      const errorMessage = withdrawRes.Err;
      expect(errorMessage).toMatch(/bus.*down|timeout|network.*failure/i);
    }

    // Test that immediate withdrawal (before bus down) would work
    // Reset time back to normal
    global.pic.setTime(Date.now() * 1e6);
    
    // Create another promise for immediate test
    const immediatePromise = {
      ...promise,
      id: randomString(),
      receiver: newUser.getPrincipal(),
    };

    const immediateStore = {
      CustomContract: {
        id: randomString(),
        creator: global.user.getPrincipal(),
        promises: [immediatePromise],
        date_created: Date.now() * 1e6,
      },
    };

    await global.actor.multi_updates([], [], [immediateStore], [], []);

    // Immediate withdrawal should work
    const immediateWithdraw = {
      ...immediatePromise,
      status: { Released: null },
    };

    const immediateWithdrawStore = {
      CustomContract: {
        id: randomString(),
        creator: global.user.getPrincipal(),
        promises: [immediateWithdraw],
        date_created: Date.now() * 1e6,
      },
    };

    const immediateRes = await global.actor.multi_updates([], [], [immediateWithdrawStore], [], []);
    expect("Ok" in immediateRes).toBeTruthy();
  });

  test("Test karma recovery after successful promise fulfillment", async () => {
    // First, get user into low karma state through cancellations
    const promise = {
      id: randomString(),
      amount: 50,
      sender: global.user.getPrincipal(),
      receiver: null,
      status: { None: null },
      date_created: Date.now() * 1e6,
    };

    // Cancel 2 promises to lower karma but not trigger full penalty
    for (let i = 0; i < 2; i++) {
      const newUser = await global.newUser();
      const promiseWithReceiver = {
        ...promise,
        id: randomString(),
        receiver: newUser.getPrincipal(),
      };

      // Create and cancel
      let to_store = {
        CustomContract: {
          id: randomString(),
          creator: global.user.getPrincipal(),
          promises: [promiseWithReceiver],
          date_created: Date.now() * 1e6,
        },
      };

      await global.actor.multi_updates([], [], [to_store], [], []);

      const cancelledPromise = {
        ...promiseWithReceiver,
        status: { ConfirmedCancellation: null }
      };
      
      const cancelStore = {
        CustomContract: {
          id: randomString(),
          creator: global.user.getPrincipal(),
          promises: [cancelledPromise],
          date_created: Date.now() * 1e6,
        },
      };

      await global.actor.multi_updates([], [], [cancelStore], [], []);
    }

    // Get karma after cancellations
    const lowKarmaProfile = await global.actor.get_user_profile(global.user.getPrincipal());
    const lowKarma = lowKarmaProfile.Ok.actions_rate;

    // Now create and successfully fulfill promises to recover karma
    const recoveryPromises = [];
    for (let i = 0; i < 3; i++) {
      const newUser = await global.newUser();
      recoveryPromises.push({
        ...promise,
        id: randomString(),
        receiver: newUser.getPrincipal(),
      });
    }

    // Create promises
    const createStore = {
      CustomContract: {
        id: randomString(),
        creator: global.user.getPrincipal(),
        promises: recoveryPromises,
        date_created: Date.now() * 1e6,
      },
    };

    await global.actor.multi_updates([], [], [createStore], [], []);

    // Release promises successfully
    const releasedPromises = recoveryPromises.map(p => ({
      ...p,
      status: { Released: null }
    }));

    const releaseStore = {
      CustomContract: {
        id: randomString(),
        creator: global.user.getPrincipal(),
        promises: releasedPromises,
        date_created: Date.now() * 1e6,
      },
    };

    await global.actor.multi_updates([], [], [releaseStore], [], []);

    // Check karma recovery
    const recoveredProfile = await global.actor.get_user_profile(global.user.getPrincipal());
    expect(recoveredProfile.Ok.actions_rate).toBeGreaterThan(lowKarma);
    
    console.log(`Low karma: ${lowKarma}, Recovered karma: ${recoveredProfile.Ok.actions_rate}`);
  });
});