"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.get("/overview", (_req, res) => {
    const overview = buildOverview();
    res.json(overview);
});
router.get("/all", (_req, res) => {
    const data = {
        kpi: buildKPI(),
        timeseries: buildTimeseries(),
        breakdown: buildBreakdown(),
        funnel: buildFunnel(),
        recent: buildRecent(),
    };
    res.json(data);
});
router.get("/timeseries", (_req, res) => {
    res.json(buildTimeseries());
});
router.get("/breakdown", (_req, res) => {
    res.json(buildBreakdown());
});
router.get("/funnel", (_req, res) => {
    res.json(buildFunnel());
});
router.get("/recent", (_req, res) => {
    res.json(buildRecent());
});
function buildOverview() {
    return {
        kpi: buildKPI(),
        timeseries: buildTimeseries(),
        breakdown: buildBreakdown(),
        funnel: buildFunnel(),
        recent: buildRecent(),
    };
}
function buildKPI() {
    const PERIOD_MINUTES = 60;
    const since = new Date(Date.now() - PERIOD_MINUTES * 60 * 1000).toISOString();
    const total = db_1.db
        .prepare("SELECT COUNT(*) as c FROM events")
        .get().c;
    const uniqueUsers = db_1.db
        .prepare("SELECT COUNT(DISTINCT user_id) as c FROM events")
        .get().c;
    const uniqueSessions = db_1.db
        .prepare("SELECT COUNT(DISTINCT session_id) as c FROM events")
        .get().c;
    const recentCount = db_1.db
        .prepare("SELECT COUNT(*) as c FROM events WHERE timestamp >= ?")
        .get(since).c;
    return {
        totalEvents: total,
        uniqueUsers,
        uniqueSessions,
        eventsPerMinute: parseFloat((recentCount / PERIOD_MINUTES).toFixed(2)),
        periodMinutes: PERIOD_MINUTES,
    };
}
function buildTimeseries() {
    const rows = db_1.db
        .prepare(`
      SELECT
        strftime('%Y-%m-%dT%H:%M:00Z', timestamp) AS bucket,
        COUNT(*) AS count
      FROM events
      WHERE timestamp >= datetime('now', '-60 minutes')
      GROUP BY bucket
      ORDER BY bucket ASC
    `)
        .all();
    return rows.map((r) => ({ bucket: r.bucket, count: r.count }));
}
function buildBreakdown() {
    const total = db_1.db
        .prepare("SELECT COUNT(*) as c FROM events")
        .get().c || 1;
    const rows = db_1.db
        .prepare(`
      SELECT name, COUNT(*) as count
      FROM events
      GROUP BY name
      ORDER BY count DESC
    `)
        .all();
    return rows.map((r) => ({
        name: r.name,
        count: r.count,
        percentage: parseFloat(((r.count / total) * 100).toFixed(1)),
    }));
}
const FUNNEL_STEPS = ["page_view", "signup", "purchase"];
function buildFunnel() {
    const counts = {};
    FUNNEL_STEPS.forEach((step) => {
        const row = db_1.db
            .prepare("SELECT COUNT(DISTINCT user_id) as c FROM events WHERE name = ?")
            .get(step);
        counts[step] = row.c;
    });
    const steps = FUNNEL_STEPS.map((step, i) => {
        const prev = i === 0 ? counts[step] : counts[FUNNEL_STEPS[i - 1]];
        const curr = counts[step];
        return {
            name: step,
            count: curr,
            dropoff: Math.max(0, prev - curr),
            rate: prev === 0 ? 0 : parseFloat(((curr / prev) * 100).toFixed(1)),
        };
    });
    return steps;
}
function buildRecent() {
    const rows = db_1.db
        .prepare(`
      SELECT id, name, user_id, session_id, properties, timestamp
      FROM events
      ORDER BY timestamp DESC
      LIMIT 50
    `)
        .all();
    return rows.map((r) => ({
        id: r.id,
        name: r.name,
        userId: r.user_id,
        sessionId: r.session_id,
        properties: JSON.parse(r.properties),
        timestamp: r.timestamp,
    }));
}
exports.default = router;
