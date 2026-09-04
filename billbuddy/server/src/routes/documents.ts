import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { db, documentsDir } from "../db/index.js";
import { newId, nowISO } from "../utils/ids.js";
import { requireAuth } from "../middleware/auth.js";

export const documentsRouter = Router();
documentsRouter.use(requireAuth);

const matterFilesDir = path.join(documentsDir, "matter-files");
fs.mkdirSync(matterFilesDir, { recursive: true });
const upload = multer({ dest: matterFilesDir });

interface DocumentRow {
  id: string;
  firm_id: string;
  matter_id: string;
  uploaded_by_user_id: string;
  filename: string;
  stored_path: string;
  size_bytes: number;
  content_type: string;
  created_at: string;
}

function toDto(row: DocumentRow) {
  return {
    id: row.id,
    firmId: row.firm_id,
    matterId: row.matter_id,
    uploadedByUserId: row.uploaded_by_user_id,
    filename: row.filename,
    sizeBytes: row.size_bytes,
    contentType: row.content_type,
    createdAt: row.created_at,
  };
}

documentsRouter.get("/", (req, res) => {
  const { matterId } = req.query as Record<string, string | undefined>;
  if (!matterId) {
    res.status(400).json({ error: "matterId is required" });
    return;
  }
  const rows = db
    .prepare<[string, string], DocumentRow>(
      "SELECT * FROM documents WHERE matter_id = ? AND firm_id = ? ORDER BY created_at DESC"
    )
    .all(matterId, req.user!.firmId);
  res.json({ documents: rows.map(toDto) });
});

documentsRouter.post("/", upload.single("file"), (req, res) => {
  const matterId = req.body.matterId as string | undefined;
  if (!matterId || !req.file) {
    res.status(400).json({ error: "matterId and file are required" });
    return;
  }
  const matter = db
    .prepare("SELECT id FROM matters WHERE id = ? AND firm_id = ?")
    .get(matterId, req.user!.firmId);
  if (!matter) {
    res.status(400).json({ error: "Unknown matterId" });
    return;
  }
  const id = newId();
  db.prepare(
    `INSERT INTO documents (id, firm_id, matter_id, uploaded_by_user_id, filename, stored_path, size_bytes, content_type, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    req.user!.firmId,
    matterId,
    req.user!.id,
    req.file.originalname,
    req.file.filename,
    req.file.size,
    req.file.mimetype,
    nowISO()
  );
  res.status(201).json({ document: toDto(db.prepare<[string], DocumentRow>("SELECT * FROM documents WHERE id = ?").get(id)!) });
});

documentsRouter.get("/:id/download", (req, res) => {
  const row = db
    .prepare<[string, string], DocumentRow>(
      "SELECT * FROM documents WHERE id = ? AND firm_id = ?"
    )
    .get(req.params.id, req.user!.firmId);
  if (!row) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  res.download(path.join(matterFilesDir, row.stored_path), row.filename);
});

documentsRouter.delete("/:id", (req, res) => {
  const row = db
    .prepare<[string, string], DocumentRow>(
      "SELECT * FROM documents WHERE id = ? AND firm_id = ?"
    )
    .get(req.params.id, req.user!.firmId);
  if (!row) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  fs.rm(path.join(matterFilesDir, row.stored_path), { force: true }, () => {});
  db.prepare("DELETE FROM documents WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
