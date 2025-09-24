import { ActorSubclass } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { canisterId, idlFactory } from "$/declarations/backend";
import { backend } from "$/declarations/backend";
import { _SERVICE } from "$/declarations/backend/backend.did";
import getLedgerActor from "./ckudc_ledger_actor";
import { IdentityManager } from "./identityManager";
import { ActorFactory } from "./actorFactory";
import { EnvironmentManager } from "./environmentConfig";
import "./identityHealthMonitor"; // Import to start monitoring

// Create a smart backend actor that works with both yarn start and dfx deploy
let smartBackendActor: ActorSubclass<_SERVICE> | null = null;
let smartCkUSDCActor: unknown = null;

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
        actorType: 'backend'
      },
      backend // Fallback to default backend
    );
  }

  static async getCkUSDCActor(): Promise<unknown> {
    const agent = await IdentityManager.createValidatedAgent();
    if (!agent) {
      console.warn("No validated agent available for ckUSDC actor");
      return null;
    }

    try {
      return await getLedgerActor(agent);
    } catch (error) {
      console.warn("Failed to create ckUSDC actor:", error);
      
      // Try recovery if it's a signature error
      if (IdentityManager.isSignatureError(error)) {
        await IdentityManager.forceRefresh();
        const retryAgent = await IdentityManager.createValidatedAgent();
        if (retryAgent) {
          return await getLedgerActor(retryAgent);
        }
      }
      
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
      actorType: 'backend'
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
      if (typeof method === 'function') {
        return async (...args: unknown[]) => {
          try {
            return await method.apply(smartBackendActor, args);
          } catch (error) {
            // If signature error, try to recover and retry
            if (IdentityManager.isSignatureError(error)) {
              console.log("Signature error in backendActor, attempting recovery");
              await initializeSmartActors();
              
              // Retry with fresh actor
              if (smartBackendActor) {
                const retryMethod = smartBackendActor[prop as keyof ActorSubclass<_SERVICE>];
                if (typeof retryMethod === 'function') {
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

export const ckUSDCActor = new Proxy({} as unknown, {
  get(_target, prop) {
    if (smartCkUSDCActor) {
      const method = smartCkUSDCActor[prop as string];
      
      // Wrap methods with error recovery
      if (typeof method === 'function') {
        return async (...args: unknown[]) => {
          try {
            return await method.apply(smartCkUSDCActor, args);
          } catch (error) {
            // If signature error, try to recover and retry
            if (IdentityManager.isSignatureError(error)) {
              console.log("Signature error in ckUSDCActor, attempting recovery");
              await initializeSmartActors();
              
              // Retry with fresh actor
              if (smartCkUSDCActor) {
                const retryMethod = smartCkUSDCActor[prop as string];
                if (typeof retryMethod === 'function') {
                  return await retryMethod.apply(smartCkUSDCActor, args);
                }
              }
            }
            throw error;
          }
        };
      }
      
      return method;
    }
    return undefined;
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
export const getBackendActor = () => BackendUtils.getBackendActor();
export const getCkUSDCActor = () => BackendUtils.getCkUSDCActor();
export const logout = () => BackendUtils.logout();

// Initialize smart actors on module load
initializeSmartActors().catch(console.error);
