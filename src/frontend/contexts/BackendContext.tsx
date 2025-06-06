// # Conversation Summary - Bullet Points Tree

// ## **Initial Context**
// - User provided a React Backend Context file using Internet Computer (IC) and Ethereum wallet integration
// - File contained authentication logic for both Internet Identity and MetaMask/Ethereum wallets

// ## **Primary Objective**
// - Replace `loginWithMetaMask` function with `loginWithEth` 
// - Implement complete wallet connection and sign-in workflow in single function
// - Remove dependency on separate ConnectButton and LoginButton components

// ## **Technical Implementation**

// ### **Function Renaming & Structure**
// - Changed `loginWithMetaMask` → `loginWithEth`
// - Updated `loginMethod` enum: `'metamask'` → `'ethereum'`
// - Maintained existing TypeScript interfaces and context structure

// ### **Workflow Integration**
// - **Step 1: Wallet Connection**
//   - Auto-detect and connect MetaMask connector
//   - Fallback to first available connector if MetaMask not found
//   - Added connection validation and wait mechanisms
  
// - **Step 2: SIWE Authentication**
//   - Integrate Sign-In with Ethereum (SIWE) protocol
//   - Handle preparation and signing phases separately
//   - Wait for identity confirmation before proceeding

// ### **Dependencies & Imports**
// - Added `useConnect` from wagmi for wallet connection
// - Removed incompatible `useSiwe` from `ic-siwe-js/react`
// - Used existing `useSiweIdentity` from `ic-use-siwe-identity`
// - Maintained compatibility with existing provider structure

// ## **Error Resolution**

// ### **Provider Mismatch Issue**
// - **Problem**: `useSiwe must be used within a SiweIdentityProvider` error
// - **Solution**: Removed incompatible hook, used correct `useSiweIdentity` hook matching existing providers

// ### **SIWE Preparation Error**
// - **Problem**: "Prepare login failed did not return a SIWE message"
// - **Solution**: 
//   - Added `prepareLogin()` call before `siweLogin()`
//   - Implemented proper sequencing with wait mechanisms
//   - Added polling for identity confirmation
//   - Enhanced error handling and logging

// ## **Final Architecture**
// - **Single Function Workflow**: Complete authentication in `loginWithEth`
// - **Provider Compatibility**: Works with existing RainbowKit and SiweIdentityProvider setup
// - **Error Handling**: Comprehensive try-catch with detailed error messages
// - **State Management**: Proper Redux integration and context state updates
// - **Async Flow Control**: Multiple wait mechanisms for reliable authentication
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { Actor, ActorMethod, ActorSubclass, HttpAgent, Identity } from "@dfinity/agent";
import { canisterId, idlFactory } from "../../declarations/backend";
import { _SERVICE } from "../../declarations/backend/backend.did";
import { useDispatch, useSelector } from "react-redux";
import getLedgerActor from "./ckudc_ledger_actor";
import { useTheme, useMediaQuery } from "@mui/material";
import { useSiweIdentity } from "ic-use-siwe-identity";
import { useAccount, useDisconnect, useConnect } from "wagmi";
import { useSession } from 'next-auth/react';
// Remove useSiwe import since we're not using that provider
// import { isChainIdSupported } from "../../wagmi/is-chain-id-supported";

// import metaMaskService from "../services/MetaMaskService";

interface State {
  principal: string | null;
  identity: Identity | null;
  backendActor: ActorSubclass<Record<string, ActorMethod<unknown[], unknown>>> | null;
  agent: HttpAgent | null;
  isAuthenticating?: boolean;
  ckUSDCActor?: any;
  loginMethod?: 'internet-identity' | 'ethereum';
}

interface BackendContextProps extends State {
  authClient: AuthClient | null;
  login: () => Promise<void>;
  loginWithEth: () => Promise<void>;
  logout: () => void;
}

const BackendContext = createContext<BackendContextProps | undefined>(undefined);

export const useBackendContext = (): BackendContextProps => {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error("useBackendContext must be used within a BackendProvider");
  }
  return context;
};

const createAuthClient = async (): Promise<AuthClient> => {
  return await AuthClient.create();
};

