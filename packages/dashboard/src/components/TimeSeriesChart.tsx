import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TimeseriesPoint } from "@analytics/shared";
import { format, parseISO, isValid } from "date-fns";

interface Props {
  data: TimeseriesPoint[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const raw: string = payload[0]?.payload?.bucket ?? "";
  let timeLabel = "";
  try {
    const d = parseISO(raw);
    if (isValid(d)) timeLabel = format(d, "HH:mm, MMM d");
  } catch {}
  return (
    <div style={{
      background: "#1e2736",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 12,
      color: "#e2e8f0",
    }}>
      {timeLabel && <div style={{ color: "#94a3b8", marginBottom: 4 }}>{timeLabel}</div>}
      <div style={{ fontWeight: 600 }}>{payload[0].value} events</div>
    </div>
  );
};

const TimeSeriesChart: React.FC<Props> = ({ data }) => {
  const formatted = data.map((d) => {
    let display = d.bucket;
    try {
      const parsed = parseISO(d.bucket);
      if (isValid(parsed)) display = format(parsed, "HH:mm");
    } catch {}
    return { ...d, display };
  });

  return (
    <div className="card">
      <div className="card__header">
        <span className="card__title">
          Events Over Time
          <span className="card__subtitle">Last 60 minutes · per minute</span>
        </span>
      </div>
      <div className="card__body">
        <div className="chart-wrap">
          {formatted.length === 0 ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", color:"var(--text-muted)", fontSize:13 }}>
              No data yet - fire some events!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formatted} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="display"
                  tick={{ fill: "#475569", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "#475569", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(99,102,241,0.3)", strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#areaGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeSeriesChart;
