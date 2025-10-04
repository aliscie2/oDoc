import { ActorSubclass, HttpAgent, Actor } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { canisterId, idlFactory } from "$/declarations/backend";
import { backend } from "$/declarations/backend";
import { _SERVICE } from "$/declarations/backend/backend.did";
import getLedgerActor from "./ckudc_ledger_actor";
import { IdentityManager } from "./identityManager";
import { ActorFactory } from "./actorFactory";
import { EnvironmentManager } from "./environmentConfig";
import {
  canisterId as ckUSDCCanisterId,
  idlFactory as ckUSDCIdlFactory,
} from "$/declarations/ckusdc_ledger";
import { _SERVICE as CkUSDC_SERVICE } from "$/declarations/ckusdc_ledger/ckusdc_ledger.did";
import "./identityHealthMonitor"; // Import to start monitoring

// Create a smart backend actor that works with both yarn start and dfx deploy
let smartBackendActor: ActorSubclass<_SERVICE> | null = null;
let smartCkUSDCActor: ActorSubclass<CkUSDC_SERVICE> | null = null;

// Enhanced backend utilities with identity lifecycle management
export class BackendUtils {
  static async getAuthClient(): Promise<AuthClient> {
    return IdentityManager.getAuthClient();
  }

  static async getBackendActor(): Promise<ActorSubclass<_SERVICE>> {
    return ActorFactory.getActorWithFallback<_SERVICE>(
      {
        canisterId,
        idlFactory,
        actorType: "backend",
      },
      backend, // Fallback to default backend
    );
  }

  static async getCkUSDCActor(): Promise<ActorSubclass<CkUSDC_SERVICE> | null> {
    // Try to get authenticated agent first
    const agent = await IdentityManager.createValidatedAgent();
    
    if (agent) {
      try {
        return await getLedgerActor(agent);
      } catch (error) {
        console.warn("Failed to create authenticated ckUSDC actor:", error);

        // Try recovery if it's a signature error
        if (IdentityManager.isSignatureError(error)) {
          await IdentityManager.forceRefresh();
          const retryAgent = await IdentityManager.createValidatedAgent();
          if (retryAgent) {
            return await getLedgerActor(retryAgent);
          }
        }
      }
    }

    // Fall back to anonymous actor for read-only operations
    try {
      const config = EnvironmentManager.getConfig();
      const anonymousAgent = new HttpAgent({ host: config.host });

      if (!config.isProduction) {
        await anonymousAgent.fetchRootKey();
      }

      return Actor.createActor<CkUSDC_SERVICE>(ckUSDCIdlFactory, {
        agent: anonymousAgent,
        canisterId: ckUSDCCanisterId,
      });
    } catch (error) {
      console.error("Failed to create anonymous ckUSDC actor:", error);
      return null;
    }
  }

  static async logout(): Promise<void> {
    try {
      const client = await this.getAuthClient();

      // Clear actor factory cache
      ActorFactory.clearCache();

      // Force identity refresh (clears all caches)
      await IdentityManager.forceRefresh();

      // Logout from auth client
      await client.logout({ returnTo: "/" });
    } catch (error) {
      console.error("Logout error:", error);
      // Force clear everything even if logout fails
      await IdentityManager.forceRefresh();
      ActorFactory.clearCache();
    }
  }
}

// Initialize smart actors with enhanced identity management
export const initializeSmartActors = async (): Promise<void> => {
  try {
    // Use the new actor factory for backend actor
    const actor = await ActorFactory.getActor<_SERVICE>({
      canisterId,
      idlFactory,
      actorType: "backend",
    });

    if (actor) {
      smartBackendActor = actor;
    } else {
      smartBackendActor = backend; // Fallback
    }

    // Initialize ckUSDC actor
    const ckUSDCActor = await BackendUtils.getCkUSDCActor();
    if (ckUSDCActor) {
      smartCkUSDCActor = ckUSDCActor;
    }
  } catch (error) {
    console.error("Smart actor initialization failed:", error);
    smartBackendActor = backend; // Always ensure fallback
  }
};

