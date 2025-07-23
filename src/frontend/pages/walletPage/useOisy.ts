import { useState, useCallback } from "react";
import { Principal } from "@dfinity/principal";
// import {IcpWallet} from '@dfinity/oisy-wallet-signer/icp-wallet';

export const useOisyWallet = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");

  const url =
    import.meta.env.VITE_DFX_NETWORK === "ic"
      ? "https://oisy.com/sign"
      : "https://staging.oisy.com/sign";

  const host =
    import.meta.env.VITE_DFX_NETWORK === "local"
      ? import.meta.env.VITE_IC_HOST
      : "https://ic0.app";

  const connect = async () => {
    try {
      setIsLoading(true);
      setError("");
      // const wallet = await IcpWallet.connect({
      //   url: 'https://staging.oisy.com/sign'
      // });

      // const walletInstance = await IcrcWallet.connect({
      //   url,
      //   host,
      //   onDisconnect: () => {
      //     setIsConnected(false);
      //     setAccount(null);
      //     setWallet(null);
      //   },
      // });

      // const { allPermissionsGranted } =
      //   await walletInstance.requestPermissionsNotGranted();

      // if (!allPermissionsGranted) {
      //   throw new Error("All permissions are required to continue");
      // }

      // const accounts = await walletInstance.accounts();
      // const userAccount = accounts?.[0] || null;

      // if (!userAccount) {
      //   throw new Error("The wallet did not provide any account");
      // }

      // setWallet(walletInstance);
      // setAccount(userAccount);
      setIsConnected(true);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMsg);
      await disconnect();
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = useCallback(async () => {
    try {
      if (wallet) {
        await wallet.disconnect();
      }
    } catch (err) {
      console.error("Error disconnecting wallet:", err);
    } finally {
      setWallet(null);
      setIsConnected(false);
      setAccount(null);
    }
  }, [wallet]);

  const approveTransaction = useCallback(
    async (amount: number, spender: string) => {
      if (!wallet || !account) {
        throw new Error("Wallet not connected");
      }

      try {
        setIsLoading(true);
        setError("");

        const owner = Principal.fromText(account.owner);
        const spenderPrincipal = Principal.fromText(spender);

        const result = await wallet.icrc2Approve({
          owner,
          request: {
            spender: {
              owner: spenderPrincipal,
              subaccount: [],
            },
            amount: BigInt(amount),
          },
          ledgerCanisterId: import.meta.env.VITE_CANISTER_ID_CKUSDC_LEDGER,
        });

        console.log({ result });
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Approval failed";
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, account],
  );

  const deposit = useCallback(
    async (amount: number, reciever: Principal) => {
      if (!wallet || !account) {
        throw new Error("Wallet not connected");
      }

      try {
        setIsLoading(true);
        setError("");

        const result = await wallet.transferFrom({
          ledgerCanisterId: import.meta.env.VITE_CANISTER_ID_CKUSDC_LEDGER,
          owner: account.owner,
          params: {
            from: {
              owner: Principal.fromText(account.owner),
              subaccount: [],
            },
            to: {
              // owner: Principal.fromText(
              //   import.meta.env.VITE_BACKEND_CANISTER_ID,
              // ),
              owner: reciever,
              subaccount: [],
            },
            amount: BigInt(amount),
          },
        });

        console.log({ result });
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Deposit failed";
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, account],
  );

  return {
    wallet,
    isConnected,
    isLoading,
    account,
    error,
    connect,
    disconnect,
    approveTransaction,
    deposit,
  };
};
