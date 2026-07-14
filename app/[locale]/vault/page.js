"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import { getVaultHandles } from "../../../lib/api";

const TIER_ORDER = { VAULT: 0, VAULT_VARIANT: 1 };

export default function VaultPage() {
  const locale = useLocale();
  const router = useRouter();
  const [handles, setHandles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVaultHandles()
      .then((data) => setHandles(data.handles || []))
      .catch(() => setHandles([]))
      .finally(() => setLoading(false));
  }, []);

  const vaultHandles = handles.filter(h => h.tier === "VAULT");
  const variantHandles = handles.filter(h => h.tier === "VAULT_VARIANT");

  return (
    <div>
      <Navbar showLogin />
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "4rem 1.5rem" }}>

        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", padding: 0, marginBottom: "2rem" }}
        >
          ← Back
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p
            className="font-mono"
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              color: "var(--stamp-teal)",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            The Vault
          </p>
          <h1
            className="font-display"
            style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 600, color: "var(--ink)", marginBottom: "1rem" }}
          >
            Crown jewel handles.
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--text-muted)", maxWidth: 480, margin: "0 auto" }}>
            These handles are held in the LiveID Premium Reserve.
            Once sold, they are gone forever. No resale. No auction.
          </p>
        </div>

        {loading && (
          <p style={{ textAlign: "center", color: "var(--text-muted)" }}>Loading…</p>
        )}

        {/* Vault handles */}
        {vaultHandles.length > 0 && (
          <div style={{ marginBottom: "3rem" }}>
            <p
              className="font-mono"
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                color: "var(--stamp-teal)",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              Crown Jewels
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {vaultHandles.map((h) => (
                <VaultCard key={h.id} handle={h} locale={locale} />
              ))}
            </div>
          </div>
        )}

        {/* Variant handles */}
        {variantHandles.length > 0 && (
          <div>
            <p
              className="font-mono"
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              Premium Variants
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {variantHandles.map((h) => (
                <VaultCard key={h.id} handle={h} locale={locale} />
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

function VaultCard({ handle, locale }) {
  return (
    <Link
      href={`/${locale}/vault/${handle.name}`}
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "16px",
        background: "white",
        display: "block",
      }}
    >
      <p
        className="font-mono"
        style={{ fontSize: "0.85rem", color: "var(--ink)", marginBottom: 8, wordBreak: "break-all" }}
      >
        liveid.asia/{handle.name}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--stamp-teal)",
          }}
        >
          RM {handle.buyNowPrice?.toLocaleString()}
        </span>
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: "2px 8px",
          }}
        >
          {handle.status}
        </span>
      </div>
      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 6 }}>
        Renewal: RM {handle.renewalFee?.toLocaleString()}/year
      </p>
    </Link>
  );
}