// Enhanced proxy with automatic recovery
export const backendActor = new Proxy({} as ActorSubclass<_SERVICE>, {
  get(_target, prop) {
    if (smartBackendActor) {
      const method = smartBackendActor[prop as keyof ActorSubclass<_SERVICE>];

      // Wrap methods with error recovery
      if (typeof method === "function") {
        return async (...args: unknown[]) => {
          try {
            return await method.apply(smartBackendActor, args);
          } catch (error) {
            // If signature error, try to recover and retry
            if (IdentityManager.isSignatureError(error)) {
              console.log(
                "Signature error in backendActor, attempting recovery",
              );
              await initializeSmartActors();

              // Retry with fresh actor
              if (smartBackendActor) {
                const retryMethod =
                  smartBackendActor[prop as keyof ActorSubclass<_SERVICE>];
                if (typeof retryMethod === "function") {
                  return await retryMethod.apply(smartBackendActor, args);
                }
              }
            }
            throw error;
          }
        };
      }

      return method;
    }
    return backend[prop as keyof ActorSubclass<_SERVICE>];
  },
});

export const ckUSDCActor = new Proxy({} as ActorSubclass<CkUSDC_SERVICE>, {
  get(_target, prop) {
    // Lazy initialization - create actor on first access if not available
    if (!smartCkUSDCActor) {
      // Return a promise that initializes and calls the method
      return async (...args: unknown[]) => {
        await initializeSmartActors();
        if (smartCkUSDCActor) {
          const method = smartCkUSDCActor[prop as keyof ActorSubclass<CkUSDC_SERVICE>];
          if (typeof method === "function") {
            return await (method as (...args: unknown[]) => Promise<unknown>).apply(smartCkUSDCActor, args);
          }
        }
        throw new Error(`ckUSDC actor not available for method: ${String(prop)}`);
      };
    }

    const method = smartCkUSDCActor[prop as keyof ActorSubclass<CkUSDC_SERVICE>];

    // Wrap methods with error recovery
    if (typeof method === "function") {
      return async (...args: unknown[]) => {
        try {
          return await (method as (...args: unknown[]) => Promise<unknown>).apply(smartCkUSDCActor, args);
        } catch (error) {
          // If signature error, try to recover and retry
          if (IdentityManager.isSignatureError(error)) {
            console.log(
              "Signature error in ckUSDCActor, attempting recovery",
            );
            await initializeSmartActors();

            // Retry with fresh actor
            if (smartCkUSDCActor) {
              const retryMethod = smartCkUSDCActor[prop as keyof ActorSubclass<CkUSDC_SERVICE>];
              if (typeof retryMethod === "function") {
                return await (retryMethod as (...args: unknown[]) => Promise<unknown>).apply(smartCkUSDCActor, args);
              }
            }
          }
          throw error;
        }
      };
    }

    return method;
  },
});

// Enhanced login with identity validation
export const login = async (): Promise<boolean> => {
  try {
    // Clear any stale cache first
    await IdentityManager.forceRefresh();

    const client = await BackendUtils.getAuthClient();

    // Check if already authenticated with valid identity
    const validIdentity = await IdentityManager.getValidatedIdentity();
    if (validIdentity) {
      await initializeSmartActors();
      return true;
    }

    return new Promise((resolve, reject) => {
      const config = EnvironmentManager.getConfig();

      client.login({
        maxTimeToLive: BigInt(365 * 24 * 60 * 60 * 1000000000),
        identityProvider: config.identityProvider,
        derivationOrigin: config.derivationOrigin,
        onSuccess: async () => {
          try {
            // Validate the new identity
            const newIdentity = await IdentityManager.getValidatedIdentity();
            if (!newIdentity) {
              throw new Error("Login succeeded but identity validation failed");
            }

            await initializeSmartActors();
            resolve(true);
          } catch (error) {
            console.error("Error validating identity after login:", error);
            reject(error);
          }
        },
        onError: (error) => {
          console.error("Login error:", error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error("Login initialization failed:", error);
    return false;
  }
};

// Convenience functions for direct use
export const getBackendActor = (): Promise<ActorSubclass<_SERVICE>> => BackendUtils.getBackendActor();
export const getCkUSDCActor = (): Promise<ActorSubclass<CkUSDC_SERVICE> | null> => BackendUtils.getCkUSDCActor();
export const logout = (): Promise<void> => BackendUtils.logout();

// Initialize smart actors on module load
initializeSmartActors().catch(console.error);
