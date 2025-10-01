interface EnvironmentConfig {
  network: string;
  host: string;
  identityProvider: string;
  derivationOrigin: string;
  cacheKey: string;
  isProduction: boolean;
}

export class EnvironmentManager {
  private static config: EnvironmentConfig | null = null;

  /**
   * Get environment-specific configuration
   */
  static getConfig(): EnvironmentConfig {
    if (!this.config) {
      this.config = this.buildConfig();
    }
    return this.config;
  }

  /**
   * Build configuration based on current environment
   */
  private static buildConfig(): EnvironmentConfig {
    const network = import.meta.env.VITE_DFX_NETWORK || "local";
    const isProduction = network === "ic";
    const port = import.meta.env.VITE_DFX_PORT || "4943";
    const version = import.meta.env.VITE_APP_VERSION || "1.0.0";

    const host = isProduction 
      ? "https://ic0.app"
      : import.meta.env.VITE_IC_HOST || `http://localhost:${port}`;

    const identityProvider = isProduction
      ? "https://id.ai"
      : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:${port}`;

    const derivationOrigin = isProduction
      ? "https://odoc.app"
      : window.location.origin;

    const cacheKey = `auth_${network}_${version}`;

    return {
      network,
      host,
      identityProvider,
      derivationOrigin,
      cacheKey,
      isProduction
    };
  }

  /**
   * Check if current environment has changed from cached config
   */
  static hasEnvironmentChanged(cachedConfig?: Partial<EnvironmentConfig>): boolean {
    if (!cachedConfig) return true;

    const current = this.getConfig();
    
    return (
      cachedConfig.network !== current.network ||
      cachedConfig.host !== current.host ||
      cachedConfig.cacheKey !== current.cacheKey
    );
  }

  /**
   * Get cache key for current environment
   */
  static getCacheKey(): string {
    return this.getConfig().cacheKey;
  }

  /**
   * Check if running in production
   */
  static isProduction(): boolean {
    return this.getConfig().isProduction;
  }

  /**
   * Get network name
   */
  static getNetwork(): string {
    return this.getConfig().network;
  }

  /**
   * Reset cached config (useful for testing)
   */
  static resetConfig(): void {
    this.config = null;
  }
}