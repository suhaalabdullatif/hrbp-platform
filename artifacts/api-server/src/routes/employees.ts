import { Router, type IRouter } from "express";
import { eq, and, asc, ilike, or, type SQL } from "drizzle-orm";
import { db, employeesTable, businessUnitsTable } from "@workspace/db";
import {
  ListEmployeesQueryParams,
  ListEmployeesResponse,
  CreateEmployeeBody,
  GetEmployeeParams,
  GetEmployeeResponse,
  UpdateEmployeeParams,
  UpdateEmployeeBody,
  DeleteEmployeeParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { getScope, resolveBusinessUnitFilter } from "../lib/auth/scope";
import { writeAudit } from "../lib/audit";
import { iso } from "../lib/serialize";

const router: IRouter = Router();

type EmployeeRow = typeof employeesTable.$inferSelect;

function mapEmployee(e: EmployeeRow, businessUnitName: string | null) {
  return {
    ...e,
    businessUnitName,
    createdAt: iso(e.createdAt),
    updatedAt: iso(e.updatedAt),
  };
}

async function loadEmployee(id: number) {
  const [row] = await db
    .select({ e: employeesTable, businessUnitName: businessUnitsTable.name })
    .from(employeesTable)
    .leftJoin(
      businessUnitsTable,
      eq(employeesTable.businessUnitId, businessUnitsTable.id),
    )
    .where(eq(employeesTable.id, id));
  return row;
}

router.get("/employees", requireAuth, async (req, res): Promise<void> => {
  const query = ListEmployeesQueryParams.safeParse(req.query);
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
  if (filter !== "all") conds.push(eq(employeesTable.businessUnitId, filter));
  if (query.data.status)
    conds.push(eq(employeesTable.employmentStatus, query.data.status));
  if (query.data.search) {
    const term = `%${query.data.search}%`;
    const search = or(
      ilike(employeesTable.fullName, term),
      ilike(employeesTable.employeeNumber, term),
      ilike(employeesTable.email, term),
      ilike(employeesTable.jobTitle, term),
    );
    if (search) conds.push(search);
  }

  const rows = await db
    .select({ e: employeesTable, businessUnitName: businessUnitsTable.name })
    .from(employeesTable)
    .leftJoin(
      businessUnitsTable,
      eq(employeesTable.businessUnitId, businessUnitsTable.id),
    )
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(asc(employeesTable.fullName));

  res.json(
    ListEmployeesResponse.parse(
      rows.map((r) => mapEmployee(r.e, r.businessUnitName)),
    ),
  );
});

router.post("/employees", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateEmployeeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const scope = getScope(req.auth!);
  if (!scope.canSeeAll && parsed.data.businessUnitId !== scope.businessUnitId) {
    res.status(403).json({ error: "Cannot create outside your business unit" });
    return;
  }

  const [created] = await db
    .insert(employeesTable)
    .values(parsed.data)
    .returning();

  await writeAudit({
    actor: req.auth!,
    action: "create",
    entityType: "employee",
    entityId: created.id,
    changes: parsed.data,
  });

  const row = await loadEmployee(created.id);
  res
    .status(201)
    .json(GetEmployeeResponse.parse(mapEmployee(row.e, row.businessUnitName)));
});

router.get("/employees/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetEmployeeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const row = await loadEmployee(params.data.id);
  const scope = getScope(req.auth!);
  if (
    !row ||
    (!scope.canSeeAll && row.e.businessUnitId !== scope.businessUnitId)
  ) {
    res.status(404).json({ error: "Employee not found" });
    return;
  }

  res.json(GetEmployeeResponse.parse(mapEmployee(row.e, row.businessUnitName)));
});

router.patch("/employees/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateEmployeeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateEmployeeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await loadEmployee(params.data.id);
  const scope = getScope(req.auth!);
  if (
    !existing ||
    (!scope.canSeeAll && existing.e.businessUnitId !== scope.businessUnitId)
  ) {
    res.status(404).json({ error: "Employee not found" });
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
    .update(employeesTable)
    .set(parsed.data)
    .where(eq(employeesTable.id, params.data.id))
    .returning();

  await writeAudit({
    actor: req.auth!,
    action: "update",
    entityType: "employee",
    entityId: updated.id,
    changes: parsed.data,
  });

  const row = await loadEmployee(updated.id);
  res.json(GetEmployeeResponse.parse(mapEmployee(row.e, row.businessUnitName)));
});

router.delete(
  "/employees/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = DeleteEmployeeParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const existing = await loadEmployee(params.data.id);
    const scope = getScope(req.auth!);
    if (
      !existing ||
      (!scope.canSeeAll && existing.e.businessUnitId !== scope.businessUnitId)
    ) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    await db.delete(employeesTable).where(eq(employeesTable.id, params.data.id));
    await writeAudit({
      actor: req.auth!,
      action: "delete",
      entityType: "employee",
      entityId: params.data.id,
    });

    res.sendStatus(204);
  },
);

export default router;
