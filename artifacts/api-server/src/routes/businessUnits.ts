import { Router, type IRouter } from "express";
import { inArray, asc } from "drizzle-orm";
import { db, businessUnitsTable } from "@workspace/db";
import { ListBusinessUnitsResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { getScope } from "../lib/auth/scope";
import { iso } from "../lib/serialize";

const router: IRouter = Router();

router.get(
  "/business-units",
  requireAuth,
  async (req, res): Promise<void> => {
    const scope = getScope(req.auth!);

    let rows: (typeof businessUnitsTable.$inferSelect)[];
    if (scope.canSeeAll) {
      rows = await db
        .select()
        .from(businessUnitsTable)
        .orderBy(asc(businessUnitsTable.name));
    } else if (scope.businessUnitIds.length > 0) {
      rows = await db
        .select()
        .from(businessUnitsTable)
        .where(inArray(businessUnitsTable.id, scope.businessUnitIds))
        .orderBy(asc(businessUnitsTable.name));
    } else {
      rows = [];
    }

    const mapped = rows.map((r) => ({
      ...r,
      createdAt: iso(r.createdAt),
      updatedAt: iso(r.updatedAt),
    }));
    res.json(ListBusinessUnitsResponse.parse(mapped));
  },
);

export default router;
