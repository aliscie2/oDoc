import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthClient } from "@dfinity/auth-client";
import {
  Actor,
  ActorMethod,
  ActorSubclass,
  HttpAgent,
  Identity,
} from "@dfinity/agent";
import { canisterId, idlFactory } from "../../declarations/backend";
import { _SERVICE } from "../../declarations/backend/backend.did";
import { useDispatch, useSelector } from "react-redux";
import getLedgerActor from "./ckudc_ledger_actor";

interface State {
  principal: string | null;
  identity: Identity | null;
  backendActor: ActorSubclass<
    Record<string, ActorMethod<unknown[], unknown>>
  > | null;
  agent: HttpAgent | null;
  isAuthenticating?: boolean;
  ckUSDCActor?: any;
  loginMethod?: "internet-identity" | "ethereum";
}

interface BackendContextProps extends State {
  authClient: AuthClient | null;
  login: () => Promise<void>;
  loginWithEth: () => Promise<void>;
  logout: () => void;
}

const BackendContext = createContext<BackendContextProps | undefined>(
  undefined,
);

export const useBackendContext = (): BackendContextProps => {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error("useBackendContext must be used within a BackendProvider");
  }
  return context;
};

const createAuthClient = async (): Promise<AuthClient> => {
  return await AuthClient.create({
    idleOptions: {
      disableIdle: true,
      disableDefaultIdleCallback: true,
    },
  });
};

const createHttpAgent = async (
  identity: Identity,
  host: string,
): Promise<HttpAgent> => {
  const agent = new HttpAgent({
    identity, //TODO  if siwe is conncted use siweIdentity
    host,
  });

  if (import.meta.env.VITE_DFX_NETWORK === "local") {
    await agent
      .fetchRootKey()
      .then(() => console.log("Successfully fetched root key"))
      .catch((err) => console.log("Error fetching root key: ", err));
  }

  return agent;
};

const createBackendActor = (
  agent: HttpAgent,
): ActorSubclass<Record<string, ActorMethod<unknown[], unknown>>> => {
  return Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId,
  });
};

const getIdentityProvider = (port: string): string => {
  if (import.meta.env.VITE_DFX_NETWORK === "local") {
    return `http://${import.meta.env.VITE_INTERNET_IDENTITY}.localhost:${port}`;
  }
  return "https://identity.ic0.app/#authorize";
};

const getHost = (): string => {
  return import.meta.env.VITE_DFX_NETWORK === "local"
    ? import.meta.env.VITE_IC_HOST
    : "https://ic0.app";
};

async function handleAgent(client: AuthClient) {
  const host = getHost();

  let principal: string;

  let identity = await client.getIdentity();
  principal = identity.getPrincipal().toString();

  const agent = await createHttpAgent(identity, host);
  const actor = createBackendActor(agent);

  return { actor, agent, principal, identity, client };
}

interface BackendProviderProps {
  children: ReactNode;
}

export const BackendProvider: React.FC<BackendProviderProps> = ({
  children,
}) => {
  const dispatch = useDispatch();

  const port = import.meta.env.VITE_DFX_PORT;

  const [state, setState] = useState<State>({
    principal: null,
    identity: null,
    backendActor: null,
    agent: null,
  });

  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const { isLoggedIn } = useSelector((state: any) => state.uiState);

  const login = async () => {
    if (!authClient) {
      console.log("Auth client not initialized");
      return;
    }

    const alreadyAuthenticated = await authClient.isAuthenticated();

    if (alreadyAuthenticated) {
      // dispatch({type:'LOGIN'});
    } else {
      const identityProvider = getIdentityProvider(port);
      setState((prevState) => ({ ...prevState, isAuthenticating: true }));

      await authClient.login({
        // maxTimeToLive: BigInt(3 * 24 * 60 * 60 * 1000000000),
        identityProvider,
        onSuccess: async () => {
          dispatch({ type: "LOGIN" });
        },
      });
    }
  };

  const loginWithEth = async () => {
    try {
      setState((prevState) => ({ ...prevState, isAuthenticating: true }));

      const { actor, agent, principal } = await handleAgent(authClient!);

      setState((prevState) => ({
        ...prevState,
        backendActor: actor,
        agent,
        principal,
        loginMethod: "ethereum",
        isAuthenticating: false,
      }));

      dispatch({ type: "LOGIN" });
    } catch (error) {
      setState((prevState) => ({ ...prevState, isAuthenticating: false }));
      console.error("Ethereum login error:", error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    dispatch({ type: "LOGOUT" });
    authClient?.logout({ returnTo: "/" });
    setState({
      principal: null,
      identity: null,
      backendActor: null,
      agent: null,
      loginMethod: undefined,
    });
  }, [dispatch, authClient, state.loginMethod]);

  useEffect(() => {
    const initializeAuthClient = async () => {
      const client = await createAuthClient();
      setAuthClient(client);
      const { actor, agent, principal, identity } = await handleAgent(client);
      const ckUSDCActor = await getLedgerActor(agent);
      console.log("ckUSDCActor:");
      setState((prevState) => ({
        ...prevState,
        ckUSDCActor,
        backendActor: actor,
        agent,
        principal,
        identity,
        // loginMethod: siweIdentity ? 'ethereum' : undefined
      }));

      const alreadyAuthenticated = await client.isAuthenticated();
      if (alreadyAuthenticated) {
        dispatch({ type: "LOGIN" });
      }
    };

    initializeAuthClient().catch((error) => {
      console.log("Failed to initialize auth client:", error);
    });
  }, [isLoggedIn]);

  const contextValue = {
    ...state,
    authClient,
    login,
    loginWithEth,
    logout,
  };

  return (
    <BackendContext.Provider value={contextValue}>
      {children}
    </BackendContext.Provider>
  );
};

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, callback: (...args: any[]) => void) => void;
    };
  }
}
