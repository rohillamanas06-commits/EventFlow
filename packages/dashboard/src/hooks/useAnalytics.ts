import { useState, useEffect, useCallback, useRef } from "react";
import { AnalyticsOverview } from "@analytics/shared";

const API = "/api/analytics";

const EMPTY: AnalyticsOverview = {
  kpi: { totalEvents: 0, uniqueUsers: 0, uniqueSessions: 0, eventsPerMinute: 0, periodMinutes: 60 },
  timeseries: [],
  breakdown: [],
  funnel: [],
  recent: [],
};

export function useAnalytics(refreshInterval = 10_000) {
  const [data, setData] = useState<AnalyticsOverview>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch(`${API}/all`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: AnalyticsOverview = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    timerRef.current = setInterval(fetchAll, refreshInterval);
    return () => clearInterval(timerRef.current);
  }, [fetchAll, refreshInterval]);

  return { data, loading, error, refresh: fetchAll };
}
