/**
 * Utility function to get ckUSDC balance for a user
 */

interface BalanceRequest {
  owner: {
    owner: string;
    subaccount: [];
  };
}

interface CkUSDCActor {
  icrc1_balance_of: (request: BalanceRequest) => Promise<bigint>;
}

export default async function getckUsdcBalance(
  ckUSDCActor: CkUSDCActor,
  userId: string,
): Promise<string> {
  try {
    if (!ckUSDCActor || !userId) {
      return "0";
    }

    // Call the balance method on the ckUSDC actor
    const balance = await ckUSDCActor.icrc1_balance_of({
      owner: { owner: userId, subaccount: [] },
    });

    return balance.toString();
  } catch (error) {
    console.error("Failed to get ckUSDC balance:", error);
    return "0";
  }
}
