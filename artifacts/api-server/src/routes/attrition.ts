import { Router, type IRouter } from "express";
import { eq, and, desc, type SQL } from "drizzle-orm";
import {
  db,
  attritionTable,
  employeesTable,
  businessUnitsTable,
} from "@workspace/db";
import {
  ListAttritionQueryParams,
  ListAttritionResponse,
  CreateAttritionBody,
  GetAttritionParams,
  GetAttritionResponse,
  DeleteAttritionParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { getScope, resolveBusinessUnitFilter } from "../lib/auth/scope";
import { writeAudit } from "../lib/audit";
import { iso } from "../lib/serialize";

const router: IRouter = Router();

type Row = typeof attritionTable.$inferSelect;

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
  };
}

async function loadOne(id: number) {
  const [row] = await db
    .select({
      r: attritionTable,
      employeeName: employeesTable.fullName,
      businessUnitName: businessUnitsTable.name,
    })
    .from(attritionTable)
    .leftJoin(employeesTable, eq(attritionTable.employeeId, employeesTable.id))
    .leftJoin(
      businessUnitsTable,
      eq(attritionTable.businessUnitId, businessUnitsTable.id),
    )
    .where(eq(attritionTable.id, id));
  return row;
}

router.get("/attrition", requireAuth, async (req, res): Promise<void> => {
  const query = ListAttritionQueryParams.safeParse(req.query);
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
  if (filter !== "all") conds.push(eq(attritionTable.businessUnitId, filter));

  const rows = await db
    .select({
      r: attritionTable,
      employeeName: employeesTable.fullName,
      businessUnitName: businessUnitsTable.name,
    })
    .from(attritionTable)
    .leftJoin(employeesTable, eq(attritionTable.employeeId, employeesTable.id))
    .leftJoin(
      businessUnitsTable,
      eq(attritionTable.businessUnitId, businessUnitsTable.id),
    )
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(attritionTable.exitDate));

  res.json(
    ListAttritionResponse.parse(
      rows.map((x) => mapRow(x.r, x.employeeName, x.businessUnitName)),
    ),
  );
});

router.post("/attrition", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateAttritionBody.safeParse(req.body);
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
    .insert(attritionTable)
    .values(parsed.data)
    .returning();

  await writeAudit({
    actor: req.auth!,
    action: "create",
    entityType: "attrition",
    entityId: created.id,
    changes: parsed.data,
  });

  const row = await loadOne(created.id);
  res
    .status(201)
    .json(
      GetAttritionResponse.parse(
        mapRow(row.r, row.employeeName, row.businessUnitName),
      ),
    );
});

router.get("/attrition/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetAttritionParams.safeParse(req.params);
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
    res.status(404).json({ error: "Attrition record not found" });
    return;
  }

  res.json(
    GetAttritionResponse.parse(
      mapRow(row.r, row.employeeName, row.businessUnitName),
    ),
  );
});

router.delete("/attrition/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteAttritionParams.safeParse(req.params);
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
    res.status(404).json({ error: "Attrition record not found" });
    return;
  }

  await db.delete(attritionTable).where(eq(attritionTable.id, params.data.id));
  await writeAudit({
    actor: req.auth!,
    action: "delete",
    entityType: "attrition",
    entityId: params.data.id,
  });

  res.sendStatus(204);
});

export default router;
