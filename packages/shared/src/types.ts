export interface RawEvent {
  id: string;
  name: string;
  userId: string;
  sessionId: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

export interface IngestEventPayload {
  name: string;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

export interface KPIOverview {
  totalEvents: number;
  uniqueUsers: number;
  uniqueSessions: number;
  eventsPerMinute: number;
  periodMinutes: number;
}

export interface TimeseriesPoint {
  bucket: string;
  count: number;
}

export interface BreakdownItem {
  name: string;
  count: number;
  percentage: number;
}

export interface FunnelStep {
  name: string;
  count: number;
  dropoff: number;
  rate: number;
}

export interface AnalyticsOverview {
  kpi: KPIOverview;
  timeseries: TimeseriesPoint[];
  breakdown: BreakdownItem[];
  funnel: FunnelStep[];
  recent: RawEvent[];
}

export type WSMessageType = "NEW_EVENT" | "KPI_UPDATE" | "PING";

export interface WSMessage<T = unknown> {
  type: WSMessageType;
  payload: T;
}
