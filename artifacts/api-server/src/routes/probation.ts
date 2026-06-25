import { Router, type IRouter } from "express";
import { eq, and, desc, type SQL } from "drizzle-orm";
import {
  db,
  probationTable,
  employeesTable,
  businessUnitsTable,
} from "@workspace/db";
import {
  ListProbationQueryParams,
  ListProbationResponse,
  CreateProbationBody,
  GetProbationParams,
  GetProbationResponse,
  UpdateProbationParams,
  UpdateProbationBody,
  DeleteProbationParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { getScope, resolveBusinessUnitFilter } from "../lib/auth/scope";
import { writeAudit } from "../lib/audit";
import { iso } from "../lib/serialize";

const router: IRouter = Router();

type Row = typeof probationTable.$inferSelect;

function mapRow(
  r: Row,
  employeeName: string | null,
  businessUnitName: string | null,
) {
  return {
    ...r,
    employeeName,
    businessUnitName,
    createdAt: iso(r.createdAt),
    updatedAt: iso(r.updatedAt),
  };
}

async function loadOne(id: number) {
  const [row] = await db
    .select({
      r: probationTable,
      employeeName: employeesTable.fullName,
      businessUnitName: businessUnitsTable.name,
    })
    .from(probationTable)
    .leftJoin(employeesTable, eq(probationTable.employeeId, employeesTable.id))
    .leftJoin(
      businessUnitsTable,
      eq(probationTable.businessUnitId, businessUnitsTable.id),
    )
    .where(eq(probationTable.id, id));
  return row;
}

router.get("/probation", requireAuth, async (req, res): Promise<void> => {
  const query = ListProbationQueryParams.safeParse(req.query);
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
  if (filter !== "all") conds.push(eq(probationTable.businessUnitId, filter));
  if (query.data.status) conds.push(eq(probationTable.status, query.data.status));

  const rows = await db
    .select({
      r: probationTable,
      employeeName: employeesTable.fullName,
      businessUnitName: businessUnitsTable.name,
    })
    .from(probationTable)
    .leftJoin(employeesTable, eq(probationTable.employeeId, employeesTable.id))
    .leftJoin(
      businessUnitsTable,
      eq(probationTable.businessUnitId, businessUnitsTable.id),
    )
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(probationTable.endDate));

  res.json(
    ListProbationResponse.parse(
      rows.map((x) => mapRow(x.r, x.employeeName, x.businessUnitName)),
    ),
  );
});

router.post("/probation", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateProbationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const scope = getScope(req.auth!);
  if (!scope.canSeeAll && parsed.data.businessUnitId !== scope.businessUnitId) {
    res.status(403).json({ error: "Cannot create outside your business unit" });
    return;
  }

  {
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

  const [created] = await db
    .insert(probationTable)
    .values(parsed.data)
    .returning();

  await writeAudit({
    actor: req.auth!,
    action: "create",
    entityType: "probation",
    entityId: created.id,
    changes: parsed.data,
  });

  const row = await loadOne(created.id);
  res
    .status(201)
    .json(
      GetProbationResponse.parse(
        mapRow(row.r, row.employeeName, row.businessUnitName),
      ),
    );
});

router.get("/probation/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetProbationParams.safeParse(req.params);
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
    res.status(404).json({ error: "Probation record not found" });
    return;
  }

  res.json(
    GetProbationResponse.parse(
      mapRow(row.r, row.employeeName, row.businessUnitName),
    ),
  );
});

router.patch("/probation/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateProbationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateProbationBody.safeParse(req.body);
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
    res.status(404).json({ error: "Probation record not found" });
    return;
  }

  const [updated] = await db
    .update(probationTable)
    .set(parsed.data)
    .where(eq(probationTable.id, params.data.id))
    .returning();

  await writeAudit({
    actor: req.auth!,
    action: "update",
    entityType: "probation",
    entityId: updated.id,
    changes: parsed.data,
  });

  const row = await loadOne(updated.id);
  res.json(
    GetProbationResponse.parse(
      mapRow(row.r, row.employeeName, row.businessUnitName),
    ),
  );
});

router.delete("/probation/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteProbationParams.safeParse(req.params);
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
    res.status(404).json({ error: "Probation record not found" });
    return;
  }

  await db.delete(probationTable).where(eq(probationTable.id, params.data.id));
  await writeAudit({
    actor: req.auth!,
    action: "delete",
    entityType: "probation",
    entityId: params.data.id,
  });

  res.sendStatus(204);
});

export default router;
