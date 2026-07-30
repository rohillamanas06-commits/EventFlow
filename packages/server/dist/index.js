"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("./ws");
const events_1 = __importDefault(require("./routes/events"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const PORT = Number(process.env.PORT ?? 4000);
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "*" }));
app.use(express_1.default.json({ limit: "1mb" }));
app.use((req, _res, next) => {
    next();
});
app.use("/api/events", events_1.default);
app.use("/api/analytics", analytics_1.default);
app.get("/health", (_req, res) => {
    res.json({ status: "ok", ts: new Date().toISOString() });
});
const server = http_1.default.createServer(app);
(0, ws_1.initWebSocket)(server);
server.listen(PORT, () => {
});
