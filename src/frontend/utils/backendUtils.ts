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
import { createCastedActor } from "./castingActor";

// Actor state management with retry tracking
interface ActorState {
  backend: ActorSubclass<_SERVICE> | null;
  ckUSDC: ActorSubclass<CkUSDC_SERVICE> | null;
  isInitializing: boolean;
  initializationPromise: Promise<void> | null;
  retryCount: number;
  lastError: Error | null;
}

const actorState: ActorState = {
  backend: null,
  ckUSDC: null,
  isInitializing: false,
  initializationPromise: null,
  retryCount: 0,
  lastError: null,
};

// Configuration constants
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
const MAX_TTL_DAYS = 365;

// Login options interface
export interface LoginOptions {
  maxTimeToLive?: bigint;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  autoReload?: boolean; // Optional auto-reload flag
}

/**
 * Clear browser storage to fix signature errors
 * This is the recommended fix for stale identity issues
 */
const clearBrowserStorage = async (): Promise<void> => {
  try {
    // Clear localStorage
    localStorage.clear();

    // Clear IndexedDB (where auth-client stores delegations)
    if (window.indexedDB) {
      const databases = await window.indexedDB.databases();
      for (const db of databases) {
        if (db.name) {
          window.indexedDB.deleteDatabase(db.name);
        }
      }
    }

    console.log("Browser storage cleared successfully");
  } catch (error) {
    console.error("Error clearing browser storage:", error);
  }
};

/**
 * Delay utility for retry logic
 */
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Enhanced backend utilities with identity lifecycle management
 */
export class BackendUtils {
  /**
   * Get or create authenticated AuthClient
   */
  static async getAuthClient(): Promise<AuthClient> {
    return IdentityManager.getAuthClient();
  }

  /**
   * Get backend actor with automatic fallback
   */
  static async getBackendActor(): Promise<ActorSubclass<_SERVICE>> {
    try {
      return await ActorFactory.getActorWithFallback<_SERVICE>(
        {
          canisterId,
          idlFactory,
          actorType: "backend",
        },
        backend,
      );
    } catch (error) {
      console.error("Failed to get backend actor:", error);
      return backend; // Fallback to default
    }
  }

  /**
   * Get ckUSDC actor with authenticated agent or anonymous fallback
   * Returns null if all attempts fail
   */
  static async getCkUSDCActor(): Promise<ActorSubclass<CkUSDC_SERVICE> | null> {
    // First, try authenticated actor (best option)
    try {
      const agent = await IdentityManager.createValidatedAgent();
      if (agent) {
        const authenticatedActor =
          await BackendUtils.createAuthenticatedCkUSDCActor(agent);
        if (authenticatedActor) {
          return authenticatedActor;
        }
      }
    } catch (error) {
      console.warn("Failed to create authenticated ckUSDC actor:", error);
      // Continue to anonymous fallback
    }

    // Fallback to anonymous actor for read-only operations
    try {
      return await BackendUtils.createAnonymousCkUSDCActor();
    } catch (error) {
      console.error("All attempts to create ckUSDC actor failed:", error);
      return null;
    }
  }

  /**
   * Create authenticated ckUSDC actor with error recovery
   */
  private static async createAuthenticatedCkUSDCActor(
    agent: HttpAgent,
  ): Promise<ActorSubclass<CkUSDC_SERVICE>> {
    try {
      return await getLedgerActor(agent);
    } catch (error) {
      // Attempt recovery on signature errors
      if (IdentityManager.isSignatureError(error)) {
        console.log("Signature error detected, attempting recovery...");
        await IdentityManager.forceRefresh();

        const retryAgent = await IdentityManager.createValidatedAgent();
        if (retryAgent) {
          return await getLedgerActor(retryAgent);
        }
      }
      throw error;
    }
  }

