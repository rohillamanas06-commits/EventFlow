"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const db_1 = require("../db");
const ws_1 = require("../ws");
const router = (0, express_1.Router)();
router.post("/", (req, res) => {
    const body = req.body;
    const payloads = Array.isArray(body) ? body : [body];
    if (payloads.length === 0) {
        res.status(400).json({ error: "No events provided" });
        return;
    }
    const insert = db_1.db.prepare(`
    INSERT INTO events (id, name, user_id, session_id, properties, timestamp)
    VALUES (@id, @name, @userId, @sessionId, @properties, @timestamp)
  `);
    const insertMany = db_1.db.transaction((events) => {
        events.forEach((e) => insert.run(e));
    });
    const rows = payloads.map(buildRow);
    insertMany(rows);
    rows.forEach((row) => {
        (0, ws_1.broadcast)({
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
function buildRow(p) {
    return {
        id: (0, uuid_1.v4)(),
        name: p.name,
        userId: p.userId ?? `anon-${(0, uuid_1.v4)().slice(0, 8)}`,
        sessionId: p.sessionId ?? (0, uuid_1.v4)(),
        properties: JSON.stringify(p.properties ?? {}),
        timestamp: p.timestamp ?? new Date().toISOString(),
    };
}
exports.default = router;
