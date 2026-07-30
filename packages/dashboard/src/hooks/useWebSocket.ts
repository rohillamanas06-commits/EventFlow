import { useEffect, useRef, useState, useCallback } from "react";
import { RawEvent, WSMessage } from "@analytics/shared";

type WSStatus = "connecting" | "connected" | "disconnected" | "error";

export function useWebSocket(
  onNewEvent: (event: RawEvent) => void,
  onKpiUpdate?: () => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WSStatus>("disconnected");
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const onNewEventRef = useRef(onNewEvent);
  const onKpiUpdateRef = useRef(onKpiUpdate);

  useEffect(() => { onNewEventRef.current = onNewEvent; }, [onNewEvent]);
  useEffect(() => { onKpiUpdateRef.current = onKpiUpdate; }, [onKpiUpdate]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `${proto}://${window.location.host}/ws`;

    setStatus("connecting");
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus("connected");

    ws.onmessage = (evt) => {
      try {
        const msg: WSMessage = JSON.parse(evt.data as string);
        if (msg.type === "NEW_EVENT") {
          onNewEventRef.current(msg.payload as RawEvent);
          onKpiUpdateRef.current?.();
        }
      } catch {}
    };

    ws.onclose = () => {
      setStatus("disconnected");
      reconnectTimer.current = setTimeout(connect, 3_000);
    };

    ws.onerror = () => setStatus("error");
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { status };
}