  /**
   * Create anonymous ckUSDC actor for read-only operations
   */
  private static async createAnonymousCkUSDCActor(): Promise<ActorSubclass<CkUSDC_SERVICE> | null> {
    try {
      const config = EnvironmentManager.getConfig();

      // Validate host configuration
      if (!config.host) {
        console.error("No host configured for anonymous actor");
        return null;
      }

      // Create fetch options with timeout support
      const fetchOptions: RequestInit = {};

      // Add timeout if AbortSignal.timeout is available (newer browsers)
      if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
        try {
          fetchOptions.signal = AbortSignal.timeout(10000); // 10 second timeout
        } catch (e) {
          console.warn("AbortSignal.timeout not supported, skipping timeout");
        }
      }

      const anonymousAgent = new HttpAgent({
        host: config.host,
        fetchOptions,
      });

      // Fetch root key only in non-production environments with retry
      if (!config.isProduction) {
        await BackendUtils.fetchRootKeyWithRetry(anonymousAgent);
      }

      return Actor.createActor<CkUSDC_SERVICE>(ckUSDCIdlFactory, {
        agent: anonymousAgent,
        canisterId: ckUSDCCanisterId,
      });
    } catch (error) {
      // Provide more detailed error logging
      if (error instanceof TypeError && error.message.includes("Load failed")) {
        console.error(
          "Network error creating anonymous ckUSDC actor - possible causes:",
          "\n- Network connectivity issues",
          "\n- Incorrect host URL:",
          EnvironmentManager.getConfig().host,
          "\n- Local replica not running (if in dev mode)",
          "\n- CORS configuration issues",
          "\nTry running: checkNetworkConnectivity()",
          "\nError:",
          error,
        );
      } else {
        console.error("Failed to create anonymous ckUSDC actor:", error);
      }
      return null;
    }
  }

  /**
   * Fetch root key with retry logic for local development
   */
  private static async fetchRootKeyWithRetry(
    agent: HttpAgent,
    maxRetries = 3,
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await agent.fetchRootKey();
        return; // Success
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries - 1) {
          // Wait before retry with exponential backoff
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.warn(
            `fetchRootKey failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${waitTime}ms...`,
            error,
          );
          await delay(waitTime);
        }
      }
    }

    throw new Error(
      `Failed to fetch root key after ${maxRetries} attempts: ${lastError?.message}`,
    );
  }

  /**
   * Clear all cached actors and identities
   */
  static async clearAllCaches(): Promise<void> {
    actorState.backend = null;
    actorState.ckUSDC = null;
    actorState.retryCount = 0;
    actorState.lastError = null;
    ActorFactory.clearCache();
    await IdentityManager.forceRefresh();
  }

  /**
   * Deep clean - clear everything including browser storage
   * Use this when experiencing persistent signature errors
   */
  static async deepClean(): Promise<void> {
    await BackendUtils.clearAllCaches();
    await clearBrowserStorage();
  }

  /**
   * Logout user and clear all sessions
   */
  static async logout(): Promise<void> {
    try {
      const client = await this.getAuthClient();
      await BackendUtils.clearAllCaches();
      await client.logout({ returnTo: "/" });
    } catch (error) {
      console.error("Logout error:", error);
      // Force clear everything even if logout fails
      await BackendUtils.clearAllCaches();
      throw error;
    }
  }
}

/**
 * Initialize or reinitialize smart actors with retry logic
 * Ensures only one initialization happens at a time
 */
