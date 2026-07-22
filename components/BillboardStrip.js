"use client";

import { useEffect, useState } from "react";
import { getBillboard } from "../lib/api";

export default function BillboardStrip() {
  const [handles, setHandles] = useState([]);

  useEffect(() => {
    getBillboard()
      .then((data) => setHandles(data.billboard || []))
      .catch(() => setHandles([]));
  }, []);

  if (!handles.length) return null;

  // Duplicate for seamless loop
  const items = [...handles, ...handles, ...handles];

  // Speed is set by distance, not by a fixed duration. Seeding more curated
  // words makes the strip longer, and a fixed 90s would then scroll faster
  // to cover it in the same time. Roughly 22 seconds per item keeps the
  // reading pace the same however many handles are in the index.
  const duration = Math.max(50, handles.length * 9);

  return (
    <div
      style={{
        background: "#0A1628",
        borderBottom: "1px solid #1a2f4a",
        padding: "0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header row.
          Stacks on a phone and sits on one line from 640px up. On mobile
          space-between pushed the two labels together until they read as a
          single run-on sentence, so the split is explicit instead. */}
      <div className="billboard-head">
        <span className="font-mono billboard-label">
          ▶ LIVE — Premium Handle Index
        </span>
        <span className="font-mono billboard-tag">
          Grab yours before someone else claims it
        </span>
      </div>

      {/* Scrolling ticker */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 0",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "2rem",
            animation: `tickerScroll ${duration}s linear infinite`,
            whiteSpace: "nowrap",
            willChange: "transform",
            backfaceVisibility: "hidden",
            transform: "translateZ(0)",
          }}
        >
          {items.map((h, i) => (
            <span
              key={`${h.name}-${i}`}
              className="font-mono"
              style={{
                fontSize: "0.8rem",
                color: "#4ADE80",
                letterSpacing: "0.02em",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span style={{ color: "#1a4a2e", fontSize: "0.7rem" }}>◆</span>
              liveid.asia/{h.example}
              <span style={{ color: "#1a4a2e" }}>RM{h.variantPrice}</span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }

        .billboard-head {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 3px;
          padding: 7px 1.25rem;
          border-bottom: 1px solid #1a2f4a;
        }

        .billboard-label {
          font-size: 0.66rem;
          color: #4ADE80;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          line-height: 1.4;
        }

        .billboard-tag {
          font-size: 0.66rem;
          color: #2f7d52;
          letter-spacing: 0.01em;
          line-height: 1.4;
        }

        @media (min-width: 640px) {
          .billboard-head {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            gap: 2rem;
            padding: 6px 1.5rem;
          }
          .billboard-tag {
            text-align: right;
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
}