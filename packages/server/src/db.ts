import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "analytics.db");

export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    user_id     TEXT NOT NULL,
    session_id  TEXT NOT NULL,
    properties  TEXT NOT NULL DEFAULT '{}',
    timestamp   TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events (timestamp);
  CREATE INDEX IF NOT EXISTS idx_events_name      ON events (name);
  CREATE INDEX IF NOT EXISTS idx_events_user_id   ON events (user_id);
  CREATE INDEX IF NOT EXISTS idx_events_session   ON events (session_id);
`);
