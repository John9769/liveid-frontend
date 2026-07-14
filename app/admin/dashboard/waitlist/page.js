"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "../page";

const statusColor = (s) => ({
  WAITING: "#fb923c", NOTIFIED: "#60a5fa",
  CLAIMED: "#4ade80", EXPIRED: "#f87171",
}[s] || "#94a3b8");

const statusBg = (s) => ({
  WAITING: "#422006", NOTIFIED: "#1e3a5f",
  CLAIMED: "#052e16", EXPIRED: "#450a0a",
}[s] || "#1e293b");

export default function AdminWaitlist() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("liveid_admin");
    if (!stored) { router.push("/admin"); return; }
    const { token, admin } = JSON.parse(stored);
    setToken(token);
    setAdmin(admin);
    fetchWaitlist(token);
  }, []);

  function fetchWaitlist(tk) {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/waitlist`, {
      headers: { Authorization: `Bearer ${tk}` },
    })
      .then((r) => r.json())
      .then((data) => setWaitlist(data.waitlist || []))
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }

  async function handleStatusChange(id, status) {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/waitlist/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      setSuccess("Waitlist entry updated.");
      fetchWaitlist(token);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("liveid_admin");
    router.push("/admin");
  }

  const grouped = waitlist.reduce((acc, entry) => {
    if (!acc[entry.handleName]) acc[entry.handleName] = [];
    acc[entry.handleName].push(entry);
    return acc;
  }, {});

  return (
    <AdminShell admin={admin} onLogout={handleLogout}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", margin: 0 }}>
          Waitlist <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 400 }}>({waitlist.length} entries)</span>
        </h2>
      </div>

      {error && <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: 12 }}>{error}</p>}
      {success && <p style={{ color: "#4ade80", fontSize: "0.85rem", marginBottom: 12 }}>{success}</p>}

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading…</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p style={{ textAlign: "center", color: "#64748b" }}>No waitlist entries yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Object.entries(grouped).map(([handleName, entries]) => (
            <div key={handleName} style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #334155", background: "#0f172a" }}>
                <p style={{ fontFamily: "monospace", fontSize: "0.95rem", color: "#3b82f6", fontWeight: 700, margin: 0 }}>
                  liveid.asia/{handleName}
                </p>
                <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "2px 0 0" }}>
                  {entries.length} {entries.length === 1 ? "person" : "people"} waiting
                </p>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #334155" }}>
                    {["Name", "Email", "Phone", "Type", "Status", "Date", "Action"].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, i) => (
                    <tr key={entry.id} style={{ borderBottom: i < entries.length - 1 ? "1px solid #334155" : "none" }}>
                      <td style={{ padding: "10px 16px", fontSize: "0.85rem", color: "#e2e8f0" }}>{entry.name}</td>
                      <td style={{ padding: "10px 16px", fontSize: "0.82rem", color: "#94a3b8" }}>{entry.email}</td>
                      <td style={{ padding: "10px 16px", fontSize: "0.82rem", color: "#94a3b8" }}>{entry.phone}</td>
                      <td style={{ padding: "10px 16px", fontSize: "0.75rem", color: "#64748b" }}>{entry.type}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: 4, background: statusBg(entry.status), color: statusColor(entry.status) }}>
                          {entry.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px", fontSize: "0.78rem", color: "#64748b", whiteSpace: "nowrap" }}>
                        {new Date(entry.createdAt).toLocaleDateString("en-MY")}
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        {entry.status === "WAITING" && (
                          <button
                            onClick={() => handleStatusChange(entry.id, "NOTIFIED")}
                            style={{ fontSize: "0.75rem", padding: "4px 10px", background: "#1e3a5f", color: "#60a5fa", border: "1px solid #1d4ed8", borderRadius: 6, cursor: "pointer" }}
                          >
                            Mark Notified
                          </button>
                        )}
                        {entry.status === "NOTIFIED" && (
                          <button
                            onClick={() => handleStatusChange(entry.id, "CLAIMED")}
                            style={{ fontSize: "0.75rem", padding: "4px 10px", background: "#052e16", color: "#4ade80", border: "1px solid #166534", borderRadius: 6, cursor: "pointer" }}
                          >
                            Mark Claimed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}