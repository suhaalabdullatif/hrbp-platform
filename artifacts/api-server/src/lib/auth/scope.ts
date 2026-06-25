import type { AuthenticatedUser } from "./provider";

// Roles that can see data across all business units.
export const GLOBAL_ROLES = ["HR_DIRECTOR", "CHRO", "ADMIN"] as const;

export function canSeeAllBusinessUnits(role: string): boolean {
  return (GLOBAL_ROLES as readonly string[]).includes(role);
}

export interface Scope {
  canSeeAll: boolean;
  // The single business unit a scoped (HRBP) user is limited to; null otherwise.
  businessUnitId: number | null;
}

export function getScope(user: AuthenticatedUser): Scope {
  const canSeeAll = canSeeAllBusinessUnits(user.role);
  return {
    canSeeAll,
    businessUnitId: canSeeAll ? null : user.businessUnitId,
  };
}

// Resolves the effective business unit filter for a list query.
// Returns:
//   - number  -> restrict to that business unit
//   - "all"   -> no restriction
//   - "none"  -> caller has no scope (return empty set)
export function resolveBusinessUnitFilter(
  scope: Scope,
  requested: number | undefined,
): number | "all" | "none" {
  if (scope.canSeeAll) {
    return requested ?? "all";
  }
  if (scope.businessUnitId == null) return "none";
  // A scoped user can only ever see their own unit, ignore mismatched requests.
  if (requested != null && requested !== scope.businessUnitId) return "none";
  return scope.businessUnitId;
}
