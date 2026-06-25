import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import {
  db,
  usersTable,
  userBusinessUnitsTable,
  type User,
} from "@workspace/db";
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
import { loadBusinessUnits, type BusinessUnitRef } from "../lib/auth/provider";

const router: IRouter = Router();

function mapRow(u: User, businessUnits: BusinessUnitRef[]) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    role: u.role,
    businessUnits,
    businessUnitIds: businessUnits.map((b) => b.id),
    entraObjectId: u.entraObjectId,
    isActive: u.isActive,
    createdAt: iso(u.createdAt),
    updatedAt: iso(u.updatedAt),
  };
}

async function loadOne(id: number) {
  const [u] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!u) return null;
  const businessUnits = await loadBusinessUnits(u.id);
  return { u, businessUnits };
}

// Replaces a user's business-unit assignments with the provided id set.
async function setAssignments(
  userId: number,
  businessUnitIds: number[],
): Promise<void> {
  await db
    .delete(userBusinessUnitsTable)
    .where(eq(userBusinessUnitsTable.userId, userId));
  const uniqueIds = [...new Set(businessUnitIds)];
  if (uniqueIds.length > 0) {
    await db
      .insert(userBusinessUnitsTable)
      .values(uniqueIds.map((businessUnitId) => ({ userId, businessUnitId })));
  }
}

router.use("/admin/users", requireAuth, requireRole("ADMIN"));

router.get("/admin/users", async (_req, res): Promise<void> => {
  const users = await db
    .select()
    .from(usersTable)
    .orderBy(asc(usersTable.displayName));

  const mapped = await Promise.all(
    users.map(async (u) => mapRow(u, await loadBusinessUnits(u.id))),
  );

  res.json(ListUsersResponse.parse(mapped));
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
      isActive: parsed.data.isActive ?? true,
    })
    .returning();

  await setAssignments(created.id, parsed.data.businessUnitIds ?? []);

  await writeAudit({
    actor: req.auth!,
    action: "create",
    entityType: "user",
    entityId: created.id,
    changes: parsed.data,
  });

  const row = await loadOne(created.id);
  res.status(201).json(GetUserResponse.parse(mapRow(row!.u, row!.businessUnits)));
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
  res.json(GetUserResponse.parse(mapRow(row.u, row.businessUnits)));
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

  const { businessUnitIds, ...scalars } = parsed.data;

  if (Object.keys(scalars).length > 0) {
    await db
      .update(usersTable)
      .set(scalars)
      .where(eq(usersTable.id, params.data.id));
  }

  if (businessUnitIds != null) {
    await setAssignments(params.data.id, businessUnitIds);
  }

  await writeAudit({
    actor: req.auth!,
    action: "update",
    entityType: "user",
    entityId: params.data.id,
    changes: parsed.data,
  });

  const row = await loadOne(params.data.id);
  res.json(GetUserResponse.parse(mapRow(row!.u, row!.businessUnits)));
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
