"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocket = initWebSocket;
exports.broadcast = broadcast;
const ws_1 = require("ws");
let wss = null;
function initWebSocket(server) {
    wss = new ws_1.WebSocketServer({ server, path: "/ws" });
    wss.on("connection", (ws) => {
        ws.on("pong", () => { });
        ws.on("close", () => { });
    });
    setInterval(() => {
        wss.clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.ping();
            }
        });
    }, 30000);
}
function broadcast(message) {
    if (!wss)
        return;
    const data = JSON.stringify(message);
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(data);
        }
    });
}
