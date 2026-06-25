import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  LoginBody,
  ListPersonasResponse,
  GetCurrentUserResponse,
} from "@workspace/api-zod";
import { PERSONAS, getPersona } from "../lib/auth/personas";
import { encodeSession, SESSION_COOKIE } from "../lib/auth/session";
import { authProvider } from "../lib/auth/provider";

const router: IRouter = Router();

const isProduction = process.env.NODE_ENV === "production";

router.get("/auth/personas", async (_req, res): Promise<void> => {
  const personas = PERSONAS.map((p) => ({
    key: p.key,
    label: p.label,
    role: p.role,
    businessUnitName: p.businessUnitName,
  }));
  res.json(ListPersonasResponse.parse(personas));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const persona = getPersona(parsed.data.persona);
  if (!persona) {
    res.status(400).json({ error: "Invalid persona" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, persona.email));

  if (!user || !user.isActive) {
    res.status(400).json({ error: "Persona user not provisioned" });
    return;
  }

  res.cookie(SESSION_COOKIE, encodeSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  const current = await authProvider.getCurrentUser(req);
  res.json(GetCurrentUserResponse.parse(current ?? user));
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.sendStatus(204);
});

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.auth) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json(GetCurrentUserResponse.parse(req.auth));
});

export default router;
