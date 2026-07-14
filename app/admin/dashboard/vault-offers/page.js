"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "../page";

export default function AdminVaultOffers() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [counterAmounts, setCounterAmounts] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("liveid_admin");
    if (!stored) { router.push("/admin"); return; }
    const { token, admin } = JSON.parse(stored);
    setToken(token);
    setAdmin(admin);
    fetchOffers(token);
  }, []);

  function fetchOffers(tk) {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vault-offers`, {
      headers: { Authorization: `Bearer ${tk}` },
    })
      .then((r) => r.json())
      .then((data) => setOffers(data.offers || []))
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }

  async function handleUpdate(offerId, status, counterAmount) {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vault-offers/${offerId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status, counterAmount: counterAmount || null }),
      });
      if (!res.ok) throw new Error("Update failed");
      setSuccess(`Offer ${status.toLowerCase()}.`);
      fetchOffers(token);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("liveid_admin");
    router.push("/admin");
  }

  const statusColor = (s) => ({
    PENDING: "#fb923c", ACCEPTED: "#4ade80",
    REJECTED: "#f87171", COUNTERED: "#60a5fa",
  }[s] || "#94a3b8");

  const statusBg = (s) => ({
    PENDING: "#422006", ACCEPTED: "#052e16",
    REJECTED: "#450a0a", COUNTERED: "#1e3a5f",
  }[s] || "#1e293b");

  return (
    <AdminShell admin={admin} onLogout={handleLogout}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", margin: 0 }}>
          Vault Offers <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 400 }}>({offers.length} total)</span>
        </h2>
      </div>

      {error && <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: 12 }}>{error}</p>}
      {success && <p style={{ color: "#4ade80", fontSize: "0.85rem", marginBottom: 12 }}>{success}</p>}

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {offers.map((offer) => (
            <div key={offer.id} style={{ background: "#1e293b", borderRadius: 12, padding: "1.5rem", border: "1px solid #334155" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <p style={{ fontFamily: "monospace", fontSize: "1rem", color: "#3b82f6", fontWeight: 700, margin: 0 }}>
                    liveid.asia/{offer.vaultHandle?.name}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "4px 0 0" }}>
                    Buy Now: RM {offer.vaultHandle?.buyNowPrice?.toLocaleString()}
                  </p>
                </div>
                <span style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: 4, background: statusBg(offer.status), color: statusColor(offer.status) }}>
                  {offer.status}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
                <InfoBox label="Offeror" value={offer.name} />
                <InfoBox label="Phone" value={offer.phone} />
                <InfoBox label="Email" value={offer.email} />
                <InfoBox label="Offer Amount" value={`RM ${offer.offerAmount?.toLocaleString()}`} color="#22c55e" />
                {offer.counterAmount && <InfoBox label="Counter Amount" value={`RM ${offer.counterAmount?.toLocaleString()}`} color="#60a5fa" />}
                <InfoBox label="Date" value={new Date(offer.createdAt).toLocaleDateString("en-MY")} />
              </div>

              {offer.message && (
                <p style={{ fontSize: "0.82rem", color: "#94a3b8", background: "#0f172a", padding: "10px 12px", borderRadius: 8, marginBottom: 12 }}>
                  {offer.message}
                </p>
              )}

              {offer.status === "PENDING" && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleUpdate(offer.id, "ACCEPTED")}
                    style={{ padding: "8px 16px", background: "#22c55e", color: "white", border: "none", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleUpdate(offer.id, "REJECTED")}
                    style={{ padding: "8px 16px", background: "#450a0a", color: "#f87171", border: "1px solid #7f1d1d", borderRadius: 8, fontSize: "0.82rem", cursor: "pointer" }}
                  >
                    Reject
                  </button>
                  <input
                    type="number"
                    placeholder="Counter amount (RM)"
                    value={counterAmounts[offer.id] || ""}
                    onChange={(e) => setCounterAmounts({ ...counterAmounts, [offer.id]: e.target.value })}
                    style={{ padding: "8px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "white", fontSize: "0.82rem", outline: "none", width: 180 }}
                  />
                  <button
                    onClick={() => handleUpdate(offer.id, "COUNTERED", parseFloat(counterAmounts[offer.id]))}
                    style={{ padding: "8px 16px", background: "#1e3a5f", color: "#60a5fa", border: "1px solid #1d4ed8", borderRadius: 8, fontSize: "0.82rem", cursor: "pointer" }}
                  >
                    Send Counter
                  </button>
                </div>
              )}
            </div>
          ))}
          {offers.length === 0 && (
            <p style={{ textAlign: "center", color: "#64748b" }}>No vault offers yet.</p>
          )}
        </div>
      )}
    </AdminShell>
  );
}

function InfoBox({ label, value, color = "#e2e8f0" }) {
  return (
    <div style={{ background: "#0f172a", borderRadius: 8, padding: "10px 12px", border: "1px solid #334155" }}>
      <p style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: "0.88rem", color, fontWeight: 500, margin: 0 }}>{value}</p>
    </div>
  );
}