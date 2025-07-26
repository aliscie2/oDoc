import { Principal } from "@dfinity/principal";
// import {IcpWallet} from '@dfinity/oisy-wallet-signer/icp-wallet';
import { IcrcWallet } from "@dfinity/oisy-wallet-signer/icrc-wallet";

export async function depositWithOisy(amount: number, user: Principal) {
  const url =
    import.meta.env.VITE_DFX_NETWORK === "ic"
      ? "https://oisy.com/sign"
      : "https://staging.oisy.com/sign";

  const host =
    import.meta.env.VITE_DFX_NETWORK === "local"
      ? import.meta.env.VITE_IC_HOST // http://localhost:4943
      : "https://ic0.app";

  console.log({
    url,
    host,
    network: import.meta.env.VITE_DFX_NETWORK,
    ledger: import.meta.env.VITE_CANISTER_ID_CKUSDC_LEDGER,
    user,
  });
  const walletInstance = await IcrcWallet.connect({
    url,
    host,
    onDisconnect: () => {
      console.log("disocneted");
    },
  });

  const { allPermissionsGranted } =
    await walletInstance.requestPermissionsNotGranted();

  if (!allPermissionsGranted) {
    throw new Error("All permissions are required to continue");
  }

  const accounts = await walletInstance.accounts();
  const userAccount = accounts?.[0] || null;

  if (!userAccount) {
    throw new Error("The wallet did not provide any account");
  }

  // const res = await walletInstance.approve({
  //   owner: userAccount.owner,
  //   params: {
  //     spender: {
  //       owner: Principal.fromText(userAccount.owner),
  //       subaccount: [],
  //     },
  //     amount: BigInt(amount*10000000000),
  //   },
  //   ledgerCanisterId:  import.meta.env.VITE_CANISTER_ID_CKUSDC_LEDGER,
  // });
  // console.log({res})

  const result = await walletInstance.transferFrom({
    ledgerCanisterId: import.meta.env.VITE_CANISTER_ID_CKUSDC_LEDGER,
    owner: userAccount.owner,
    params: {
      from: {
        owner: Principal.fromText(userAccount.owner),
        subaccount: [],
      },
      to: {
        owner: user,
        subaccount: [],
      },
      amount: BigInt(amount * 1000000),
    },
  });
  console.log({ result });
}