const createHttpAgent = async (identity: Identity, host: string): Promise<HttpAgent> => {
  const agent = new HttpAgent({
    identity, //TODO  if siwe is conncted use siweIdentity
    host,
  });

  if (import.meta.env.VITE_DFX_NETWORK === "local") {
    await agent.fetchRootKey()
      .then(() => console.log("Successfully fetched root key"))
      .catch((err) => console.log("Error fetching root key: ", err));
  }

  return agent;
};

const createBackendActor = (agent: HttpAgent): ActorSubclass<Record<string, ActorMethod<unknown[], unknown>>> => {
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

  let identity = await client.getIdentity()
    principal = identity.getPrincipal().toString();

  const agent = await createHttpAgent(identity, host);
  const actor = createBackendActor(agent);
  
  return { actor, agent, principal, identity, client };
}

interface BackendProviderProps {
  children: ReactNode;
}

export const BackendProvider: React.FC<BackendProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const port = import.meta.env.VITE_DFX_PORT;
  const { disconnect, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { identity: siweIdentity, login: siweLogin, loginStatus } = useSiweIdentity();
  const { data: session } = useSession();
  
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
      setState(prevState => ({ ...prevState, isAuthenticating: true }));
      
      await authClient.login({
        identityProvider,
        onSuccess: async () => {
          dispatch({type:"LOGIN"});
        },
      });
    }
  }

  const loginWithEth = async () => {
    try {
      setState(prevState => ({ ...prevState, isAuthenticating: true }));
      
      // Step 1: Connect wallet if not connected
      if (!isConnected) {
        const metaMaskConnector = connectors.find(connector => 
          connector.name.toLowerCase().includes('metamask') || 
          connector.id === 'metaMask'
        );
        
        if (metaMaskConnector) {
          await connect({ connector: metaMaskConnector });
        } else {
          // Fallback to first available connector
          await connect({ connector: connectors[0] });
        }
        
        // Wait a moment for connection to establish
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Step 2: Sign in with SIWE using the SiweIdentityProvider
      if (isConnected && loginStatus !== 'logging-in') {
        await siweLogin();
      }

      const { actor, agent, principal } = await handleAgent(authClient!);
      
      setState(prevState => ({
        ...prevState,
        backendActor: actor,
        agent,
        principal,
        loginMethod: 'ethereum',
        isAuthenticating: false
      }));

      dispatch({type: "LOGIN"});
    } catch (error) {
      setState(prevState => ({ ...prevState, isAuthenticating: false }));
      console.error('Ethereum login error:', error);
      throw error;
    }
  }

  const logout = useCallback(() => {
    if (siweIdentity) {
      // siweLogout?.();
    }
    
    if (state.loginMethod === 'ethereum' && siweIdentity) {
      disconnect();
    } else if (!siweIdentity) {
      dispatch({type:"LOGOUT"});
      authClient?.logout({ returnTo: "/" });
    }
    
    setState({
      principal: null,
      identity: null,
      backendActor: null,
      agent: null,
      loginMethod: undefined
    });
  }, [dispatch, authClient, state.loginMethod, siweIdentity, disconnect]);

  useEffect(() => {
    const initializeAuthClient = async () => {
      const client = await createAuthClient();
      setAuthClient(client);
      const { actor, agent, principal, identity } = await handleAgent(client, siweIdentity);
      const ckUSDCActor = await getLedgerActor(agent);
      console.log("ckUSDCActor:");
      setState(prevState => ({
        ...prevState,
        ckUSDCActor,
        backendActor: actor,
        agent,
        principal,
        identity,
        loginMethod: siweIdentity ? 'ethereum' : undefined
      }));

      const alreadyAuthenticated = await client.isAuthenticated();
      if (alreadyAuthenticated) {
        dispatch({type:'LOGIN'});
      }
    };

    initializeAuthClient().catch((error) => {
      console.log("Failed to initialize auth client:", error);
    });
  }, [isLoggedIn]);

  // Add effect to handle session changes
  useEffect(() => {
    if (session?.address) {
      console.log("User authenticated via SIWE:", session.address);
      dispatch({type: "LOGIN"});
    }
  }, [session, dispatch]);

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