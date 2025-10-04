import { IdentityManager } from "./identityManager";
import { ActorFactory } from "./actorFactory";
import { initializeSmartActors } from "./backendUtils";

export class AuthInterceptor {
  private static readonly MAX_RETRY_ATTEMPTS = 2;
  private static readonly RETRY_DELAY = 1000; // 1 second

  /**
   * Execute a function with automatic signature error recovery
   */
  static async handleCall<T>(
    fn: () => Promise<T>,
    context?: string,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt < this.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Only retry on signature errors and not on the last attempt
        if (
          IdentityManager.isSignatureError(error) &&
          attempt < this.MAX_RETRY_ATTEMPTS - 1
        ) {
          console.log(
            `Signature error detected in ${context || "unknown context"}, attempting recovery (attempt ${attempt + 1})`,
          );

          const recovered = await this.recoverFromSignatureError();

          if (recovered) {
            // Add a small delay before retry
            await this.delay(this.RETRY_DELAY);
            continue;
          } else {
            console.error("Recovery failed, not retrying");
            break;
          }
        }

        // If it's not a signature error or we've exhausted retries, throw
        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Execute an actor method call with automatic recovery
   */
  static async handleActorCall<T, R>(
    actorConfig: {
      canisterId: string;
      idlFactory: any;
      actorType?: string;
    },
    methodName: string,
    args: unknown[] = [],
    context?: string,
  ): Promise<R> {
    return this.handleCall(
      async () => {
        return ActorFactory.executeWithRecovery(actorConfig, (actor) => {
          const method = actor[methodName as keyof typeof actor];
          if (typeof method === "function") {
            return (method as any).apply(actor, args);
          }
          throw new Error(`Method ${methodName} not found on actor`);
        });
      },
      context || `${actorConfig.actorType || "unknown"}.${methodName}`,
    );
  }

  /**
   * Recover from signature errors by clearing caches and refreshing identity
   */
  private static async recoverFromSignatureError(): Promise<boolean> {
    try {
      console.log("Starting signature error recovery");

      // Step 1: Clear all caches
      ActorFactory.clearCache();

      // Step 2: Force identity refresh
      await IdentityManager.forceRefresh();

      // Step 3: Reinitialize smart actors
      await initializeSmartActors();

      // Step 4: Verify recovery by testing identity
      const identity = await IdentityManager.getValidatedIdentity();

      if (identity) {
        console.log("Signature error recovery successful");
        return true;
      } else {
        console.warn("Recovery completed but no valid identity available");
        return false;
      }
    } catch (error) {
      console.error("Signature error recovery failed:", error);
      return false;
    }
  }

  /**
   * Utility method to add delay
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if an error indicates authentication/authorization issues
   */
  static isAuthError(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;

    const errorStr = error.toString().toLowerCase();
    const errorMessage =
      "message" in error ? String(error.message).toLowerCase() : "";

    const authErrorPatterns = [
      "unauthorized",
      "authentication failed",
      "not authenticated",
      "access denied",
      "permission denied",
      "invalid credentials",
      "session expired",
      "token expired",
    ];

    return (
      authErrorPatterns.some(
        (pattern) =>
          errorStr.includes(pattern) || errorMessage.includes(pattern),
      ) || IdentityManager.isSignatureError(error)
    );
  }

  /**
   * Handle any authentication-related error with appropriate recovery
   */
  static async handleAuthError(
    error: unknown,
    context?: string,
  ): Promise<void> {
    if (this.isAuthError(error)) {
      console.log(
        `Authentication error detected in ${context || "unknown context"}, attempting recovery`,
      );
      await this.recoverFromSignatureError();
    }
  }
}
