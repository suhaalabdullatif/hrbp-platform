import type { Request } from "express";
import { eq, asc } from "drizzle-orm";
import {
  db,
  usersTable,
  businessUnitsTable,
  userBusinessUnitsTable,
  type User,
} from "@workspace/db";
import { decodeSession } from "./session";
import { SESSION_COOKIE } from "./session";

export interface BusinessUnitRef {
  id: number;
  name: string;
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  displayName: string;
  role: string;
  // The business units this user is assigned to via user_business_units.
  // Empty for global roles (which see all units) and unassigned users.
  businessUnits: BusinessUnitRef[];
}

// Pluggable authentication seam. The dev implementation reads a signed cookie
// that encodes a seeded user id. A future Microsoft Entra ID provider can
// implement the same interface (resolving the user via `entraObjectId`).
export interface AuthProvider {
  getCurrentUser(req: Request): Promise<AuthenticatedUser | null>;
}

export async function loadBusinessUnits(
  userId: number,
): Promise<BusinessUnitRef[]> {
  return db
    .select({ id: businessUnitsTable.id, name: businessUnitsTable.name })
    .from(userBusinessUnitsTable)
    .innerJoin(
      businessUnitsTable,
      eq(userBusinessUnitsTable.businessUnitId, businessUnitsTable.id),
    )
    .where(eq(userBusinessUnitsTable.userId, userId))
    .orderBy(asc(businessUnitsTable.name));
}

export async function toAuthenticatedUser(
  user: User,
): Promise<AuthenticatedUser> {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    businessUnits: await loadBusinessUnits(user.id),
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
