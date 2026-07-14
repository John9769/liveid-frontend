"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "../page";

export default function AdminUsers() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("liveid_admin");
    if (!stored) { router.push("/admin"); return; }
    const { token, admin } = JSON.parse(stored);
    setToken(token);
    setAdmin(admin);
    fetchUsers(token, "", 1);
  }, []);

  function fetchUsers(tk, q, pg) {
    setLoading(true);
    const params = new URLSearchParams({ page: pg, limit: 20 });
    if (q) params.append("search", q);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?${params}`, {
      headers: { Authorization: `Bearer ${tk}` },
    })
      .then((r) => r.json())
      .then((data) => { setUsers(data.users || []); setTotal(data.total || 0); })
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    fetchUsers(token, search, 1);
  }

  function handleLogout() {
    localStorage.removeItem("liveid_admin");
    router.push("/admin");
  }

  return (
    <AdminShell admin={admin} onLogout={handleLogout}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", margin: 0 }}>
          Users <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 400 }}>({total} total)</span>
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
            placeholder="Search handle, email, phone…"
            style={{ padding: "8px 12px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "white", fontSize: "0.85rem", outline: "none", width: 260 }}
          />
          <button
            onClick={handleSearch}
            style={{ padding: "8px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: 8, fontSize: "0.85rem", cursor: "pointer" }}
          >
            Search
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
                {["Generic ID", "Handle", "Tier", "Status", "Expiry", "Registered"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const isExpired = u.registrationExpiry && new Date() > new Date(u.registrationExpiry);
                return (
                  <tr
                    key={u.id}
                    onClick={() => router.push(`/admin/dashboard/users/${u.id}`)}
                    style={{ borderBottom: i < users.length - 1 ? "1px solid #334155" : "none", cursor: "pointer" }}
                  >
                    <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#94a3b8", fontFamily: "monospace" }}>{u.genericId}</td>
                    <td style={{ padding: "12px 16px", fontSize: "0.85rem", color: "#e2e8f0", fontFamily: "monospace" }}>
                      {u.activeHandle ? `liveid.asia/${u.activeHandle.name}` : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#94a3b8" }}>{u.tier}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "0.75rem", padding: "3px 8px", borderRadius: 4, background: isExpired ? "#450a0a" : "#052e16", color: isExpired ? "#f87171" : "#4ade80" }}>
                        {isExpired ? "EXPIRED" : "ACTIVE"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#94a3b8" }}>
                      {u.registrationExpiry ? new Date(u.registrationExpiry).toLocaleDateString("en-MY") : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#94a3b8" }}>
                      {new Date(u.createdAt).toLocaleDateString("en-MY")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {users.length === 0 && (
            <p style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>No users found.</p>
          )}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: "1.5rem" }}>
          <button
            onClick={() => { const p = page - 1; setPage(p); fetchUsers(token, search, p); }}
            disabled={page === 1}
            style={{ padding: "8px 16px", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem" }}
          >
            ← Prev
          </button>
          <span style={{ padding: "8px 16px", color: "#64748b", fontSize: "0.85rem" }}>
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => { const p = page + 1; setPage(p); fetchUsers(token, search, p); }}
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