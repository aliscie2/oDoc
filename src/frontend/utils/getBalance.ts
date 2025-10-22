import { Principal } from "@dfinity/principal";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as CkUSDC_SERVICE } from "$/declarations/ckusdc_ledger/ckusdc_ledger.did";

const getckUsdcBalance = async (ckUSDCActor: ActorSubclass<CkUSDC_SERVICE> | null, userPrincipal: string) => {
  try {
    // Check if actor is available
    if (!ckUSDCActor) {
      console.error("ckUSDCActor is not available");
      return 0n;
    }

    const balanceResult = await ckUSDCActor.icrc1_balance_of({
      owner: Principal.fromText(userPrincipal),
      subaccount: [],
    });
    console.log("Balance query successful:", {balanceResult, userPrincipal});

    return balanceResult;
  } catch (error) {
    console.error("Error getting balance for principal:", userPrincipal, error);
    return 0n;
  }
};

export default getckUsdcBalance;
