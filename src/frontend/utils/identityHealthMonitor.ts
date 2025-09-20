import { IdentityManager } from "./identityManager";
import { ActorFactory } from "./actorFactory";

export class IdentityHealthMonitor {
  private static monitoringInterval: NodeJS.Timeout | null = null;
  private static readonly CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private static readonly PREEMPTIVE_REFRESH_THRESHOLD = 10 * 60 * 1000; // 10 minutes before expiry
  private static isMonitoring = false;

  /**
   * Start continuous identity health monitoring
   */
  static startMonitoring(): void {
    if (this.isMonitoring) {
      console.log("Identity health monitoring already active");
      return;
    }

    console.log("Starting identity health monitoring");
    this.isMonitoring = true;

    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck().catch(error => {
        console.error("Health check failed:", error);
      });
    }, this.CHECK_INTERVAL);

    // Perform initial health check
    this.performHealthCheck().catch(console.error);
  }

  /**
   * Stop identity health monitoring
   */
  static stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log("Identity health monitoring stopped");
  }

  /**
   * Perform comprehensive identity health check
   */
  private static async performHealthCheck(): Promise<void> {
    try {
      const identity = await IdentityManager.getValidatedIdentity();
      
      if (!identity) {
        console.log("No valid identity found during health check");
        return;
      }

      // Test signature with lightweight call
      const isHealthy = await this.testIdentitySignature();
      
      if (!isHealthy) {
        console.warn("Identity signature test failed, triggering refresh");
        await IdentityManager.forceRefresh();
        ActorFactory.clearCache();
      } else {
        console.log("Identity health check passed");
      }

    } catch (error) {
      console.error("Health check error:", error);
      
      // If it's a signature error, force refresh
      if (IdentityManager.isSignatureError(error)) {
        console.log("Signature error detected in health check, forcing refresh");
        await IdentityManager.forceRefresh();
        ActorFactory.clearCache();
      }
    }
  }

  /**
   * Test identity signature with a lightweight backend call
   */
  private static async testIdentitySignature(): Promise<boolean> {
    try {
      const agent = await IdentityManager.createValidatedAgent();
      if (!agent) {
        return false;
      }

      // Test with a simple status call
      await agent.status();
      return true;
    } catch (error) {
      console.warn("Identity signature test failed:", error);
      return false;
    }
  }

  /**
   * Check if monitoring is currently active
   */
  static isActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Force an immediate health check
   */
  static async forceHealthCheck(): Promise<boolean> {
    try {
      await this.performHealthCheck();
      return true;
    } catch (error) {
      console.error("Forced health check failed:", error);
      return false;
    }
  }
}

// Auto-start monitoring when module loads (only in browser)
if (typeof window !== "undefined") {
  // Start monitoring after a short delay to allow app initialization
  setTimeout(() => {
    IdentityHealthMonitor.startMonitoring();
  }, 2000);

  // Stop monitoring when page unloads
  window.addEventListener("beforeunload", () => {
    IdentityHealthMonitor.stopMonitoring();
  });
}