export const initializeSmartActors = async (
  forceRetry = false,
): Promise<void> => {
  // If already initializing, wait for that to complete
  if (actorState.isInitializing && actorState.initializationPromise) {
    return actorState.initializationPromise;
  }

  // Check retry limit
  if (!forceRetry && actorState.retryCount >= MAX_RETRY_ATTEMPTS) {
    console.error(
      `Max retry attempts (${MAX_RETRY_ATTEMPTS}) reached. Last error:`,
      actorState.lastError,
    );
    throw new Error(
      `Actor initialization failed after ${MAX_RETRY_ATTEMPTS} attempts`,
    );
  }

  actorState.isInitializing = true;
  actorState.initializationPromise = (async () => {
    try {
      // Add exponential backoff delay for retries
      if (actorState.retryCount > 0) {
        const delayTime =
          RETRY_DELAY_MS * Math.pow(2, actorState.retryCount - 1);
        console.log(`Retrying initialization after ${delayTime}ms...`);
        await delay(delayTime);
      }

      // Initialize backend actor
      // In initializeSmartActors function, after creating backend actor:
      const backendActorInstance = await ActorFactory.getActor<_SERVICE>({
        canisterId,
        idlFactory,
        actorType: "backend",
      });
      actorState.backend = backendActorInstance ? createCastedActor(backendActorInstance) : createCastedActor(backend);

      // Initialize ckUSDC actor
      const ckUSDCActorInstance = await BackendUtils.getCkUSDCActor();
      actorState.ckUSDC = ckUSDCActorInstance;

      // Reset retry count on success
      actorState.retryCount = 0;
      actorState.lastError = null;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error("Smart actor initialization failed:", err);

      actorState.lastError = err;
      actorState.retryCount++;
      actorState.backend = backend; // Ensure fallback

      // If it's a signature error and we haven't hit max retries, try deep clean
      if (
        IdentityManager.isSignatureError(error) &&
        actorState.retryCount < MAX_RETRY_ATTEMPTS
      ) {
        console.log("Signature error detected, attempting deep clean...");
        await BackendUtils.deepClean();
      }

      throw err;
    } finally {
      actorState.isInitializing = false;
      actorState.initializationPromise = null;
    }
  })();

  return actorState.initializationPromise;
};

/**
 * Create a method wrapper with automatic error recovery
 */
