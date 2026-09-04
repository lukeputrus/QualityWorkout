import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

/** 6-digit numeric code so it is easy to key in on a phone when pairing
 * the companion app to the desktop's LAN server. */
export function generatePairingCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
