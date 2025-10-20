import { Principal } from "@dfinity/principal";

/**
 * Utility functions for chat operations
 */

export interface ValidatedUser {
  id: string;
  name: string;
}

export interface ValidatedWorkspace {
  id: string;
  name: string;
}

/**
 * Validates and filters user objects, removing null/undefined values
 */
export const validateUsers = (
  users: Array<ValidatedUser | null>,
): ValidatedUser[] => {
  return (users || []).filter(
    (user): user is ValidatedUser =>
      user !== null &&
      user !== undefined &&
      typeof user === "object" &&
      "id" in user &&
      "name" in user &&
      typeof user.id === "string" &&
      typeof user.name === "string",
  );
};

/**
 * Validates and filters workspace objects, removing null/undefined values
 */
export const validateWorkspaces = (
  workspaces: Array<ValidatedWorkspace | null>,
): ValidatedWorkspace[] => {
  return (workspaces || []).filter(
    (workspace): workspace is ValidatedWorkspace =>
      workspace !== null &&
      workspace !== undefined &&
      typeof workspace === "object" &&
      "id" in workspace &&
      "name" in workspace &&
      typeof workspace.id === "string" &&
      typeof workspace.name === "string",
  );
};

/**
 * Checks if a user is an admin of a chat
 * Handles Principal objects from Chat
 */
export const isUserAdmin = (
  admins: Principal[] | undefined,
  userId: string | undefined,
): boolean => {
  if (!admins || !userId) return false;

  return admins.some((admin) => {
    if (!admin) return false;
    return admin.toString() === userId;
  });
};

/**
 * Checks if a user is the creator of a chat
 */
export const isUserCreator = (
  creator: Principal | undefined,
  userId: string | undefined,
): boolean => {
  if (!creator || !userId) return false;
  return creator.toString() === userId;
};

/**
 * Creates admin array ensuring creator is always included
 */
export const createAdminArray = (
  creatorId: string,
  selectedAdmins: ValidatedUser[],
): Principal[] => {
  const adminIds = new Set([creatorId]); // Creator is always an admin

  // Add selected admins (avoiding duplicates)
  selectedAdmins.forEach((admin) => {
    if (admin.id !== creatorId) {
      adminIds.add(admin.id);
    }
  });

  return Array.from(adminIds).map((id) => Principal.fromText(id));
};