function createRecoverableMethod<T extends ActorSubclass<any>>(
  getActor: () => T | null,
  actorName: string,
  reinitialize: () => Promise<void>,
  prop: keyof T,
): (...args: any[]) => Promise<any> {
  return async (...args: any[]) => {
    const actor = getActor();
    if (!actor) {
      throw new Error(
        `${actorName} actor not available for method: ${String(prop)}`,
      );
    }

    const method = actor[prop];
    if (typeof method !== "function") {
      throw new Error(
        `Property ${String(prop)} on ${actorName} is not a function`,
      );
    }

    try {
      return await method.apply(actor, args);
    } catch (error) {
      // Attempt recovery on signature errors
      if (IdentityManager.isSignatureError(error)) {
        console.log(
          `Signature error in ${actorName}.${String(prop)}, attempting recovery`,
        );

        try {
          await reinitialize();

          // Retry with fresh actor
          const retryActor = getActor();
          if (retryActor) {
            const retryMethod = retryActor[prop];
            if (typeof retryMethod === "function") {
              return await retryMethod.apply(retryActor, args);
            }
          }
        } catch (recoveryError) {
          console.error("Recovery failed:", recoveryError);
          // If recovery fails completely, suggest deep clean to user
          throw new Error(
            `${actorName} operation failed. Please try logging out and logging back in. Original error: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
      throw error;
    }
  };
}

/**
 * Enhanced proxy for backend actor with automatic recovery
 */
export const backendActor = new Proxy({} as ActorSubclass<_SERVICE>, {
  get(_target, prop: keyof ActorSubclass<_SERVICE>) {
    const actor = actorState.backend;

    if (!actor) {
      // If not initialized, return backend fallback
      return backend[prop];
    }

    const value = actor[prop];

    // Wrap functions with error recovery
    if (typeof value === "function") {
      return createRecoverableMethod(
        () => actorState.backend,
        "backend",
        initializeSmartActors,
        prop,
      );
    }

    return value;
  },
});

/**
 * Enhanced proxy for ckUSDC actor with lazy initialization and recovery
 */
export const ckUSDCActor = new Proxy({} as ActorSubclass<CkUSDC_SERVICE>, {
  get(_target, prop: keyof ActorSubclass<CkUSDC_SERVICE>) {
    // Lazy initialization on first access
    if (!actorState.ckUSDC && !actorState.isInitializing) {
      return async (...args: any[]) => {
        await initializeSmartActors();
        return createRecoverableMethod(
          () => actorState.ckUSDC,
          "ckUSDC",
          initializeSmartActors,
          prop,
        )(...args);
      };
    }

    const actor = actorState.ckUSDC;
    if (!actor) {
      throw new Error(
        `ckUSDC actor not available for property: ${String(prop)}`,
      );
    }

    const value = actor[prop];

    // Wrap functions with error recovery
    if (typeof value === "function") {
      return createRecoverableMethod(
        () => actorState.ckUSDC,
        "ckUSDC",
        initializeSmartActors,
        prop,
      );
    }

    return value;
  },
});

/**
 * Enhanced login with identity validation
 */
export const login = async (options: LoginOptions = {}): Promise<boolean> => {
  try {
    // Get client and config synchronously to avoid delays
    const client = await BackendUtils.getAuthClient();
    const config = EnvironmentManager.getConfig();

    // Quick check if already authenticated (no validation to avoid delay)
    const isAuthenticated = await client.isAuthenticated();
    if (isAuthenticated) {
      await initializeSmartActors();
      options.onSuccess?.();
      if (options.autoReload) {
        window.location.reload();
      }
      return true;
    }

    // CRITICAL: Call client.login() immediately - no async delays before this!
    // Safari on mobile blocks popups if there's any async delay from user tap
    client.login({
      maxTimeToLive:
        options.maxTimeToLive ??
        BigInt(MAX_TTL_DAYS * 24 * 60 * 60 * 1000000000),
      identityProvider: config.identityProvider,
      derivationOrigin: config.derivationOrigin,
      onSuccess: async () => {
        try {
          // After login succeeds, reinitialize actors with new identity
          await initializeSmartActors();
          options.onSuccess?.();

          // Only reload if explicitly requested
          if (options.autoReload) {
            window.location.reload();
          }
          window.location.reload();
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          console.error("Error after login:", err);
          options.onError?.(err);
        }
      },
      onError: (error) => {
        console.error("Login error:", error);
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        options.onError?.(errorObj);
      },
    });

    return true;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Login initialization failed:", err);
    options.onError?.(err);
    return false;
  }
};

/**
 * Convenience function to get backend actor
 */
export const getBackendActor = (): Promise<ActorSubclass<_SERVICE>> =>
  BackendUtils.getBackendActor();

/**
 * Convenience function to get ckUSDC actor
 */
export const getCkUSDCActor =
  (): Promise<ActorSubclass<CkUSDC_SERVICE> | null> =>
    BackendUtils.getCkUSDCActor();

/**
 * Convenience function to logout
 */
export const logout = (): Promise<void> => BackendUtils.logout();

/**
 * Check if actors are initialized
 */
export const isInitialized = (): boolean => actorState.backend !== null;

/**
 * Check network connectivity to IC host
 */
export const checkNetworkConnectivity = async (): Promise<{
  isConnected: boolean;
  host: string;
  error?: string;
}> => {
  const config = EnvironmentManager.getConfig();
  const host = config.host;

  try {
    // Simple connectivity test
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${host}/api/v2/status`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return {
      isConnected: response.ok || response.status === 404, // 404 is ok, means host is reachable
      host,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      isConnected: false,
      host,
      error: errorMessage,
    };
  }
};

/**
 * Get current initialization state
 */
export const getInitializationState = () => ({
  isInitializing: actorState.isInitializing,
  hasBackend: actorState.backend !== null,
  hasCkUSDC: actorState.ckUSDC !== null,
  retryCount: actorState.retryCount,
  lastError: actorState.lastError?.message ?? null,
});

/**
 * Force reset actors (useful for debugging or after deep errors)
 */
export const resetActors = async (): Promise<void> => {
  await BackendUtils.deepClean();
  await initializeSmartActors(true);
};

// Initialize smart actors on module load
// Note: Errors are logged but don't throw to prevent module load failures
initializeSmartActors().catch((error) => {
  console.error("Initial actor initialization failed:", error);
  console.log(
    "Actors will fall back to defaults. Use resetActors() to retry initialization.",
  );
});

// Start identity health monitoring if available
try {
  require("./identityHealthMonitor");
} catch (error) {
  console.warn("Identity health monitor not available:", error);
}
