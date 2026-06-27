import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, auditLogTable } from "@workspace/db";
import {
  ListAuditLogQueryParams,
  ListAuditLogResponse,
} from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";
import { iso } from "../lib/serialize";

const router: IRouter = Router();

router.get(
  "/audit-log",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    const query = ListAuditLogQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: query.error.message });
      return;
    }

    const limit = Math.min(query.data.limit ?? 100, 500);
    const rows = await db
      .select()
      .from(auditLogTable)
      .where(
        query.data.entityType
          ? eq(auditLogTable.entityType, query.data.entityType)
          : undefined,
      )
      .orderBy(desc(auditLogTable.createdAt))
      .limit(limit);

    res.json(
      ListAuditLogResponse.parse(
        rows.map((r) => ({
          ...r,
          changes: r.changes as Record<string, unknown> | null,
          createdAt: iso(r.createdAt),
        })),
      ),
    );
  },
);

export default router;
