import React, { useState, useCallback, useEffect } from "react";
import { RawEvent } from "@analytics/shared";
import { useAnalytics } from "./hooks/useAnalytics";
import { useWebSocket } from "./hooks/useWebSocket";
import KPICards from "./components/KPICards";
import TimeSeriesChart from "./components/TimeSeriesChart";
import BreakdownChart from "./components/BreakdownChart";
import FunnelChart from "./components/FunnelChart";
import LiveFeed from "./components/LiveFeed";
import EventSimulator from "./components/EventSimulator";


const App: React.FC = () => {
  const { data, refresh } = useAnalytics(8_000);
  const [liveEvents, setLiveEvents] = useState<RawEvent[]>([]);

  const handleNewEvent = useCallback((evt: RawEvent) => {
    setLiveEvents((prev) => [evt, ...prev].slice(0, 50));
  }, []);

  const { status } = useWebSocket(handleNewEvent, refresh);

  const initialized = React.useRef(false);

  useEffect(() => {
    if (data.recent.length > 0 && !initialized.current) {
      setLiveEvents(data.recent);
      initialized.current = true;
    }
  }, [data.recent]);

  const handleClearData = async () => {
    setLiveEvents([]);
    try {
      await fetch("/api/analytics/all", { method: "DELETE" });
      refresh();
    } catch (err) {
      console.error("Failed to clear data:", err);
    }
  };

  const wsLabel = status === "connected" ? "Live" : status === "connecting" ? "Connecting..." : "Offline";

  return (
    <div className="app-shell">
      <header className="header">
        <a className="header__logo" href="/" aria-label="EventFlow home">
          EventFlow
        </a>
        <div className="header__meta">
          <div className="ws-badge">
            {wsLabel}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="dashboard-col">
          <KPICards kpi={data.kpi} />

          <TimeSeriesChart data={data.timeseries} />

          <div className="charts-row">
            <FunnelChart steps={data.funnel} />
            <BreakdownChart data={data.breakdown} />
          </div>
        </div>

        <aside className="sidebar-col">
          <div className="card__header" style={{ borderBottom: "1px solid var(--border)", padding: "16px 18px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="card__title">
              Live Event Feed
              <span className="card__subtitle">{liveEvents.length} events</span>
            </span>
            <button 
              onClick={handleClearData} 
              aria-label="Clear live events"
              title="Clear feed"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "var(--border)"}
              onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </button>
          </div>
          <LiveFeed events={liveEvents} />
          <EventSimulator onEventSent={refresh} />
        </aside>
      </main>

    </div>
  );
};

export default App;
