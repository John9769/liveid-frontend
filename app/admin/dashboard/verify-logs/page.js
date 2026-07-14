"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "../page";

export default function AdminVerifyLogs() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [handleFilter, setHandleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("liveid_admin");
    if (!stored) { router.push("/admin"); return; }
    const { token, admin } = JSON.parse(stored);
    setToken(token);
    setAdmin(admin);
    fetchLogs(token, "", 1);
  }, []);

  function fetchLogs(tk, handle, pg) {
    setLoading(true);
    const params = new URLSearchParams({ page: pg, limit: 50 });
    if (handle) params.append("handleName", handle);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/verify-logs?${params}`, {
      headers: { Authorization: `Bearer ${tk}` },
    })
      .then((r) => r.json())
      .then((data) => { setLogs(data.logs || []); setTotal(data.total || 0); })
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }

  function handleFilter_() {
    setPage(1);
    fetchLogs(token, handleFilter, 1);
  }

  function handleLogout() {
    localStorage.removeItem("liveid_admin");
    router.push("/admin");
  }

  return (
    <AdminShell admin={admin} onLogout={handleLogout}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", margin: 0 }}>
          Verify Logs <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 400 }}>({total} total)</span>
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={handleFilter}
            onChange={(e) => setHandleFilter(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter_()}
            placeholder="Filter by handle…"
            style={{ padding: "8px 12px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "white", fontSize: "0.85rem", outline: "none", width: 220 }}
          />
          <button
            onClick={handleFilter_}
            style={{ padding: "8px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: 8, fontSize: "0.85rem", cursor: "pointer" }}
          >
            Filter
          </button>
          {handleFilter && (
            <button
              onClick={() => { setHandleFilter(""); fetchLogs(token, "", 1); setPage(1); }}
              style={{ padding: "8px 16px", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, fontSize: "0.85rem", cursor: "pointer" }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading…</p>
      ) : (
        <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                {["Handle", "IP", "Referer", "User Agent", "Time"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={log.id} style={{ borderBottom: i < logs.length - 1 ? "1px solid #334155" : "none" }}>
                  <td style={{ padding: "10px 16px", fontSize: "0.85rem", color: "#3b82f6", fontFamily: "monospace" }}>
                    liveid.asia/{log.handleName}
                  </td>
                  <td style={{ padding: "10px 16px", fontSize: "0.82rem", color: "#94a3b8", fontFamily: "monospace" }}>
                    {log.ip || "—"}
                  </td>
                  <td style={{ padding: "10px 16px", fontSize: "0.78rem", color: "#64748b", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.referer || "—"}
                  </td>
                  <td style={{ padding: "10px 16px", fontSize: "0.72rem", color: "#64748b", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.userAgent || "—"}
                  </td>
                  <td style={{ padding: "10px 16px", fontSize: "0.82rem", color: "#64748b", whiteSpace: "nowrap" }}>
                    {new Date(log.createdAt).toLocaleString("en-MY")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <p style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>No verify logs found.</p>
          )}
        </div>
      )}

      {total > 50 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: "1.5rem" }}>
          <button
            onClick={() => { const p = page - 1; setPage(p); fetchLogs(token, handleFilter, p); }}
            disabled={page === 1}
            style={{ padding: "8px 16px", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem" }}
          >
            ← Prev
          </button>
          <span style={{ padding: "8px 16px", color: "#64748b", fontSize: "0.85rem" }}>
            Page {page} of {Math.ceil(total / 50)}
          </span>
          <button
            onClick={() => { const p = page + 1; setPage(p); fetchLogs(token, handleFilter, p); }}
            disabled={page >= Math.ceil(total / 50)}
            style={{ padding: "8px 16px", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem" }}
          >
            Next →
          </button>
        </div>
      )}

    </AdminShell>
  );
}