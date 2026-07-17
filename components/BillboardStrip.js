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
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 1.5rem",
          borderBottom: "1px solid #1a2f4a",
        }}
      >
        <span
          className="font-mono"
          style={{
            fontSize: "0.65rem",
            color: "#4ADE80",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          ▶ LIVE — Premium Handle Index
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: "0.65rem",
            color: "#4ADE80",
            letterSpacing: "0.08em",
          }}
        >
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
            animation: "tickerScroll 30s linear infinite",
            whiteSpace: "nowrap",
          }}
        >
          {items.map((h, i) => (
            <span
              key={`${h.name}-${i}`}
              className="font-mono"
              style={{
                fontSize: "0.8rem",
                color: "#4ADE80",
                letterSpacing: "0.06em",
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
      `}</style>
    </div>
  );
}