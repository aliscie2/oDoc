import { ActorSubclass, Actor, Identity } from "@dfinity/agent";
import { IdentityManager } from "./identityManager";

interface ActorConfig<T> {
  canisterId: string;
  idlFactory: unknown;
  actorType?: string;
}

interface CachedActor<T> {
  actor: ActorSubclass<T>;
  identity: Identity;
  timestamp: number;
}

export class ActorFactory {
  private static actors = new Map<string, CachedActor<unknown>>();
  private static readonly ACTOR_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get or create an actor with automatic identity validation and recovery
   */
  static async getActor<T>(config: ActorConfig<T>): Promise<ActorSubclass<T> | null> {
    const cacheKey = `${config.canisterId}_${config.actorType || 'default'}`;
    
    // Check if we have a valid cached actor
    const cached = this.actors.get(cacheKey);
    if (cached && this.isActorValid(cached)) {
      return cached.actor;
    }

    // Create new actor with validated identity
    return this.createFreshActor(config, cacheKey);
  }

  /**
   * Create a new actor with validated identity
   */
  private static async createFreshActor<T>(
    config: ActorConfig<T>, 
    cacheKey: string
  ): Promise<ActorSubclass<T> | null> {
    try {
      const agent = await IdentityManager.createValidatedAgent();
      if (!agent) {
        console.warn("No validated agent available for actor creation");
        return null;
      }

      const actor = Actor.createActor<T>(config.idlFactory, {
        agent,
        canisterId: config.canisterId,
      });

      // Cache the actor with identity reference
      const identity = await IdentityManager.getValidatedIdentity();
      if (identity) {
        this.actors.set(cacheKey, {
          actor,
          identity,
          timestamp: Date.now()
        });
      }

      return actor;
    } catch (error) {
      console.error("Failed to create actor:", error);
      
      // If it's a signature error, try to recover
      if (IdentityManager.isSignatureError(error)) {
        console.log("Signature error detected, attempting recovery");
        await this.recoverFromSignatureError();
        
        // Retry once after recovery
        try {
          const agent = await IdentityManager.createValidatedAgent();
          if (agent) {
            return Actor.createActor<T>(config.idlFactory, {
              agent,
              canisterId: config.canisterId,
            });
          }
        } catch (retryError) {
          console.error("Actor creation failed after recovery:", retryError);
        }
      }
      
      return null;
    }
  }

  /**
   * Check if cached actor is still valid
   */
  private static isActorValid<T>(cached: CachedActor<T>): boolean {
    // Check cache age
    const age = Date.now() - cached.timestamp;
    if (age > this.ACTOR_CACHE_TTL) {
      return false;
    }

    // Check if identity is still the same
    try {
      const currentPrincipal = cached.identity.getPrincipal().toString();
      return !cached.identity.getPrincipal().isAnonymous() && currentPrincipal.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Execute a call with automatic error recovery
   */
  static async executeWithRecovery<T, R>(
    config: ActorConfig<T>,
    fn: (actor: ActorSubclass<T>) => Promise<R>
  ): Promise<R | null> {
    try {
      const actor = await this.getActor(config);
      if (!actor) {
        throw new Error("No actor available");
      }

      return await fn(actor);
    } catch (error) {
      console.error("Actor call failed:", error);
      
      // If it's a signature error, try to recover and retry
      if (IdentityManager.isSignatureError(error)) {
        console.log("Signature error detected, attempting recovery and retry");
        
        await this.recoverFromSignatureError();
        
        // Retry once after recovery
        try {
          const actor = await this.getActor(config);
          if (actor) {
            return await fn(actor);
          }
        } catch (retryError) {
          console.error("Retry failed after recovery:", retryError);
        }
      }
      
      throw error;
    }
  }

  /**
   * Recover from signature errors by clearing caches and forcing refresh
   */
  private static async recoverFromSignatureError(): Promise<void> {
    console.log("Recovering from signature error");
    
    // Clear all cached actors
    this.actors.clear();
    
    // Force identity refresh
    await IdentityManager.forceRefresh();
  }

  /**
   * Clear all cached actors (useful for logout)
   */
  static clearCache(): void {
    this.actors.clear();
  }

  /**
   * Get actor with fallback to anonymous actor
   */
  static async getActorWithFallback<T>(
    config: ActorConfig<T>,
    fallbackActor?: ActorSubclass<T>
  ): Promise<ActorSubclass<T>> {
    const actor = await this.getActor(config);
    
    if (actor) {
      return actor;
    }
    
    if (fallbackActor) {
      console.log("Using fallback actor");
      return fallbackActor;
    }
    
    throw new Error("No actor available and no fallback provided");
  }
}