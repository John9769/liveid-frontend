"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { getVaultBillboard } from "../../../lib/api";

export default function VaultPage() {
  const locale = useLocale();
  const router = useRouter();
  const [handles, setHandles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getVaultBillboard()
      .then((data) => {
        if (cancelled) return;
        setHandles(data.billboard || []);
      })
      .catch(() => { if (!cancelled) setHandles([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const money = (n) => `RM ${Number(n || 0).toLocaleString("en-MY")}`;

  const available = handles;
  const prices = available.map((h) => h.buyNowPrice).filter(Boolean);
  const lowest = prices.length ? Math.min(...prices) : null;
  const highest = prices.length ? Math.max(...prices) : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <Navbar showLogin />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem" }}>

        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p className="font-mono" style={{ fontSize: "0.72rem", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>
            The Vault
          </p>
          <h1 className="font-display" style={{ fontSize: "2rem", color: "var(--ink)", marginBottom: 12 }}>
            Crown Jewel Handles
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 440, margin: "0 auto" }}>
            One word. One owner. Once it is taken, it is gone forever — LiveID never
            releases a handle to a second person.
          </p>
        </div>

        {loading && (
          <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem 0" }}>
            Loading The Vault…
          </p>
        )}

        {!loading && available.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem 0" }}>
            No vault handles are available right now.
          </p>
        )}

        {!loading && available.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: "3rem" }}>
            {available.map((h) => (
              <button
                key={h.name}
                onClick={() => router.push(`/${locale}/vault/${h.name}`)}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "1.25rem",
                  background: "white",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <p className="font-mono" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)", margin: 0, wordBreak: "break-all" }}>
                  {h.name}
                </p>
                <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--trust-blue)", margin: 0 }}>
                  {money(h.buyNowPrice)}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
                  Renewal {money(h.renewalFee)}/year
                </p>
              </button>
            ))}
          </div>
        )}

        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem", background: "var(--mist)" }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>
            How The Vault works
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.9 }}>
            <li>Single dictionary words — the most valuable handles on LiveID</li>
            {lowest && highest && (
              <li>Buy now from {money(lowest)} to {money(highest)}</li>
            )}
            <li>Or make an offer — a reserve price applies to every handle</li>
            <li>Licensed annually, not sold. Renew to keep your verification live</li>
            <li>Once issued, a handle is never given to anyone else</li>
          </ul>
        </div>

      </main>
    </div>
  );
}