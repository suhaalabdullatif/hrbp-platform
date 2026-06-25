---
name: Business-unit isolation for scoped roles
description: Authorization rules that are easy to miss when enforcing row-level BU isolation
---

HRBP users are scoped to one business unit; HR_DIRECTOR/CHRO/ADMIN are global
(`GLOBAL_ROLES` in `lib/auth/scope.ts`).

Checking the *existing* record's BU on PATCH is not enough. Two extra rules:

1. **Block BU-moves on PATCH.** If a scoped user updates an in-scope record but sets
   `businessUnitId` to another BU, reject with 403. (Only applies to entities whose
   update body includes `businessUnitId` — employees, requisitions, er-cases.)
2. **Validate cross-BU foreign keys on create.** Routes accepting `employeeId`
   (attrition, probation, er-cases) must verify the referenced employee's
   `businessUnitId` matches the payload — otherwise scoped records can reference (and
   leak the name of) out-of-scope employees. Reject mismatches with 400.

**Why:** A code review caught both as broken-access-control / IDOR-style leaks after
the initial implementation only checked the existing row's scope.

**How to apply:** Out-of-scope detail/update/delete return 404 (hide existence);
cross-BU create / BU-move return 403; bad FK reference returns 400.
