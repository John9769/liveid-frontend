"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Navbar from "../../../../components/Navbar";

export default function DashboardVerifyPage() {
  const locale = useLocale();
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");

  function handleSearch() {
    const clean = handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!clean) {
      setError("Please enter a handle.");
      return;
    }
    router.push(`/${locale}/verify/${clean}`);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <Navbar showLogin={false} />
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "3rem 1.5rem" }}>

        <button
          onClick={() => router.push(`/${locale}/dashboard`)}
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", padding: 0, marginBottom: "2rem" }}
        >
          ← Back to dashboard
        </button>

        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--ink)", marginBottom: "0.5rem" }}>
          Verify a handle
        </h1>
        <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "2rem", lineHeight: 1.6 }}>
          Enter someone&apos;s LiveID handle to confirm they are a verified human.
        </p>

        <div style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", background: "white" }}>
            <span style={{ padding: "0 12px", fontSize: "0.85rem", color: "var(--text-muted)", borderRight: "1px solid var(--border)", whiteSpace: "nowrap" }}>
              liveid.asia/
            </span>
            <input
              type="text"
              value={handle}
              onChange={(e) => { setHandle(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              placeholder="handlename"
              style={{ flex: 1, padding: "12px", border: "none", outline: "none", fontSize: "0.95rem", color: "var(--ink)" }}
            />
          </div>
          {error && <p style={{ fontSize: "0.8rem", color: "#B3261E", marginTop: 6 }}>{error}</p>}
        </div>

        <button
          onClick={handleSearch}
          style={{ width: "100%", background: "var(--trust-blue)", color: "white", border: "none", borderRadius: 8, padding: "12px", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer" }}
        >
          Verify now
        </button>

      </main>
    </div>
  );
}