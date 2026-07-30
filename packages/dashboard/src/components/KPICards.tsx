import React from "react";
import { KPIOverview } from "@analytics/shared";

const CARDS = [
  {
    key: "totalEvents" as keyof KPIOverview,
    label: "Total Events",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.15)",
    fmt: (n: number) => n.toLocaleString(),
    sub: "all time",
  },
  {
    key: "uniqueUsers" as keyof KPIOverview,
    label: "Unique Users",
    color: "#14b8a6",
    bg: "rgba(20,184,166,0.15)",
    fmt: (n: number) => n.toLocaleString(),
    sub: "distinct user IDs",
  },
  {
    key: "uniqueSessions" as keyof KPIOverview,
    label: "Sessions",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.15)",
    fmt: (n: number) => n.toLocaleString(),
    sub: "distinct sessions",
  },
  {
    key: "eventsPerMinute" as keyof KPIOverview,
    label: "Events / Min",
    color: "#10b981",
    bg: "rgba(16,185,129,0.15)",
    fmt: (n: number) => n.toFixed(1),
    sub: "last 60 minutes",
  },
];

interface Props {
  kpi: KPIOverview;
}

const KPICards: React.FC<Props> = ({ kpi }) => (
  <div className="kpi-grid">
    {CARDS.map((c) => (
      <div
        key={c.key}
        className="kpi-card"
        style={{ "--kpi-color": c.color, "--kpi-bg": c.bg } as React.CSSProperties}
      >
        <div className="kpi-card__label">{c.label}</div>
        <div className="kpi-card__value">{c.fmt(kpi[c.key] as number)}</div>
        <div className="kpi-card__sub">{c.sub}</div>
      </div>
    ))}
  </div>
);

export default KPICards;
