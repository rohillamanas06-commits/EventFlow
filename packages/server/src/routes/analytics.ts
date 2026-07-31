import { Router, Request, Response } from "express";
import { db } from "../db";
import {
  AnalyticsOverview,
  BreakdownItem,
  FunnelStep,
  KPIOverview,
  RawEvent,
  TimeseriesPoint,
} from "@analytics/shared";

const router = Router();

router.get("/overview", (_req: Request, res: Response) => {
  const overview = buildOverview();
  res.json(overview);
});

router.get("/all", (_req: Request, res: Response) => {
  const data: AnalyticsOverview = {
    kpi: buildKPI(),
    timeseries: buildTimeseries(),
    breakdown: buildBreakdown(),
    funnel: buildFunnel(),
    recent: buildRecent(),
  };
  res.json(data);
});

router.delete("/all", (_req: Request, res: Response) => {
  db.prepare("DELETE FROM events").run();
  res.json({ success: true });
});

router.get("/timeseries", (_req: Request, res: Response) => {
  res.json(buildTimeseries());
});

router.get("/breakdown", (_req: Request, res: Response) => {
  res.json(buildBreakdown());
});

router.get("/funnel", (_req: Request, res: Response) => {
  res.json(buildFunnel());
});

router.get("/recent", (_req: Request, res: Response) => {
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

function buildKPI(): KPIOverview {
  const PERIOD_MINUTES = 60;
  const since = new Date(Date.now() - PERIOD_MINUTES * 60 * 1000).toISOString();

  const total = (
    db
      .prepare("SELECT COUNT(*) as c FROM events")
      .get() as { c: number }
  ).c;

  const uniqueUsers = (
    db
      .prepare("SELECT COUNT(DISTINCT user_id) as c FROM events")
      .get() as { c: number }
  ).c;

  const uniqueSessions = (
    db
      .prepare("SELECT COUNT(DISTINCT session_id) as c FROM events")
      .get() as { c: number }
  ).c;

  const recentCount = (
    db
      .prepare(
        "SELECT COUNT(*) as c FROM events WHERE timestamp >= ?"
      )
      .get(since) as { c: number }
  ).c;

  return {
    totalEvents: total,
    uniqueUsers,
    uniqueSessions,
    eventsPerMinute: parseFloat((recentCount / PERIOD_MINUTES).toFixed(2)),
    periodMinutes: PERIOD_MINUTES,
  };
}

function buildTimeseries(): TimeseriesPoint[] {
  const rows = db
    .prepare(
      `
      SELECT
        strftime('%Y-%m-%dT%H:%M:00Z', timestamp) AS bucket,
        COUNT(*) AS count
      FROM events
      WHERE timestamp >= datetime('now', '-60 minutes')
      GROUP BY bucket
      ORDER BY bucket ASC
    `
    )
    .all() as { bucket: string; count: number }[];

  return rows.map((r) => ({ bucket: r.bucket, count: r.count }));
}

function buildBreakdown(): BreakdownItem[] {
  const total = (
    db
      .prepare("SELECT COUNT(*) as c FROM events")
      .get() as { c: number }
  ).c || 1;

  const rows = db
    .prepare(
      `
      SELECT name, COUNT(*) as count
      FROM events
      GROUP BY name
      ORDER BY count DESC
    `
    )
    .all() as { name: string; count: number }[];

  return rows.map((r) => ({
    name: r.name,
    count: r.count,
    percentage: parseFloat(((r.count / total) * 100).toFixed(1)),
  }));
}

const FUNNEL_STEPS = ["page_view", "signup", "purchase"];

function buildFunnel(): FunnelStep[] {
  const counts: Record<string, number> = {};
  FUNNEL_STEPS.forEach((step) => {
    const row = db
      .prepare(
        "SELECT COUNT(DISTINCT user_id) as c FROM events WHERE name = ?"
      )
      .get(step) as { c: number };
    counts[step] = row.c;
  });

  const steps: FunnelStep[] = FUNNEL_STEPS.map((step, i) => {
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

function buildRecent(): RawEvent[] {
  const rows = db
    .prepare(
      `
      SELECT id, name, user_id, session_id, properties, timestamp
      FROM events
      ORDER BY timestamp DESC
      LIMIT 50
    `
    )
    .all() as {
    id: string;
    name: string;
    user_id: string;
    session_id: string;
    properties: string;
    timestamp: string;
  }[];

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    userId: r.user_id,
    sessionId: r.session_id,
    properties: JSON.parse(r.properties),
    timestamp: r.timestamp,
  }));
}

export default router;
