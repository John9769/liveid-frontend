"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "../page";

// Matched exactly to VALID_PRICING_KEYS in the backend (17 keys).
const KEY_LABELS = {
  REGISTRATION_FEE: "Registration Fee",
  STANDARD_HANDLE_BASE: "Standard Handle Base Price",
  CURATED_ADDON: "Curated Word Add-on",
  ANNUAL_RENEWAL: "Annual Renewal — Standard",
  RENEWAL_SPECIAL: "Annual Renewal — Special",
  RENEWAL_SILVER: "Annual Renewal — Silver",
  RENEWAL_GOLDEN: "Annual Renewal — Golden",
  TITLE_RENEWAL_PERCENT: "Title Renewal — % of Purchase",
  GATEWAY_FEE: "Gateway Fee (ToyyibPay)",
  REFERRAL_STANDARD_REG: "Referral — Standard Registration",
  REFERRAL_STANDARD_RENEWAL: "Referral — Standard Renewal",
  REFERRAL_PREMIUM_PERCENT: "Referral — Premium/Curated %",
  REFERRAL_TITLE_PERCENT: "Referral — Title %",
  SUPER_REFERRAL_STANDARD_REG: "Super Referral Override — Standard Reg",
  SUPER_REFERRAL_STANDARD_RENEWAL: "Super Referral Override — Standard Renewal",
  SUPER_REFERRAL_PREMIUM_PERCENT: "Super Referral Override — Premium/Curated %",
  SUPER_REFERRAL_TITLE_PERCENT: "Super Referral Override — Title %",
};

// The five keys the backend treats as percentages, not ringgit.
const KEY_FORMAT = {
  TITLE_RENEWAL_PERCENT: "percent",
  REFERRAL_PREMIUM_PERCENT: "percent",
  REFERRAL_TITLE_PERCENT: "percent",
  SUPER_REFERRAL_PREMIUM_PERCENT: "percent",
  SUPER_REFERRAL_TITLE_PERCENT: "percent",
};

export default function AdminPricing() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("liveid_admin");
    if (!stored) { router.push("/admin"); return; }
    const { token, admin } = JSON.parse(stored);
    setToken(token);
    setAdmin(admin);
    fetchPricing(token);
  }, []);

  function fetchPricing(tk) {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/pricing`, {
      headers: { Authorization: `Bearer ${tk}` },
    })
      .then((r) => r.json())
      .then((data) => setPricing(data.pricing || []))
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }

  async function handleSave(key) {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/pricing/${key}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ value: parseFloat(editValue) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setSuccess(`${KEY_LABELS[key] || key} updated successfully.`);
      setEditing(null);
      setEditValue("");
      fetchPricing(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("liveid_admin");
    router.push("/admin");
  }

  return (
    <AdminShell admin={admin} onLogout={handleLogout}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", margin: 0 }}>
          Pricing Config
        </h2>
        <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: 6 }}>
          Changes take effect immediately. All fees are read from DB — no hardcoding.
        </p>
      </div>

      {error && <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: 12 }}>{error}</p>}
      {success && <p style={{ color: "#4ade80", fontSize: "0.85rem", marginBottom: 12 }}>{success}</p>}

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pricing.map((item) => {
            const isPercent = KEY_FORMAT[item.key] === "percent";
            const isEditing = editing === item.key;

            return (
              <div
                key={item.key}
                style={{ background: "#1e293b", borderRadius: 10, padding: "1.25rem 1.5rem", border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#e2e8f0", margin: 0 }}>
                    {KEY_LABELS[item.key] || item.key}
                  </p>
                  {item.description && (
                    <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "3px 0 0" }}>{item.description}</p>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {isEditing ? (
                    <>
                      <div style={{ display: "flex", alignItems: "center", background: "#0f172a", border: "1px solid #3b82f6", borderRadius: 8, overflow: "hidden" }}>
                        {!isPercent && <span style={{ padding: "0 10px", color: "#64748b", fontSize: "0.85rem" }}>RM</span>}
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSave(item.key)}
                          step="0.01"
                          style={{ padding: "8px 10px", background: "transparent", border: "none", color: "white", fontSize: "0.9rem", outline: "none", width: 100 }}
                        />
                        {isPercent && <span style={{ padding: "0 10px", color: "#64748b", fontSize: "0.85rem" }}>%</span>}
                      </div>
                      <button
                        onClick={() => handleSave(item.key)}
                        disabled={saving}
                        style={{ padding: "8px 16px", background: "#22c55e", color: "white", border: "none", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
                      >
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={() => { setEditing(null); setEditValue(""); }}
                        style={{ padding: "8px 12px", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, fontSize: "0.82rem", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#22c55e", margin: 0, minWidth: 80, textAlign: "right" }}>
                        {isPercent ? `${item.value}%` : `RM ${item.value.toFixed(2)}`}
                      </p>
                      <button
                        onClick={() => { setEditing(item.key); setEditValue(item.value); }}
                        style={{ padding: "6px 14px", background: "#1e3a5f", color: "#60a5fa", border: "1px solid #1d4ed8", borderRadius: 8, fontSize: "0.82rem", cursor: "pointer" }}
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}