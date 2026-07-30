import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { BreakdownItem } from "@analytics/shared";

const COLORS = ["#6366f1", "#14b8a6", "#f59e0b", "#f43f5e", "#10b981", "#8b5cf6"];

interface Props {
  data: BreakdownItem[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as BreakdownItem;
  return (
    <div style={{
      background: "#1e2736",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 12,
      color: "#e2e8f0",
    }}>
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{d.name}</div>
      <div style={{ color: "#94a3b8" }}>{d.count} events · {d.percentage}%</div>
    </div>
  );
};

const BreakdownChart: React.FC<Props> = ({ data }) => (
  <div className="card">
    <div className="card__header">
      <span className="card__title">Event Breakdown</span>
    </div>
    <div className="card__body">
      {data.length === 0 ? (
        <div style={{ padding: "20px 0", color: "var(--text-muted)", fontSize: 12, textAlign: "center" }}>
          No events yet
        </div>
      ) : (
        <>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="name"
                  innerRadius={44}
                  outerRadius={72}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="breakdown-list">
            {data.map((item, i) => (
              <div key={item.name} className="breakdown-item">
                <span className="breakdown-item__name" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length], display: "inline-block", flexShrink: 0 }} />
                  {item.name}
                </span>
                <span className="breakdown-item__count">{item.count}</span>
                <span className="breakdown-item__pct">{item.percentage}%</span>
                <div className="breakdown-item__bar-wrap">
                  <div
                    className="breakdown-item__bar"
                    style={{ width: `${item.percentage}%`, background: COLORS[i % COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  </div>
);

export default BreakdownChart;
