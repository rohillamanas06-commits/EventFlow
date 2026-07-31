import React from "react";
import { RawEvent } from "@analytics/shared";
import { formatDistanceToNow, parseISO } from "date-fns";

interface Props {
  events: RawEvent[];
}

const EVENT_COLORS: Record<string, string> = {
  page_view: "#6366f1",
  click: "#14b8a6",
  purchase: "#10b981",
  signup: "#f59e0b",
  error: "#f43f5e",
};

const LiveFeed: React.FC<Props> = ({ events }) => (
  <div className="live-feed">
    {events.length === 0 ? (
      <div className="feed-empty">
        <div style={{ fontSize: 28, marginBottom: 8 }}>-</div>
        No Events
      </div>
    ) : (
      events.slice(0, 50).map((evt) => (
        <div key={evt.id} className="feed-item">
          <div>
            <div className="feed-item__name">{evt.name}</div>
            <div className="feed-item__meta">
              {evt.userId.slice(0, 10)}... · {evt.sessionId.slice(0, 8)}...
            </div>
          </div>
          <div className="feed-item__time">
            {formatDistanceToNow(parseISO(evt.timestamp), { addSuffix: true })}
          </div>
        </div>
      ))
    )}
  </div>
);

export default LiveFeed;
