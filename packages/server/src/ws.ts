import { WebSocket, WebSocketServer } from "ws";
import { WSMessage } from "@analytics/shared";

let wss: WebSocketServer | null = null;

export function initWebSocket(server: import("http").Server): void {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    ws.on("pong", () => {});
    ws.on("close", () => {});
  });

  setInterval(() => {
    wss!.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.ping();
      }
    });
  }, 30_000);
}

export function broadcast<T>(message: WSMessage<T>): void {
  if (!wss) return;
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}
