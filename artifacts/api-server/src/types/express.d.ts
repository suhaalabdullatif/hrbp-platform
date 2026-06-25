import type { AuthenticatedUser } from "../lib/auth/provider";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedUser;
    }
  }
}

export {};
