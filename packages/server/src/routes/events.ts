import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { broadcast } from "../ws";
import { IngestEventPayload, RawEvent } from "@analytics/shared";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  const body = req.body as IngestEventPayload | IngestEventPayload[];
  const payloads: IngestEventPayload[] = Array.isArray(body) ? body : [body];

  if (payloads.length === 0) {
    res.status(400).json({ error: "No events provided" });
    return;
  }

  const insert = db.prepare(`
    INSERT INTO events (id, name, user_id, session_id, properties, timestamp)
    VALUES (@id, @name, @userId, @sessionId, @properties, @timestamp)
  `);

  const insertMany = db.transaction(
    (events: Array<ReturnType<typeof buildRow>>) => {
      events.forEach((e) => insert.run(e));
    }
  );

  const rows = payloads.map(buildRow);
  insertMany(rows);

  rows.forEach((row) => {
    broadcast<RawEvent>({
      type: "NEW_EVENT",
      payload: {
        id: row.id,
        name: row.name,
        userId: row.userId,
        sessionId: row.sessionId,
        properties: JSON.parse(row.properties),
        timestamp: row.timestamp,
      },
    });
  });

  res.status(201).json({ ingested: rows.length, ids: rows.map((r) => r.id) });
});

function buildRow(p: IngestEventPayload) {
  return {
    id: uuidv4(),
    name: p.name,
    userId: p.userId ?? `anon-${uuidv4().slice(0, 8)}`,
    sessionId: p.sessionId ?? uuidv4(),
    properties: JSON.stringify(p.properties ?? {}),
    timestamp: p.timestamp ?? new Date().toISOString(),
  };
}

export default router;
