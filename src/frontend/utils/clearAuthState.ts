/**
 * Utility function to completely clear authentication state
 * Call this when you encounter persistent auth issues
 */
export const clearAuthState = async (): Promise<void> => {
  try {
    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear IndexedDB databases
    if (typeof window !== "undefined" && window.indexedDB) {
      const databases = ["authClientDB", "ic-keyval-store", "ic-identity"];

      for (const dbName of databases) {
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
          console.log(`Cleared database: ${dbName}`);
        } catch (error) {
          console.warn(`Could not clear database ${dbName}:`, error);
        }
      }
    }

    // Clear any cookies related to IC auth
    if (typeof document !== "undefined") {
      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        if (name.trim().includes("ic") || name.trim().includes("dfinity")) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
    }

    console.log("Authentication state cleared successfully");

    // Reload the page to ensure clean state
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  } catch (error) {
    console.error("Error clearing auth state:", error);
    throw error;
  }
};

/**
 * Check if we should automatically clear auth state based on error patterns
 */
export const shouldClearAuthState = (error: any): boolean => {
  const errorString = error?.toString() || "";

  const criticalAuthErrors = [
    "Invalid delegation",
    "IcCanisterSignature signature could not be verified",
    "certificate verification failed",
    "threshold signature",
    "Invalid signature",
    "EcdsaP256 signature could not be verified",
  ];

  return criticalAuthErrors.some((errorType) =>
    errorString.includes(errorType),
  );
};
