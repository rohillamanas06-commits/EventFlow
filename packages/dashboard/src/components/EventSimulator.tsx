import React, { useState, useRef } from "react";

interface Props {
  onEventSent: () => void;
  onToast: (msg: string) => void;
}

const EVENT_TYPES = [
  { name: "page_view", color: "#6366f1" },
  { name: "click", color: "#14b8a6" },
  { name: "signup", color: "#f59e0b" },
  { name: "purchase", color: "#10b981" },
  { name: "error", color: "#f43f5e" },
];

async function sendEvent(
  name: string,
  userId: string,
  sessionId: string,
  props: Record<string, unknown> = {}
) {
  const res = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, userId, sessionId, properties: props }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

const EventSimulator: React.FC<Props> = ({ onEventSent, onToast }) => {
  const [userId, setUserId] = useState("user-001");
  const [sessionId, setSessionId] = useState("sess-abc123");
  const [loading, setLoading] = useState<string | null>(null);
  const burstRef = useRef(false);

  const fire = async (eventName: string, props?: Record<string, unknown>) => {
    setLoading(eventName);
    try {
      await sendEvent(eventName, userId, sessionId, props);
      onEventSent();
      onToast(`Success: ${eventName} fired`);
    } catch {
      onToast(`Failed to send ${eventName}`);
    } finally {
      setLoading(null);
    }
  };

  const burst = async () => {
    if (burstRef.current) return;
    burstRef.current = true;
    onToast("Firing burst of 20 events...");

    const events = [
      ...Array(8).fill("page_view"),
      ...Array(5).fill("click"),
      ...Array(3).fill("signup"),
      ...Array(2).fill("purchase"),
      ...Array(2).fill("error"),
    ];

    for (let i = 0; i < events.length; i += 4) {
      const batch = events.slice(i, i + 4);
      await Promise.all(
        batch.map((name) =>
          sendEvent(name, `user-${Math.ceil(Math.random() * 5).toString().padStart(3, "0")}`, `sess-${Math.random().toString(36).slice(2, 8)}`)
        )
      );
      await new Promise((r) => setTimeout(r, 300));
    }

    onEventSent();
    onToast("Burst complete - 20 events ingested");
    burstRef.current = false;
  };

  return (
    <div className="simulator">
      <div className="simulator__title">Event Simulator</div>

      <div className="simulator__input-row">
        <input
          className="sim-input"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          id="sim-user-id"
        />
        <input
          className="sim-input"
          placeholder="Session ID"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          id="sim-session-id"
        />
      </div>

      <div className="simulator__grid">
        {EVENT_TYPES.map((et) => (
          <button
            key={et.name}
            id={`sim-btn-${et.name}`}
            className="sim-btn"
            onClick={() =>
              fire(et.name, et.name === "purchase" ? { amount: +(Math.random() * 200).toFixed(2), currency: "USD" } : undefined)
            }
            disabled={loading !== null}
            style={{ opacity: loading && loading !== et.name ? 0.5 : 1 }}
          >

            {loading === et.name ? "..." : et.name}
          </button>
        ))}
      </div>

      <button id="sim-burst" className="sim-burst-btn" onClick={burst}>
        Burst 20 Random Events
      </button>
    </div>
  );
};

export default EventSimulator;
