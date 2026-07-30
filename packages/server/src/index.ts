import express from "express";
import cors from "cors";
import http from "http";
import { initWebSocket } from "./ws";
import eventsRouter from "./routes/events";
import analyticsRouter from "./routes/analytics";

const PORT = Number(process.env.PORT ?? 4000);

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "1mb" }));

app.use((req, _res, next) => {
  next();
});

app.use("/api/events", eventsRouter);
app.use("/api/analytics", analyticsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, () => {
});
