import { Principal } from "@dfinity/principal";
import { IcrcWallet } from "@dfinity/oisy-wallet-signer/icrc-wallet";
import { canisterId as ckusdcId } from "$/declarations/ckusdc_ledger";

export async function depositWithOisy(amount: number, user: Principal) {
  try {
    const IS_LOCAL = import.meta.env.VITE_DFX_NETWORK !== "ic";
    const url = IS_LOCAL
      ? "http://localhost:5174/sign"
      : "https://oisy.com/sign";
    const host = IS_LOCAL ? import.meta.env.VITE_IC_HOST : "https://ic0.app";

    const walletInstance = await IcrcWallet.connect({
      url,
      host,
      onDisconnect: () => {},
    });

    const { allPermissionsGranted } =
      await walletInstance.requestPermissionsNotGranted();
    if (!allPermissionsGranted) throw new Error("All permissions required");

    const accounts = await walletInstance.accounts();
    const userAccount = accounts?.[0];
    if (!userAccount) throw new Error("No account provided by wallet");

    const transferAmount = BigInt(amount * 1000000); // 6 decimals for CKUSDC

    // Use direct transfer (like the Svelte example)
    const result = await walletInstance.transfer({
      owner: userAccount.owner,
      params: {
        to: {
          owner: user,
          subaccount: [], // Explicitly type as empty array
        },
        amount: transferAmount,
      },
      ledgerCanisterId: ckusdcId,
    });

    return result;
  } catch (error) {
    error?.errorType?.InsufficientFunds &&
      alert("Yuur oisy wallet balance is insufficient.");
    throw error;
  }
}

// export async function withdrawWithOisy(amount: number, user: Principal) {
//  try {
//    const IS_LOCAL = import.meta.env.VITE_DFX_NETWORK !== "ic";
//    const url = IS_LOCAL ? "http://localhost:5174/sign" : "https://oisy.com/sign";
//    const host = IS_LOCAL ? import.meta.env.VITE_IC_HOST : "https://ic0.app";

//    const walletInstance = await IcrcWallet.connect({
//      url,
//      host,
//      onDisconnect: () => console.log("Wallet disconnected"),
//    });

//    const { allPermissionsGranted } = await walletInstance.requestPermissionsNotGranted();
//    if (!allPermissionsGranted) throw new Error("All permissions required");

//    const accounts = await walletInstance.accounts();
//    const userAccount = accounts?.[0];
//    if (!userAccount) throw new Error("No account provided by wallet");

//    const transferAmount = BigInt(amount * 1000000);

//    const result = await walletInstance.transfer({
//      owner: user.toString(),
//      params: {
//        to: {
//          owner: Principal.fromText(userAccount.owner),
//          subaccount: [],
//        },
//        amount: transferAmount,
//      },
//      ledgerCanisterId: ckusdcId,
//    });

//    console.log("Withdrawal result:", result);
//    return result;
//  } catch (error) {
//    error?.errorType?.InsufficientFunds &&
//      alert("Insufficient funds for withdrawal.");
//    console.log("Withdrawal error:", error?.errorType?.InsufficientFunds);
//    throw error;
//  }
// }
