import type { AuthenticatedUser } from "./provider";

// Roles that can see data across all business units.
export const GLOBAL_ROLES = ["HR_DIRECTOR", "CHRO", "ADMIN"] as const;

export function canSeeAllBusinessUnits(role: string): boolean {
  return (GLOBAL_ROLES as readonly string[]).includes(role);
}

export interface Scope {
  canSeeAll: boolean;
  // The set of business units a scoped (HRBP) user is limited to, derived from
  // their user_business_units assignments. Empty for global roles (which are
  // unrestricted) and for scoped users with no assignments.
  businessUnitIds: number[];
}

export function getScope(user: AuthenticatedUser): Scope {
  const canSeeAll = canSeeAllBusinessUnits(user.role);
  return {
    canSeeAll,
    businessUnitIds: canSeeAll ? [] : user.businessUnits.map((b) => b.id),
  };
}

// True if a record in the given business unit is visible to this scope.
export function isInScope(scope: Scope, businessUnitId: number): boolean {
  return scope.canSeeAll || scope.businessUnitIds.includes(businessUnitId);
}

// Resolves the effective business unit filter for a list query.
// Returns:
//   - number[] -> restrict to these business units
//   - "all"    -> no restriction
//   - "none"   -> caller has no scope (return empty set)
export function resolveBusinessUnitFilter(
  scope: Scope,
  requested: number | undefined,
): number[] | "all" | "none" {
  if (scope.canSeeAll) {
    return requested == null ? "all" : [requested];
  }
  if (scope.businessUnitIds.length === 0) return "none";
  if (requested != null) {
    // A scoped user can only see units they are assigned to; ignore a
    // mismatched request rather than widening their view.
    return scope.businessUnitIds.includes(requested) ? [requested] : "none";
  }
  return scope.businessUnitIds;
}
