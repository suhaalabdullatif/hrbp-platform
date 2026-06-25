import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import businessUnitsRouter from "./businessUnits";
import employeesRouter from "./employees";
import requisitionsRouter from "./requisitions";
import erCasesRouter from "./erCases";
import attritionRouter from "./attrition";
import probationRouter from "./probation";
import dashboardRouter from "./dashboard";
import notificationsRouter from "./notifications";
import adminUsersRouter from "./adminUsers";
import auditLogRouter from "./auditLog";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(businessUnitsRouter);
router.use(employeesRouter);
router.use(requisitionsRouter);
router.use(erCasesRouter);
router.use(attritionRouter);
router.use(probationRouter);
router.use(dashboardRouter);
router.use(notificationsRouter);
router.use(adminUsersRouter);
router.use(auditLogRouter);

export default router;
