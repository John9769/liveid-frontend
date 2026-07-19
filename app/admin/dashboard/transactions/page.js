"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "../page";

export default function AdminTransactions() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("liveid_admin");
    if (!stored) { router.push("/admin"); return; }
    const { token, admin } = JSON.parse(stored);
    setToken(token);
    setAdmin(admin);
    fetchTransactions(token, "", "", 1);
  }, []);

  function fetchTransactions(tk, type, status, pg) {
    setLoading(true);
    const params = new URLSearchParams({ page: pg, limit: 20 });
    if (type) params.append("type", type);
    if (status) params.append("status", status);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/transactions?${params}`, {
      headers: { Authorization: `Bearer ${tk}` },
    })
      .then((r) => r.json())
      .then((data) => { setTransactions(data.transactions || []); setTotal(data.total || 0); })
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }

  function handleFilter() {
    setPage(1);
    fetchTransactions(token, typeFilter, statusFilter, 1);
  }

  function handleLogout() {
    localStorage.removeItem("liveid_admin");
    router.push("/admin");
  }

  const statusColor = (s) => s === "SUCCESS" ? "#4ade80" : s === "PENDING" ? "#fb923c" : "#f87171";
  const statusBg = (s) => s === "SUCCESS" ? "#052e16" : s === "PENDING" ? "#422006" : "#450a0a";

  return (
    <AdminShell admin={admin} onLogout={handleLogout}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", margin: 0 }}>
          Transactions <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 400 }}>({total} total)</span>
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: "8px 12px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "white", fontSize: "0.85rem", outline: "none" }}
          >
            <option value="">All Types</option>
            <option value="REGISTRATION">Registration</option>
            <option value="RENEWAL">Renewal</option>
            <option value="PREMIUM_PURCHASE">Premium Purchase</option>
            <option value="PREMIUM_RENEWAL">Premium Renewal</option>
            <option value="TITLE_PURCHASE">Title Purchase</option>
            <option value="TITLE_RENEWAL">Title Renewal</option>
            <option value="REFERRAL_PAYOUT">Referral Payout</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "8px 12px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "white", fontSize: "0.85rem", outline: "none" }}
          >
            <option value="">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
          <button
            onClick={handleFilter}
            style={{ padding: "8px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: 8, fontSize: "0.85rem", cursor: "pointer" }}
          >
            Filter
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading…</p>
      ) : (
        <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                {["Handle", "Type", "Amount", "Status", "Referral", "Date"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: i < transactions.length - 1 ? "1px solid #334155" : "none" }}>
                  <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#e2e8f0", fontFamily: "monospace" }}>
                    {t.user?.activeHandle ? `liveid.asia/${t.user.activeHandle.name}` : t.user?.genericId || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#94a3b8" }}>{t.type}</td>
                  <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#22c55e", fontWeight: 600 }}>RM {t.amountRM?.toFixed(2)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: 4, background: statusBg(t.status), color: statusColor(t.status) }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#64748b" }}>
                    {t.referralCode || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#64748b" }}>
                    {new Date(t.createdAt).toLocaleDateString("en-MY")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <p style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>No transactions found.</p>
          )}
        </div>
      )}

      {total > 20 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: "1.5rem" }}>
          <button
            onClick={() => { const p = page - 1; setPage(p); fetchTransactions(token, typeFilter, statusFilter, p); }}
            disabled={page === 1}
            style={{ padding: "8px 16px", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem" }}
          >
            ← Prev
          </button>
          <span style={{ padding: "8px 16px", color: "#64748b", fontSize: "0.85rem" }}>
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => { const p = page + 1; setPage(p); fetchTransactions(token, typeFilter, statusFilter, p); }}
            disabled={page >= Math.ceil(total / 20)}
            style={{ padding: "8px 16px", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem" }}
          >
            Next →
          </button>
        </div>
      )}

    </AdminShell>
  );
}