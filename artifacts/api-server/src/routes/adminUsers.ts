import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, usersTable, businessUnitsTable } from "@workspace/db";
import {
  ListUsersResponse,
  CreateUserBody,
  GetUserParams,
  GetUserResponse,
  UpdateUserParams,
  UpdateUserBody,
  DeleteUserParams,
} from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";
import { writeAudit } from "../lib/audit";
import { iso } from "../lib/serialize";

const router: IRouter = Router();

type Row = typeof usersTable.$inferSelect;

function mapRow(u: Row, businessUnitName: string | null) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    role: u.role,
    businessUnitId: u.businessUnitId,
    businessUnitName,
    entraObjectId: u.entraObjectId,
    isActive: u.isActive,
    createdAt: iso(u.createdAt),
    updatedAt: iso(u.updatedAt),
  };
}

async function loadOne(id: number) {
  const [row] = await db
    .select({ u: usersTable, businessUnitName: businessUnitsTable.name })
    .from(usersTable)
    .leftJoin(
      businessUnitsTable,
      eq(usersTable.businessUnitId, businessUnitsTable.id),
    )
    .where(eq(usersTable.id, id));
  return row;
}

router.use("/admin/users", requireAuth, requireRole("ADMIN"));

router.get("/admin/users", async (_req, res): Promise<void> => {
  const rows = await db
    .select({ u: usersTable, businessUnitName: businessUnitsTable.name })
    .from(usersTable)
    .leftJoin(
      businessUnitsTable,
      eq(usersTable.businessUnitId, businessUnitsTable.id),
    )
    .orderBy(asc(usersTable.displayName));

  res.json(
    ListUsersResponse.parse(rows.map((x) => mapRow(x.u, x.businessUnitName))),
  );
});

router.post("/admin/users", async (req, res): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [created] = await db
    .insert(usersTable)
    .values({
      email: parsed.data.email,
      displayName: parsed.data.displayName,
      role: parsed.data.role,
      businessUnitId: parsed.data.businessUnitId ?? null,
      isActive: parsed.data.isActive ?? true,
    })
    .returning();

  await writeAudit({
    actor: req.auth!,
    action: "create",
    entityType: "user",
    entityId: created.id,
    changes: parsed.data,
  });

  const row = await loadOne(created.id);
  res.status(201).json(GetUserResponse.parse(mapRow(row.u, row.businessUnitName)));
});

router.get("/admin/users/:id", async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const row = await loadOne(params.data.id);
  if (!row) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(GetUserResponse.parse(mapRow(row.u, row.businessUnitName)));
});

router.patch("/admin/users/:id", async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await loadOne(params.data.id);
  if (!existing) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, params.data.id))
    .returning();

  await writeAudit({
    actor: req.auth!,
    action: "update",
    entityType: "user",
    entityId: updated.id,
    changes: parsed.data,
  });

  const row = await loadOne(updated.id);
  res.json(GetUserResponse.parse(mapRow(row.u, row.businessUnitName)));
});

router.delete("/admin/users/:id", async (req, res): Promise<void> => {
  const params = DeleteUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const existing = await loadOne(params.data.id);
  if (!existing) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (req.auth!.id === params.data.id) {
    res.status(400).json({ error: "Cannot delete your own account" });
    return;
  }

  await db.delete(usersTable).where(eq(usersTable.id, params.data.id));
  await writeAudit({
    actor: req.auth!,
    action: "delete",
    entityType: "user",
    entityId: params.data.id,
  });

  res.sendStatus(204);
});

export default router;
