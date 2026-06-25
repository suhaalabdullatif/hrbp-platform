import { Router, type IRouter } from "express";
import { eq, and, desc, type SQL } from "drizzle-orm";
import { db, erCasesTable, businessUnitsTable, employeesTable } from "@workspace/db";
import {
  ListErCasesQueryParams,
  ListErCasesResponse,
  CreateErCaseBody,
  GetErCaseParams,
  GetErCaseResponse,
  UpdateErCaseParams,
  UpdateErCaseBody,
  DeleteErCaseParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { getScope, resolveBusinessUnitFilter } from "../lib/auth/scope";
import { writeAudit } from "../lib/audit";
import { iso } from "../lib/serialize";

const router: IRouter = Router();

type Row = typeof erCasesTable.$inferSelect;

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
    .select({ r: erCasesTable, businessUnitName: businessUnitsTable.name })
    .from(erCasesTable)
    .leftJoin(
      businessUnitsTable,
      eq(erCasesTable.businessUnitId, businessUnitsTable.id),
    )
    .where(eq(erCasesTable.id, id));
  return row;
}

router.get("/er-cases", requireAuth, async (req, res): Promise<void> => {
  const query = ListErCasesQueryParams.safeParse(req.query);
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
  if (filter !== "all") conds.push(eq(erCasesTable.businessUnitId, filter));
  if (query.data.status) conds.push(eq(erCasesTable.status, query.data.status));

  const rows = await db
    .select({ r: erCasesTable, businessUnitName: businessUnitsTable.name })
    .from(erCasesTable)
    .leftJoin(
      businessUnitsTable,
      eq(erCasesTable.businessUnitId, businessUnitsTable.id),
    )
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(erCasesTable.openedDate));

  res.json(
    ListErCasesResponse.parse(rows.map((x) => mapRow(x.r, x.businessUnitName))),
  );
});

router.post("/er-cases", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateErCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const scope = getScope(req.auth!);
  if (!scope.canSeeAll && parsed.data.businessUnitId !== scope.businessUnitId) {
    res.status(403).json({ error: "Cannot create outside your business unit" });
    return;
  }

  if (parsed.data.employeeId != null) {
    const [emp] = await db
      .select({ businessUnitId: employeesTable.businessUnitId })
      .from(employeesTable)
      .where(eq(employeesTable.id, parsed.data.employeeId));
    if (!emp || emp.businessUnitId !== parsed.data.businessUnitId) {
      res.status(400).json({
        error: "Employee does not belong to the specified business unit",
      });
      return;
    }
  }

  const [created] = await db.insert(erCasesTable).values(parsed.data).returning();

  await writeAudit({
    actor: req.auth!,
    action: "create",
    entityType: "er_case",
    entityId: created.id,
    changes: parsed.data,
  });

  const row = await loadOne(created.id);
  res
    .status(201)
    .json(GetErCaseResponse.parse(mapRow(row.r, row.businessUnitName)));
});

router.get("/er-cases/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetErCaseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const row = await loadOne(params.data.id);
  const scope = getScope(req.auth!);
  if (
    !row ||
    (!scope.canSeeAll && row.r.businessUnitId !== scope.businessUnitId)
  ) {
    res.status(404).json({ error: "ER case not found" });
    return;
  }

  res.json(GetErCaseResponse.parse(mapRow(row.r, row.businessUnitName)));
});

router.patch("/er-cases/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateErCaseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateErCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await loadOne(params.data.id);
  const scope = getScope(req.auth!);
  if (
    !existing ||
    (!scope.canSeeAll && existing.r.businessUnitId !== scope.businessUnitId)
  ) {
    res.status(404).json({ error: "ER case not found" });
    return;
  }

  if (
    !scope.canSeeAll &&
    parsed.data.businessUnitId != null &&
    parsed.data.businessUnitId !== scope.businessUnitId
  ) {
    res
      .status(403)
      .json({ error: "Cannot move record outside your business unit" });
    return;
  }

  const [updated] = await db
    .update(erCasesTable)
    .set(parsed.data)
    .where(eq(erCasesTable.id, params.data.id))
    .returning();

  await writeAudit({
    actor: req.auth!,
    action: "update",
    entityType: "er_case",
    entityId: updated.id,
    changes: parsed.data,
  });

  const row = await loadOne(updated.id);
  res.json(GetErCaseResponse.parse(mapRow(row.r, row.businessUnitName)));
});

router.delete("/er-cases/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteErCaseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const existing = await loadOne(params.data.id);
  const scope = getScope(req.auth!);
  if (
    !existing ||
    (!scope.canSeeAll && existing.r.businessUnitId !== scope.businessUnitId)
  ) {
    res.status(404).json({ error: "ER case not found" });
    return;
  }

  await db.delete(erCasesTable).where(eq(erCasesTable.id, params.data.id));
  await writeAudit({
    actor: req.auth!,
    action: "delete",
    entityType: "er_case",
    entityId: params.data.id,
  });

  res.sendStatus(204);
});

export default router;
