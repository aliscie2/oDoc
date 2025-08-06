import {
  PocketIc,
  PocketIcServer,
  createIdentity,
  Actor,
  CanisterFixture,
} from "@dfinity/pic";
import { IDL } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";
import { idlFactory, _SERVICE } from "$/declarations/backend/backend.did.js";
import {
  idlFactory as ckusdcIdlFactory,
  init,
  type InitArgs,
  type _SERVICE as CkusdcService,
} from "$/declarations/ckusdc_ledger/ckusdc_ledger.did.js";
import path from "path";

declare global {
  var testPic: PocketIc;
  var testActor: Actor<_SERVICE>;
  var ckusdcActor: Actor<CkusdcService>;
  var backendCanisterId: string;
}

const wasmPath = path.resolve(__dirname, "backend.wasm.gz");
const ckusdcPath = path.resolve(__dirname, "ic-icrc1-ledger.wasm.gz");

beforeAll(async () => {
  const picServer = await PocketIcServer.start({ showCanisterLogs: true });
  globalThis.testPic = await PocketIc.create(picServer.getUrl());

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
    index_principal: [], // Empty array means no index canister
    feature_flags: [{ icrc2: true }],
  };

  const ckusdcFixture: CanisterFixture<CkusdcService> =
    await globalThis.testPic.setupCanister({
      idlFactory: ckusdcIdlFactory,
      wasm: ckusdcPath,
      arg: IDL.encode(init({ IDL }), [{ Init: initArgs }]),
      targetCanisterId: Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai"),
    });

  globalThis.ckusdcActor = ckusdcFixture.actor;

  const fixture: CanisterFixture<_SERVICE> =
    await globalThis.testPic.setupCanister({
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

  globalThis.testActor = fixture.actor;
  globalThis.backendCanisterId = fixture.canisterId.toString();
  console.log("Backend canister ID:", globalThis.backendCanisterId);
}, 60000);

afterAll(async () => {
  if (globalThis.testPic) await globalThis.testPic.tearDown();
});
