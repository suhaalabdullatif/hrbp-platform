import type { Request, Response, NextFunction, RequestHandler } from "express";
import { authProvider } from "../lib/auth/provider";

// Populates req.auth when a valid session is present. Never rejects — guards
// downstream decide whether authentication is required.
export const populateAuth: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const user = await authProvider.getCurrentUser(req);
  if (user) req.auth = user;
  next();
};

// Rejects unauthenticated requests.
export const requireAuth: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.auth) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
};

// Restricts a route to the given roles.
export function requireRole(...roles: string[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    if (!roles.includes(req.auth.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
