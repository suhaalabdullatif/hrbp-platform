import { db, auditLogTable } from "@workspace/db";
import type { AuthenticatedUser } from "./auth/provider";

// Records a mutation in the audit log. Never throws into the request path.
export async function writeAudit(params: {
  actor: AuthenticatedUser | null;
  action: string;
  entityType: string;
  entityId: number;
  changes?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    await db.insert(auditLogTable).values({
      actorUserId: params.actor?.id ?? null,
      actorName: params.actor?.displayName ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      changes: params.changes ?? null,
    });
  } catch {
    // Audit failures must not break the primary operation.
  }
}
