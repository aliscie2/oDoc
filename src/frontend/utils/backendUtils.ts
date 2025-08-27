import { ActorSubclass, HttpAgent, Identity, Actor } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { canisterId, idlFactory } from "../../declarations/backend";
import { backend } from "../../declarations/backend";
import { _SERVICE } from "../../declarations/backend/backend.did";
import getLedgerActor from "./ckudc_ledger_actor";

// Create a smart backend actor that works with both yarn start and dfx deploy
let smartBackendActor: ActorSubclass<_SERVICE> | null = null;
let smartCkUSDCActor: any = null;

// Simple backend utilities without context dependency
export class BackendUtils {
  private static authClient: AuthClient | null = null;
  private static backendActor: ActorSubclass<_SERVICE> | null = null;
  private static ckUSDCActor: any = null;

  static async getAuthClient(): Promise<AuthClient> {
    if (!this.authClient) {
      this.authClient = await AuthClient.create({
        idleOptions: {
          disableIdle: true,
          disableDefaultIdleCallback: true,
          idleTimeout: 30 * 24 * 60 * 60 * 1000,
        },
      });
    }
    return this.authClient;
  }

  static async getBackendActor(): Promise<ActorSubclass<_SERVICE>> {
    // Try to get authenticated actor first
    try {
      const client = await this.getAuthClient();
      const isAuthenticated = await client.isAuthenticated();
      
      if (isAuthenticated) {
        const identity = client.getIdentity();
        const host = this.getHost();
        const agent = await this.createHttpAgent(identity, host);
        
        this.backendActor = Actor.createActor<_SERVICE>(idlFactory, {
          agent,
          canisterId,
        });
        
        return this.backendActor;
      }
    } catch (error) {
      console.warn("Failed to create authenticated actor, falling back to default:", error);
    }

    // Fallback to default backend (works with yarn start)
    return backend;
  }

  static async getCkUSDCActor(): Promise<any> {
    if (!this.ckUSDCActor) {
      try {
        const client = await this.getAuthClient();
        const isAuthenticated = await client.isAuthenticated();
        
        if (isAuthenticated) {
          const identity = client.getIdentity();
          const host = this.getHost();
          const agent = await this.createHttpAgent(identity, host);
          this.ckUSDCActor = await getLedgerActor(agent);
        }
      } catch (error) {
        console.warn("Failed to create ckUSDC actor:", error);
      }
    }
    return this.ckUSDCActor;
  }

  static async logout(): Promise<void> {
    try {
      const client = await this.getAuthClient();
      
      // Clear all auth-related storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear IndexedDB auth storage
      if (typeof window !== "undefined" && window.indexedDB) {
        try {
          indexedDB.deleteDatabase("authClientDB");
        } catch (e) {
          console.warn("Could not clear IndexedDB:", e);
        }
      }
      
      await client.logout({ returnTo: "/" });
      
      // Reset cached actors
      this.authClient = null;
      this.backendActor = null;
      this.ckUSDCActor = null;
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  private static getHost(): string {
    return import.meta.env.VITE_DFX_NETWORK !== "ic"
      ? import.meta.env.VITE_IC_HOST
      : "https://ic0.app";
  }

  private static async createHttpAgent(identity: Identity, host: string): Promise<HttpAgent> {
    const agent = new HttpAgent({ identity, host });

    if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
      await agent
        .fetchRootKey()
        .then(() => console.log("Successfully fetched root key"))
        .catch((err) => console.log("Error fetching root key: ", err));
    }

    return agent;
  }
}

// Track initialization state to prevent multiple simultaneous initializations
let isInitializing = false;
let initializationPromise: Promise<void> | null = null;

// Initialize smart actors on module load
export const initializeSmartActors = async (): Promise<void> => {
  // If already initializing, wait for that to complete
  if (isInitializing && initializationPromise) {
    return initializationPromise;
  }

  // If already initialized with authenticated actor, skip
  if (smartBackendActor && smartBackendActor !== backend) {
    return Promise.resolve();
  }

  isInitializing = true;
  
  initializationPromise = (async () => {
    try {
      const client = await AuthClient.create({
        idleOptions: {
          disableIdle: true,
          disableDefaultIdleCallback: true,
          idleTimeout: 30 * 24 * 60 * 60 * 1000,
        },
      });

      const isAuthenticated = await client.isAuthenticated();
      
      if (isAuthenticated) {
        const identity = client.getIdentity();
        
        const host = import.meta.env.VITE_DFX_NETWORK !== "ic"
          ? import.meta.env.VITE_IC_HOST
          : "https://ic0.app";
        
        const agent = new HttpAgent({ identity, host });
        
        if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
          await agent.fetchRootKey().catch(() => {});
        }
        
        smartBackendActor = Actor.createActor<_SERVICE>(idlFactory, {
          agent,
          canisterId,
        });
        
        smartCkUSDCActor = await getLedgerActor(agent);
      }
    } catch (error) {
      console.error("Smart actor initialization failed:", error);
    }
    
    // Always fallback to default backend if smart actor creation fails
    if (!smartBackendActor) {
      smartBackendActor = backend;
    }
  })();

  try {
    await initializationPromise;
  } finally {
    isInitializing = false;
    initializationPromise = null;
  }
};

// Initialize on module load
initializeSmartActors();

// Direct exports - no async needed!
export const backendActor = new Proxy({} as ActorSubclass<_SERVICE>, {
  get(target, prop) {
    if (smartBackendActor) {
      return smartBackendActor[prop as keyof ActorSubclass<_SERVICE>];
    }
    return backend[prop as keyof ActorSubclass<_SERVICE>];
  }
});

export const ckUSDCActor = new Proxy({} as any, {
  get(target, prop) {
    if (smartCkUSDCActor) {
      return smartCkUSDCActor[prop];
    }
    return undefined;
  }
});

// Login functionality
export const login = async (): Promise<boolean> => {
  const client = await BackendUtils.getAuthClient();
  const alreadyAuthenticated = await client.isAuthenticated();

  if (alreadyAuthenticated) {
    await initializeSmartActors();
    return true;
  }

  return new Promise((resolve, reject) => {
    const port = import.meta.env.VITE_DFX_PORT;
    const identityProvider = import.meta.env.VITE_DFX_NETWORK !== "ic"
      ? `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:${port}`
      : "https://identity.ic0.app/#authorize";

    client.login({
      maxTimeToLive: BigInt(365 * 24 * 60 * 60 * 1000000000), // 1 year in nanoseconds
      identityProvider,
      onSuccess: async () => {
        try {
          await initializeSmartActors();
          resolve(true);
        } catch (error) {
          console.error("Error reinitializing actors after login:", error);
          reject(error);
        }
      },
      onError: (error) => {
        console.error("Login error:", error);
        reject(error);
      },
    });
  });
};

// Convenience functions for direct use
export const getBackendActor = () => BackendUtils.getBackendActor();
export const getCkUSDCActor = () => BackendUtils.getCkUSDCActor();
export const logout = () => BackendUtils.logout();