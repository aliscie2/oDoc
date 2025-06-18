import { PocketIc } from "@hadronous/pic";
import { ActorSubclass } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { IDL } from "@dfinity/candid";
import { randomString } from "../../DataProcessing/dataSamples";
import test, { describe, beforeEach, afterEach, beforeAll, afterAll } from "node:test";
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import { idlFactory } from '../../../declarations/backend';
import { _SERVICE } from "$/declarations/backend/backend.did";

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

// Test suite level variables - initialized once for all tests
let testPic: PocketIc;
let testActor: ActorSubclass;
let testUser: any;
let testNewUser: () => Promise<any>;

describe("Karma/Action Score Tests - Improved", () => {
  beforeAll(async () => {
    // Setup test environment once for the entire test suite
    console.log("Setting up PocketIc for test suite...");
    testPic = await PocketIc.create();
    
    // Create a subnet for the canister
    const subnet = await testPic.createSubnet({
      kind: "Application"
    });
    
    // Install your canister
    const canisterId = await testPic.createCanister();
    
    // Use the correct WASM path from the build output
    const wasmPath = path.join(__dirname, "../../../target/wasm32-unknown-unknown/release/backend.wasm");
    
    // Check if files exist before trying to read them
    if (!fs.existsSync(wasmPath)) {
      throw new Error(`WASM file not found: ${wasmPath}. Please build the project first with 'dfx build'`);
    }
    
    console.log(`Installing canister with WASM from: ${wasmPath}`);
    await testPic.installCode(
      canisterId,
      fs.readFileSync(wasmPath),
    );
    
    // Create actor instance with your canister interface
    testActor = testPic.createActor<_SERVICE>(idlFactory, canisterId);
    
    // Create main test user
    const userIdentity = testPic.generateRandomIdentity();
    testUser = {
      identity: userIdentity,
      getPrincipal: () => userIdentity.getPrincipal()
    };
    
    // Helper function to create new users for testing
    testNewUser = async () => {
      const newIdentity = testPic.createIdentity();
      return {
        identity: newIdentity,  
        getPrincipal: () => newIdentity.getPrincipal()
      };
    };
    
    // Set global variables for backward compatibility
    global.pic = testPic;
    global.actor = testActor;
    global.user = testUser;
    global.newUser = testNewUser;
    
    console.log("Test suite setup complete");
  });

  beforeEach(async () => {
    // Reset test state before each test
    // This is more efficient than recreating PocketIc for each test
    
    // Optional: Initialize user in the system if needed
    try {
      const profile = await testActor.get_user_profile(testUser.getPrincipal());
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
    // Clean up test-specific data if needed
    // No need to tear down PocketIc here
  });

  afterAll(async () => {
    // Clean up once after all tests
    console.log("Tearing down test suite...");
    if (testPic) {
      await testPic.tearDown();
    }
    console.log("Test suite cleanup complete");
  });

  test("Test karma increase after interacting with three users and releasing promises", async () => {
    // Get initial karma score
    const initialProfile = await testActor.get_user_profile(testUser.getPrincipal());
    const initialKarma = initialProfile.Ok?.actions_rate || 0;
    const initialInteractions = initialProfile.Ok?.users_interacted || 0;

    // Create initial promise template
    const promise = {
      id: randomString(),
      amount: 100,
      sender: testUser.getPrincipal(),
      receiver: null,
      status: { None: null },
      date_created: Date.now() * 1e6,
    };

    // Create promises with 3 different users
    const promises = [];
    const newUsers = [];
    
    for (let i = 0; i < 3; i++) {
      const newUser = await testNewUser();
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
        creator: testUser.getPrincipal(),
        promises,
        date_created: Date.now() * 1e6,
      },
    };

    const createRes = await testActor.multi_updates([], [], [to_store], [], []);
    expect("Ok" in createRes).toBeTruthy();

    // Now release the promises to increase karma
    const releasedPromises = promises.map(p => ({
      ...p,
      status: { Released: null }
    }));

    const releaseStore = {
      CustomContract: {
        id: randomString(),
        creator: testUser.getPrincipal(),
        promises: releasedPromises,
        date_created: Date.now() * 1e6,
      },
    };

    const releaseRes = await testActor.multi_updates([], [], [releaseStore], [], []);
    expect("Ok" in releaseRes).toBeTruthy();

    // Check karma score increased
    const finalProfile = await testActor.get_user_profile(testUser.getPrincipal());
    expect(finalProfile.Ok.users_interacted).toEqual(initialInteractions + 3);
    expect(finalProfile.Ok.actions_rate).toBeGreaterThan(initialKarma);
    
    console.log(`Initial karma: ${initialKarma}, Final karma: ${finalProfile.Ok.actions_rate}`);
  });

  test("Test karma increase after interacting with 4-10 users and releasing promises", async () => {
    // Get initial karma score
    const initialProfile = await testActor.get_user_profile(testUser.getPrincipal());
    const initialKarma = initialProfile.Ok?.actions_rate || 0;
    const initialInteractions = initialProfile.Ok?.users_interacted || 0;

    const promise = {
      id: randomString(),
      amount: 100,
      sender: testUser.getPrincipal(),
      receiver: null,
      status: { None: null },
      date_created: Date.now() * 1e6,
    };

    // Create promises with 7 different users (between 4-10)
    const promises = [];
    const newUsers = [];
    
    for (let i = 0; i < 7; i++) {
      const newUser = await testNewUser();
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
        creator: testUser.getPrincipal(),
        promises,
        date_created: Date.now() * 1e6,
      },
    };

    const createRes = await testActor.multi_updates([], [], [to_store], [], []);
    expect("Ok" in createRes).toBeTruthy();

    // Release the promises to increase karma
    const releasedPromises = promises.map(p => ({
      ...p,
      status: { Released: null }
    }));

    const releaseStore = {
      CustomContract: {
        id: randomString(),
        creator: testUser.getPrincipal(),
        promises: releasedPromises,
        date_created: Date.now() * 1e6,
      },
    };

    const releaseRes = await testActor.multi_updates([], [], [releaseStore], [], []);
    expect("Ok" in releaseRes).toBeTruthy();

    // Check karma score increased more significantly for more interactions
    const finalProfile = await testActor.get_user_profile(testUser.getPrincipal());
    expect(finalProfile.Ok.users_interacted).toEqual(initialInteractions + 7);
    expect(finalProfile.Ok.actions_rate).toBeGreaterThan(initialKarma);
    
    console.log(`Initial karma: ${initialKarma}, Final karma: ${finalProfile.Ok.actions_rate}`);
  });

  test("Test promise amount cap after three consecutive cancellations", async () => {
    const promise = {
      id: randomString(),
      amount: 100,
      sender: testUser.getPrincipal(),
      receiver: null,
      status: { None: null },
      date_created: Date.now() * 1e6,
    };

    // Create and cancel three promises consecutively
    for (let i = 0; i < 3; i++) {
      const newUser = await testNewUser();
      const promiseWithReceiver = {
        ...promise,
        id: randomString(),
        receiver: newUser.getPrincipal(),
      };

      // Create promise
      let to_store = {
        CustomContract: {
          id: randomString(),
          creator: testUser.getPrincipal(),
          promises: [promiseWithReceiver],
          date_created: Date.now() * 1e6,
        },
      };

      const createRes = await testActor.multi_updates([], [], [to_store], [], []);
      expect("Ok" in createRes).toBeTruthy();

      // Cancel promise
      const cancelledPromise = {
        ...promiseWithReceiver,
        status: { ConfirmedCancellation: null }
      };
      
      const cancelStore = {
        CustomContract: {
          id: randomString(),
          creator: testUser.getPrincipal(),
          promises: [cancelledPromise],
          date_created: Date.now() * 1e6,
        },
      };

      const cancelRes = await testActor.multi_updates([], [], [cancelStore], [], []);
      expect("Ok" in cancelRes).toBeTruthy();
    }

    // Try to create a promise with amount > $50 (should fail due to cap)
    const newUser = await testNewUser();
    const largePromise = {
      ...promise,
      id: randomString(),
      amount: 100, // > $50 cap
      receiver: newUser.getPrincipal(),
    };

    const to_store = {
      CustomContract: {
        id: randomString(),
        creator: testUser.getPrincipal(),
        promises: [largePromise],
        date_created: Date.now() * 1e6,
      },
    };

    const res = await testActor.multi_updates([], [], [to_store], [], []);
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
        creator: testUser.getPrincipal(),
        promises: [smallPromise],
        date_created: Date.now() * 1e6,
      },
    };

    const smallRes = await testActor.multi_updates([], [], [smallStore], [], []);
    expect("Ok" in smallRes).toBeTruthy();
  });

  test("Test staking mark and 30-day promise lock after three cancellations", async () => {
    const promise = {
      id: randomString(),
      amount: 100,
      sender: testUser.getPrincipal(),
      receiver: null,
      status: { None: null },
      date_created: Date.now() * 1e6,
    };

    // Create and cancel three promises
    for (let i = 0; i < 3; i++) {
      const newUser = await testNewUser();
      const promiseWithReceiver = {
        ...promise,
        id: randomString(),
        receiver: newUser.getPrincipal(),
      };

      // Create promise
      let to_store = {
        CustomContract: {
          id: randomString(),
          creator: testUser.getPrincipal(),
          promises: [promiseWithReceiver],
          date_created: Date.now() * 1e6,
        },
      };

      await testActor.multi_updates([], [], [to_store], [], []);

      // Cancel promise
      const cancelledPromise = {
        ...promiseWithReceiver,
        status: { ConfirmedCancellation: null }
      };
      
      const cancelStore = {
        CustomContract: {
          id: randomString(),
          creator: testUser.getPrincipal(),
          promises: [cancelledPromise],
          date_created: Date.now() * 1e6,
        },
      };

      await testActor.multi_updates([], [], [cancelStore], [], []);
    }

    // Check if user is marked for staking (low karma score)
    const profile_history = await testActor.get_user_profile(testUser.getPrincipal());
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
    const newUser = await testNewUser();
    const stakedPromise = {
      ...promise,
      id: randomString(),
      receiver: newUser.getPrincipal(),
    };

    const stakedStore = {
      CustomContract: {
        id: randomString(),
        creator: testUser.getPrincipal(),
        promises: [stakedPromise],
        date_created: Date.now() * 1e6,
      },
    };

    const stakedRes = await testActor.multi_updates([], [], [stakedStore], [], []);
    expect("Err" in stakedRes).toBeTruthy(); // Should fail during staking period
  });

  test("Mock bus down scenario and test withdraw failure", async () => {
    // Create a promise first
    const promise = {
      id: randomString(),
      amount: 100,
      sender: testUser.getPrincipal(),
      receiver: null,
      status: { None: null },
      date_created: Date.now() * 1e6,
    };

    const newUser = await testNewUser();
    const promiseWithReceiver = {
      ...promise,
      id: randomString(),
      receiver: newUser.getPrincipal(),
    };

    // Create the promise
    let to_store = {
      CustomContract: {
        id: randomString(),
        creator: testUser.getPrincipal(),
        promises: [promiseWithReceiver],
        date_created: Date.now() * 1e6,
      },
    };

    const createRes = await testActor.multi_updates([], [], [to_store], [], []);
    expect("Ok" in createRes).toBeTruthy();

    // Mock bus down by advancing time significantly (31 days)
    // This simulates a network outage/bus down scenario
    const thirtyOneDaysInNs = 31 * 24 * 60 * 60 * 1e9;
    testPic.setTime(Date.now() * 1e6 + thirtyOneDaysInNs);

    // Try to withdraw/release the promise after bus down period
    const withdrawPromise = {
      ...promiseWithReceiver,
      status: { Released: null },
    };

    const withdrawStore = {
      CustomContract: {
        id: randomString(),
        creator: testUser.getPrincipal(),
        promises: [withdrawPromise],
        date_created: Date.now() * 1e6,
      },
    };

    // This should fail due to bus down timeout
    const withdrawRes = await testActor.multi_updates([], [], [withdrawStore], [], []);
    expect("Err" in withdrawRes).toBeTruthy();
    
    // Verify the error is related to bus down/timeout
    if ("Err" in withdrawRes) {
      const errorMessage = withdrawRes.Err;
      expect(errorMessage).toMatch(/bus.*down|timeout|network.*failure/i);
    }

    // Test that immediate withdrawal (before bus down) would work
    // Reset time back to normal
    testPic.setTime(Date.now() * 1e6);
    
    // Create another promise for immediate test
    const immediatePromise = {
      ...promise,
      id: randomString(),
      receiver: newUser.getPrincipal(),
    };

    const immediateStore = {
      CustomContract: {
        id: randomString(),
        creator: testUser.getPrincipal(),
        promises: [immediatePromise],
        date_created: Date.now() * 1e6,
      },
    };

    await testActor.multi_updates([], [], [immediateStore], [], []);

    // Immediate withdrawal should work
    const immediateWithdraw = {
      ...immediatePromise,
      status: { Released: null },
    };

    const immediateWithdrawStore = {
      CustomContract: {
        id: randomString(),
        creator: testUser.getPrincipal(),
        promises: [immediateWithdraw],
        date_created: Date.now() * 1e6,
      },
    };

    const immediateRes = await testActor.multi_updates([], [], [immediateWithdrawStore], [], []);
    expect("Ok" in immediateRes).toBeTruthy();
  });

  test("Test karma recovery after successful promise fulfillment", async () => {
    // First, get user into low karma state through cancellations
    const promise = {
      id: randomString(),
      amount: 50,
      sender: testUser.getPrincipal(),
      receiver: null,
      status: { None: null },
      date_created: Date.now() * 1e6,
    };

    // Cancel 2 promises to lower karma but not trigger full penalty
    for (let i = 0; i < 2; i++) {
      const newUser = await testNewUser();
      const promiseWithReceiver = {
        ...promise,
        id: randomString(),
        receiver: newUser.getPrincipal(),
      };

      // Create and cancel
      let to_store = {
        CustomContract: {
          id: randomString(),
          creator: testUser.getPrincipal(),
          promises: [promiseWithReceiver],
          date_created: Date.now() * 1e6,
        },
      };

      await testActor.multi_updates([], [], [to_store], [], []);

      const cancelledPromise = {
        ...promiseWithReceiver,
        status: { ConfirmedCancellation: null }
      };
      
      const cancelStore = {
        CustomContract: {
          id: randomString(),
          creator: testUser.getPrincipal(),
          promises: [cancelledPromise],
          date_created: Date.now() * 1e6,
        },
      };

      await testActor.multi_updates([], [], [cancelStore], [], []);
    }

    // Get karma after cancellations
    const lowKarmaProfile = await testActor.get_user_profile(testUser.getPrincipal());
    const lowKarma = lowKarmaProfile.Ok.actions_rate;

    // Now create and successfully fulfill promises to recover karma
    const recoveryPromises = [];
    for (let i = 0; i < 3; i++) {
      const newUser = await testNewUser();
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
        creator: testUser.getPrincipal(),
        promises: recoveryPromises,
        date_created: Date.now() * 1e6,
      },
    };

    await testActor.multi_updates([], [], [createStore], [], []);

    // Release promises successfully
    const releasedPromises = recoveryPromises.map(p => ({
      ...p,
      status: { Released: null }
    }));

    const releaseStore = {
      CustomContract: {
        id: randomString(),
        creator: testUser.getPrincipal(),
        promises: releasedPromises,
        date_created: Date.now() * 1e6,
      },
    };

    await testActor.multi_updates([], [], [releaseStore], [], []);

    // Check karma recovery
    const recoveredProfile = await testActor.get_user_profile(testUser.getPrincipal());
    expect(recoveredProfile.Ok.actions_rate).toBeGreaterThan(lowKarma);
    
    console.log(`Low karma: ${lowKarma}, Recovered karma: ${recoveredProfile.Ok.actions_rate}`);
  });
}); 