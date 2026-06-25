import type { Request } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, businessUnitsTable, type User } from "@workspace/db";
import { decodeSession } from "./session";
import { SESSION_COOKIE } from "./session";

export interface AuthenticatedUser {
  id: number;
  email: string;
  displayName: string;
  role: string;
  businessUnitId: number | null;
  businessUnitName: string | null;
}

// Pluggable authentication seam. The dev implementation reads a signed cookie
// that encodes a seeded user id. A future Microsoft Entra ID provider can
// implement the same interface (resolving the user via `entraObjectId`).
export interface AuthProvider {
  getCurrentUser(req: Request): Promise<AuthenticatedUser | null>;
}

async function toAuthenticatedUser(
  user: User,
): Promise<AuthenticatedUser> {
  let businessUnitName: string | null = null;
  if (user.businessUnitId != null) {
    const [bu] = await db
      .select({ name: businessUnitsTable.name })
      .from(businessUnitsTable)
      .where(eq(businessUnitsTable.id, user.businessUnitId));
    businessUnitName = bu?.name ?? null;
  }
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    businessUnitId: user.businessUnitId,
    businessUnitName,
  };
}

class DevPersonaProvider implements AuthProvider {
  async getCurrentUser(req: Request): Promise<AuthenticatedUser | null> {
    const raw = req.cookies?.[SESSION_COOKIE] as string | undefined;
    const session = decodeSession(raw);
    if (!session) return null;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.userId));

    if (!user || !user.isActive) return null;
    return toAuthenticatedUser(user);
  }
}

export const authProvider: AuthProvider = new DevPersonaProvider();
