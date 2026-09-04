import type { Response } from "express";
import type { z } from "zod";

/** Parses `body` against `schema`; on failure sends a 400 and returns null
 * so the caller can `if (!data) return;`.
 *
 * Generic over the schema itself (`S extends z.ZodTypeAny`) rather than
 * over its output (`ZodSchema<T>`) deliberately: the latter pins the
 * schema's Input type to T too, which breaks inference the moment a field
 * uses `.default()` (Input allows undefined, Output does not) and made
 * every `.default()`-ed field look optional to callers. */
export function parseBody<S extends z.ZodTypeAny>(
  schema: S,
  body: unknown,
  res: Response
): z.infer<S> | null {
  const result = schema.safeParse(body);
  if (!result.success) {
    res.status(400).json({ error: "Invalid request", details: result.error.flatten() });
    return null;
  }
  return result.data;
}
