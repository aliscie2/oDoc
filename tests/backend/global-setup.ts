import { _SERVICE, idlFactory } from "$/declarations/backend/backend.did.js";
import {
  idlFactory as ckusdcIdlFactory,
  init,
  type _SERVICE as CkusdcService,
  type InitArgs,
} from "$/declarations/ckusdc_ledger/ckusdc_ledger.did.js";
import { IDL } from "@dfinity/candid";
import {
  CanisterFixture,
  PocketIc,
  PocketIcServer,
  createIdentity,
} from "@dfinity/pic";
import { Principal } from "@dfinity/principal";
import path from "path";

const wasmPath = path.resolve(__dirname, "backend.wasm.gz");
const ckusdcPath = path.resolve(__dirname, "ic-icrc1-ledger.wasm.gz");

export async function setup() {
  console.log("Setting up global test environment...");

  const picServer = await PocketIcServer.start({
    showCanisterLogs: true,
    showRuntimeLogs: true,
  });

  const testPic = await PocketIc.create(picServer.getUrl());
  await testPic.resetTime();

  const testIdentity = createIdentity("1");
  const minterIdentity = createIdentity("minter");

  const initArgs: InitArgs = {
    decimals: [6],
    token_symbol: "ckUSDC",
    token_name: "ckUSDC",
    transfer_fee: 10000n,
    metadata: [],
    minting_account: {
      owner: minterIdentity.getPrincipal(),
      subaccount: [],
    },
    initial_balances: [],
    fee_collector_account: [],
    archive_options: {
      num_blocks_to_archive: 1000n,
      max_transactions_per_response: [],
      trigger_threshold: 2000n,
      more_controller_ids: [],
      max_message_size_bytes: [],
      cycles_for_archive_creation: [100000000000000n],
      node_max_memory_size_bytes: [3221225472n],
      controller_id: Principal.fromText("2vxsx-fae"),
    },
    max_memo_length: [80],
    index_principal: [],
    feature_flags: [{ icrc2: true }],
  };

  const ckusdcFixture: CanisterFixture<CkusdcService> =
    await testPic.setupCanister({
      idlFactory: ckusdcIdlFactory,
      wasm: ckusdcPath,
      arg: IDL.encode(init({ IDL }), [{ Init: initArgs }]),
      targetCanisterId: Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai"),
    });

  const fixture: CanisterFixture<_SERVICE> = await testPic.setupCanister({
    idlFactory,
    wasm: wasmPath,
    arg: IDL.encode(
      [],
      [
        {
          ckethLedger: Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai"),
          collector_account: {
            owner: testIdentity.getPrincipal(),
            subaccount: [],
          },
          ckethMinter: Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai"),
        },
      ],
    ),
  });

  // Store in global for access in tests
  (globalThis as any).__testPic = testPic;
  (globalThis as any).__testActor = fixture.actor;
  (globalThis as any).__ckusdcActor = ckusdcFixture.actor;
  (globalThis as any).__backendCanisterId = fixture.canisterId.toString();

  console.log("Global setup complete");
}

export async function teardown() {
  console.log("Tearing down global test environment...");
  if ((globalThis as any).__testPic) {
    await (globalThis as any).__testPic.tearDown();
  }
}
