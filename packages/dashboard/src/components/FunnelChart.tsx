import React from "react";
import { FunnelStep } from "@analytics/shared";

interface Props {
  steps: FunnelStep[];
}

const FunnelChart: React.FC<Props> = ({ steps }) => {
  const maxCount = Math.max(...steps.map((s) => s.count), 1);

  return (
    <div className="card">
      <div className="card__header">
        <span className="card__title">
          Conversion Funnel
          <span className="card__subtitle">Unique users per step</span>
        </span>
      </div>
      <div className="card__body">
        <div className="funnel-steps">
          {steps.map((step, i) => (
            <div key={step.name} className="funnel-step">
              <div className="funnel-step__label">
                <span className="funnel-step__name">
                  {step.name}
                </span>
                <span className="funnel-step__stats">
                  {step.count.toLocaleString()} users
                  {i > 0 && (
                    <span style={{ marginLeft: 8, color: step.rate > 50 ? "#10b981" : "#f43f5e" }}>
                      {step.rate}% conv.
                    </span>
                  )}
                </span>
              </div>
              <div className="funnel-bar-bg">
                <div
                  className="funnel-bar-fill"
                  style={{ width: `${maxCount === 0 ? 0 : (step.count / maxCount) * 100}%` }}
                />
              </div>
              {step.dropoff > 0 && (
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>
                  ↓ {step.dropoff} users dropped off
                </div>
              )}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default FunnelChart;
