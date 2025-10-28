import { Principal } from "@dfinity/principal";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as CkUSDT_SERVICE } from "$/declarations/ckusdt_ledger/ckusdt_ledger.did";

const getckUsdtBalance = async (
  ckUSDTActor: ActorSubclass<CkUSDT_SERVICE> | null,
  userPrincipal: string
) => {
  try {
    // Check if actor is available
    if (!ckUSDTActor) {
      console.error("ckUSDTActor is not available");
      return 0n;
    }

    const balanceResult = await ckUSDTActor.icrc1_balance_of({
      owner: Principal.fromText(userPrincipal),
      subaccount: [],
    });

    return balanceResult;
  } catch (error) {
    console.error("Error getting ckUSDT balance for principal:", userPrincipal, error);
    return 0n;
  }
};

export default getckUsdtBalance;
