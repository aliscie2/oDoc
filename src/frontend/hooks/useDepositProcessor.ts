import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
import { Principal } from "@dfinity/principal";
import { backendActor, ckUSDCActor, ckUSDTActor } from "@/utils/backendUtils";
import getckUsdcBalance from "@/utils/getBalance";
import getckUsdtBalance from "@/utils/getckUsdtBalance";
import { canisterId } from "../../declarations/backend";

/**
 * Hook for processing ckUSDC and ckUSDT deposits
 *
 * Checks both ckUSDC and ckUSDT balances and processes them separately.
 */
export const useDepositProcessor = (profileId?: string) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [isProcessing, setIsProcessing] = useState(false);

  const processckUSDCDeposit = useCallback(
    async (userBalance: bigint) => {
      if (!ckUSDCActor) return;

      try {
        const notificationKey = enqueueSnackbar(
          `Processing deposit of ${Number(userBalance) / 1_000_000} ckUSDC...`,
          {
            variant: "info",
            persist: true,
          },
        );

        await ckUSDCActor.icrc2_approve({
          from_subaccount: [],
          spender: { owner: Principal.fromText(canisterId), subaccount: [] },
          amount: userBalance,
          expected_allowance: [],
          expires_at: [],
          fee: [],
          memo: [],
          created_at_time: [],
        });

        const depositResult = await backendActor.deposit_ckusdc();
        closeSnackbar(notificationKey);

        if ("Ok" in depositResult) {
          dispatch({ type: "SET_WALLET", wallet: depositResult.Ok });
          enqueueSnackbar(
            `Successfully deposited ${Number(userBalance) / 1_000_000} ckUSDC`,
            { variant: "success" },
          );
        } else {
          enqueueSnackbar(
            `ckUSDC deposit failed: ${JSON.stringify(depositResult)}`,
            {
              variant: "error",
            },
          );
        }
      } catch (error) {
        enqueueSnackbar(`ckUSDC deposit error: ${error}`, { variant: "error" });
      }
    },
    [enqueueSnackbar, closeSnackbar, dispatch],
  );

  const processckUSDTDeposit = useCallback(
    async (userBalance: bigint) => {
      if (!ckUSDTActor) return;

      // Backend now supports ckUSDT via deposit_ckusdt()!
      try {
        const notificationKey = enqueueSnackbar(
          `Processing deposit of ${Number(userBalance) / 1_000_000} ckUSDT...`,
          {
            variant: "info",
            persist: true,
          },
        );

        await ckUSDTActor.icrc2_approve({
          from_subaccount: [],
          spender: { owner: Principal.fromText(canisterId), subaccount: [] },
          amount: userBalance,
          expected_allowance: [],
          expires_at: [],
          fee: [],
          memo: [],
          created_at_time: [],
        });

        // Use the new backend method for ckUSDT
        const depositResult = await backendActor.deposit_ckusdt();
        closeSnackbar(notificationKey);

        if ("Ok" in depositResult) {
          dispatch({ type: "SET_WALLET", wallet: depositResult.Ok });
          enqueueSnackbar(
            `Successfully deposited ${Number(userBalance) / 1_000_000} ckUSDT`,
            { variant: "success" },
          );
        } else {
          enqueueSnackbar(
            `ckUSDT deposit failed: ${JSON.stringify(depositResult)}`,
            {
              variant: "error",
            },
          );
        }
      } catch (error) {
        enqueueSnackbar(`ckUSDT deposit error: ${error}`, { variant: "error" });
      }
    },
    [enqueueSnackbar, closeSnackbar, dispatch],
  );

  const processDeposit = useCallback(async () => {
    if (!profileId) {
      return;
    }

    setIsProcessing(true);

    try {
      // Check both ckUSDC and ckUSDT balances
      const [ckusdcBalance, ckusdtBalance] = await Promise.all([
        ckUSDCActor
          ? getckUsdcBalance(ckUSDCActor, profileId)
          : Promise.resolve(0n),
        ckUSDTActor
          ? getckUsdtBalance(ckUSDTActor, profileId)
          : Promise.resolve(0n),
      ]);

      const hasckUSDC =
        Number(ckusdcBalance) > 0 && Number(ckusdcBalance) / 1_000_000 >= 1;
      const hasckUSDT =
        Number(ckusdtBalance) > 0 && Number(ckusdtBalance) / 1_000_000 >= 1;

      if (!hasckUSDC && !hasckUSDT) {
        if (Number(ckusdcBalance) > 0 || Number(ckusdtBalance) > 0) {
          enqueueSnackbar("You need at least 1 ckUSDC or 1 ckUSDT to deposit", {
            variant: "error",
          });
        }
        setIsProcessing(false);
        return;
      }

      // Process ckUSDC deposit if available
      if (hasckUSDC) {
        await processckUSDCDeposit(ckusdcBalance);
      }

      // Process ckUSDT deposit if available
      if (hasckUSDT) {
        await processckUSDTDeposit(ckusdtBalance);
      }
    } catch (error) {
      enqueueSnackbar(`Deposit error: ${error}`, { variant: "error" });
    } finally {
      setIsProcessing(false);
    }
  }, [profileId, enqueueSnackbar, processckUSDCDeposit, processckUSDTDeposit]);

  return { processDeposit, isProcessing };
};
