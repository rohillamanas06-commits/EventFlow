"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dataDir = path_1.default.join(__dirname, "..", "data");
if (!fs_1.default.existsSync(dataDir))
    fs_1.default.mkdirSync(dataDir, { recursive: true });
const dbPath = path_1.default.join(dataDir, "analytics.db");
exports.db = new better_sqlite3_1.default(dbPath);
exports.db.pragma("journal_mode = WAL");
exports.db.pragma("foreign_keys = ON");
exports.db.exec(`
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
