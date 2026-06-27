import { Router, type IRouter } from "express";
import { eq, and, desc, inArray, type SQL } from "drizzle-orm";
import { db, requisitionsTable, businessUnitsTable } from "@workspace/db";
import {
  ListRequisitionsQueryParams,
  ListRequisitionsResponse,
  CreateRequisitionBody,
  GetRequisitionParams,
  GetRequisitionResponse,
  UpdateRequisitionParams,
  UpdateRequisitionBody,
  DeleteRequisitionParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import {
  getScope,
  resolveBusinessUnitFilter,
  isInScope,
} from "../lib/auth/scope";
import { writeAudit } from "../lib/audit";
import { iso } from "../lib/serialize";

const router: IRouter = Router();

type Row = typeof requisitionsTable.$inferSelect;

function mapRow(r: Row, businessUnitName: string | null) {
  return {
    ...r,
    businessUnitName,
    createdAt: iso(r.createdAt),
    updatedAt: iso(r.updatedAt),
  };
}

async function loadOne(id: number) {
  const [row] = await db
    .select({ r: requisitionsTable, businessUnitName: businessUnitsTable.name })
    .from(requisitionsTable)
    .leftJoin(
      businessUnitsTable,
      eq(requisitionsTable.businessUnitId, businessUnitsTable.id),
    )
    .where(eq(requisitionsTable.id, id));
  return row;
}

router.get("/requisitions", requireAuth, async (req, res): Promise<void> => {
  const query = ListRequisitionsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const scope = getScope(req.auth!);
  const filter = resolveBusinessUnitFilter(scope, query.data.businessUnitId);
  if (filter === "none") {
    res.json([]);
    return;
  }

  const conds: SQL[] = [];
  if (filter !== "all")
    conds.push(inArray(requisitionsTable.businessUnitId, filter));
  if (query.data.status)
    conds.push(eq(requisitionsTable.status, query.data.status));

  const rows = await db
    .select({ r: requisitionsTable, businessUnitName: businessUnitsTable.name })
    .from(requisitionsTable)
    .leftJoin(
      businessUnitsTable,
      eq(requisitionsTable.businessUnitId, businessUnitsTable.id),
    )
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(requisitionsTable.openedDate));

  res.json(
    ListRequisitionsResponse.parse(
      rows.map((x) => mapRow(x.r, x.businessUnitName)),
    ),
  );
});

router.post("/requisitions", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateRequisitionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const scope = getScope(req.auth!);
  if (!isInScope(scope, parsed.data.businessUnitId)) {
    res.status(403).json({ error: "Cannot create outside your business unit" });
    return;
  }

  const [created] = await db
    .insert(requisitionsTable)
    .values(parsed.data)
    .returning();

  await writeAudit({
    actor: req.auth!,
    action: "create",
    entityType: "requisition",
    entityId: created.id,
    changes: parsed.data,
  });

  const row = await loadOne(created.id);
  res
    .status(201)
    .json(GetRequisitionResponse.parse(mapRow(row.r, row.businessUnitName)));
});

router.get("/requisitions/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetRequisitionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const row = await loadOne(params.data.id);
  const scope = getScope(req.auth!);
  if (!row || !isInScope(scope, row.r.businessUnitId)) {
    res.status(404).json({ error: "Requisition not found" });
    return;
  }

  res.json(GetRequisitionResponse.parse(mapRow(row.r, row.businessUnitName)));
});

router.patch(
  "/requisitions/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = UpdateRequisitionParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const parsed = UpdateRequisitionBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const existing = await loadOne(params.data.id);
    const scope = getScope(req.auth!);
    if (!existing || !isInScope(scope, existing.r.businessUnitId)) {
      res.status(404).json({ error: "Requisition not found" });
      return;
    }

    if (
      parsed.data.businessUnitId != null &&
      !isInScope(scope, parsed.data.businessUnitId)
    ) {
      res
        .status(403)
        .json({ error: "Cannot move record outside your business unit" });
      return;
    }

    const [updated] = await db
      .update(requisitionsTable)
      .set(parsed.data)
      .where(eq(requisitionsTable.id, params.data.id))
      .returning();

    await writeAudit({
      actor: req.auth!,
      action: "update",
      entityType: "requisition",
      entityId: updated.id,
      changes: parsed.data,
    });

    const row = await loadOne(updated.id);
    res.json(GetRequisitionResponse.parse(mapRow(row.r, row.businessUnitName)));
  },
);

router.delete(
  "/requisitions/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = DeleteRequisitionParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const existing = await loadOne(params.data.id);
    const scope = getScope(req.auth!);
    if (!existing || !isInScope(scope, existing.r.businessUnitId)) {
      res.status(404).json({ error: "Requisition not found" });
      return;
    }

    await db
      .delete(requisitionsTable)
      .where(eq(requisitionsTable.id, params.data.id));
    await writeAudit({
      actor: req.auth!,
      action: "delete",
      entityType: "requisition",
      entityId: params.data.id,
    });

    res.sendStatus(204);
  },
);

export default router;
