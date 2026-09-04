import type { AuthedUser } from "@billbuddy/shared";

declare global {
  namespace Express {
    interface Request {
      user?: AuthedUser;
      deviceId?: string | null;
    }
  }
}

export {};
