import { Identity, HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { EnvironmentManager } from "./environmentConfig";

interface ReplicaFingerprint {
  network: string;
  host: string;
  timestamp: number;
  version: string;
}

interface CachedIdentity {
  fingerprint: ReplicaFingerprint;
  timestamp: number;
  isValid: boolean;
}

export class IdentityManager {
  private static authClient: AuthClient | null = null;
  private static currentFingerprint: ReplicaFingerprint | null = null;
  private static readonly CACHE_KEY = "identity_cache";
  private static readonly MAX_IDENTITY_AGE = 24 * 60 * 60 * 1000; // 24 hours
  private static rootKeyFetched: boolean = false;
  private static rootKeyPromise: Promise<void> | null = null;

  /**
   * Generate a unique fingerprint for the current replica instance
   */
  private static getReplicaFingerprint(): ReplicaFingerprint {
    const config = EnvironmentManager.getConfig();

    return {
      network: config.network,
      host: config.host,
      timestamp: Date.now(),
      version: config.cacheKey,
    };
  }

  /**
   * Check if the current environment matches cached fingerprint
   */
  private static isEnvironmentStale(): boolean {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return true;

      const cachedData: CachedIdentity = JSON.parse(cached);
      const current = this.getReplicaFingerprint();

      // Check if environment changed
      if (
        cachedData.fingerprint.network !== current.network ||
        cachedData.fingerprint.host !== current.host ||
        cachedData.fingerprint.version !== current.version
      ) {
        return true;
      }

      // Check if cache is too old
      const age = Date.now() - cachedData.timestamp;
      return age > this.MAX_IDENTITY_AGE;
    } catch {
      return true;
    }
  }

  /**
   * Clear stale cache when environment changes
   */
  private static async clearStaleCache(): Promise<void> {
    if (this.isEnvironmentStale()) {
      // Clear localStorage
      localStorage.removeItem(this.CACHE_KEY);
      localStorage.removeItem("ic-identity");
      localStorage.removeItem("ic-delegation");

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear IndexedDB auth databases
      if (typeof window !== "undefined" && window.indexedDB) {
        const dbsToDelete = ["authClientDB", "dfinity-studio", "ic-keyval"];

        for (const dbName of dbsToDelete) {
          try {
            await new Promise<void>((resolve, reject) => {
              const deleteReq = indexedDB.deleteDatabase(dbName);
              deleteReq.onsuccess = () => resolve();
              deleteReq.onerror = () => reject(deleteReq.error);
              deleteReq.onblocked = () => {
                console.warn(`Database ${dbName} deletion blocked`);
                resolve(); // Continue anyway
              };
            });
          } catch (error) {
            console.warn(`Could not clear IndexedDB ${dbName}:`, error);
          }
        }
      }

      // Reset cached client
      this.authClient = null;
    }
  }

  /**
   * Validate if an identity is still valid for the current replica
   */
  private static async validateIdentity(identity: Identity): Promise<boolean> {
    try {
      // Check if identity is expired
      const principal = identity.getPrincipal();
      if (principal.isAnonymous()) {
        return false;
      }

      // Test signature with a lightweight call
      const agent = await this.createHttpAgent(identity);

      // Try to get the replica status - this will fail if signature is invalid
      await agent.status();

      return true;
    } catch (error) {
      console.warn("Identity validation failed:", error);
      return false;
    }
  }

  /**
   * Get or create AuthClient with proper cache management
   */
  static async getAuthClient(): Promise<AuthClient> {
    // Clear stale cache first
    await this.clearStaleCache();

    if (!this.authClient) {
      this.authClient = await AuthClient.create({
        idleOptions: {
          disableIdle: true,
          disableDefaultIdleCallback: true,
          idleTimeout: 30 * 24 * 60 * 60 * 1000,
        },
      });

      // Update cache fingerprint
      this.currentFingerprint = this.getReplicaFingerprint();
      localStorage.setItem(
        this.CACHE_KEY,
        JSON.stringify({
          fingerprint: this.currentFingerprint,
          timestamp: Date.now(),
          isValid: true,
        } as CachedIdentity),
      );
    }

    return this.authClient;
  }

  /**
   * Get validated identity or null if invalid
   */
  static async getValidatedIdentity(): Promise<Identity | null> {
    try {
      const client = await this.getAuthClient();
      const isAuthenticated = await client.isAuthenticated();

      if (!isAuthenticated) {
        return null;
      }

      const identity = client.getIdentity();
      const isValid = await this.validateIdentity(identity);

      if (!isValid) {
        await this.forceRefresh();
        return null;
      }

      return identity;
    } catch (error) {
      console.error("Error getting validated identity:", error);
      return null;
    }
  }

  /**
   * Force refresh identity by clearing all caches
   */
  static async forceRefresh(): Promise<void> {
    // Clear all caches
    await this.clearStaleCache();

    // Reset client
    this.authClient = null;
    this.currentFingerprint = null;

    // Logout current session
    try {
      const client = await AuthClient.create();
      await client.logout();
    } catch (error) {
      console.warn("Error during logout:", error);
    }
  }

  /**
   * Create HTTP agent with proper configuration
   */
  private static async createHttpAgent(identity: Identity): Promise<HttpAgent> {
    const config = EnvironmentManager.getConfig();

    const agent = new HttpAgent({
      identity,
      host: config.host,
      retryTimes: 3,
    });

    // Fetch root key for local development
    if (!config.isProduction) {
      try {
        await agent.fetchRootKey();
      } catch (error) {
        console.warn("Error fetching root key:", error);
        throw error;
      }
    }

    return agent;
  }

  /**
   * Create HTTP agent with validated identity
   */
  static async createValidatedAgent(): Promise<HttpAgent | null> {
    const identity = await this.getValidatedIdentity();
    if (!identity) {
      return null;
    }

    return this.createHttpAgent(identity);
  }

  /**
   * Check if signature error indicates stale identity
   */
  static isSignatureError(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;

    const errorStr = error.toString().toLowerCase();
    const errorMessage =
      "message" in error ? String(error.message).toLowerCase() : "";

    const signatureErrorPatterns = [
      "signature verification failed",
      "invalid signature",
      "authentication failed",
      "unauthorized",
      "invalid delegation",
      "delegation expired",
      "certificate verification failed",
    ];

    return signatureErrorPatterns.some(
      (pattern) => errorStr.includes(pattern) || errorMessage.includes(pattern),
    );
  }
}
