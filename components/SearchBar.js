"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { searchHandle } from "../lib/api";

export default function SearchBar() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchHandle(query.trim());
      setResults(data);
    } catch (err) {
      setError("Couldn't check that name. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClaim(handleName) {
    router.push(`/${locale}/register?handle=${encodeURIComponent(handleName)}`);
  }

  return (
    <div>
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 6,
          background: "var(--mist)",
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            background: "transparent",
            padding: "10px 12px",
            fontSize: "1rem",
            outline: "none",
            color: "var(--ink)",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            flexShrink: 0,
            border: "none",
            background: "var(--trust-blue)",
            color: "white",
            padding: "10px 20px",
            borderRadius: 8,
            fontWeight: 500,
            fontSize: "0.95rem",
            cursor: loading ? "default" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? t("checking") : t("searchButton")}
        </button>
      </form>

      {error && (
        <p style={{ color: "#B3261E", fontSize: "0.9rem", marginTop: 10 }}>
          {error}
        </p>
      )}

      {results && (
        <div style={{ marginTop: 16, textAlign: "left" }}>
          {results.exact.available && (
            <ResultRow
              item={results.exact}
              highlight
              claimLabel={t("claim")}
              onClaim={() => handleClaim(results.exact.name)}
            />
          )}
          {results.variants?.map((v) => (
            <ResultRow
              key={v.name}
              item={v}
              claimLabel={t("claim")}
              onClaim={() => handleClaim(v.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ResultRow({ item, highlight, claimLabel, onClaim }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        border: "1px solid var(--border)",
        borderRadius: 8,
        marginBottom: 8,
        background: highlight ? "var(--mist)" : "white",
      }}
    >
      <span className="font-mono" style={{ fontSize: "0.95rem", wordBreak: "break-all", minWidth: 0 }}>
        {item.name}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          RM {item.price}
        </span>
        <button
          onClick={onClaim}
          style={{
            border: "1px solid var(--trust-blue)",
            background: "white",
            color: "var(--trust-blue)",
            borderRadius: 6,
            padding: "6px 14px",
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {claimLabel}
        </button>
      </div>
    </div>
  );
}