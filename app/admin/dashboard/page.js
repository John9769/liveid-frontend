"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("liveid_admin");
    if (!stored) { router.push("/admin"); return; }
    const { token, admin } = JSON.parse(stored);
    setAdmin(admin);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setOverview)
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    localStorage.removeItem("liveid_admin");
    router.push("/admin");
  }

  if (loading) return <AdminShell><p style={{ color: "#94a3b8" }}>Loading…</p></AdminShell>;

  return (
    <AdminShell admin={admin} onLogout={handleLogout}>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", marginBottom: "1.5rem" }}>
        Overview
      </h2>

      {/* Revenue cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: "2rem" }}>
        <StatCard label="Total Revenue" value={`RM ${overview?.totalRevenue?.toFixed(2) || "0.00"}`} color="#22c55e" />
        <StatCard label="Revenue Today" value={`RM ${overview?.revenueToday?.toFixed(2) || "0.00"}`} color="#22c55e" />
        <StatCard label="Revenue This Week" value={`RM ${overview?.revenueWeek?.toFixed(2) || "0.00"}`} color="#22c55e" />
        <StatCard label="Revenue This Month" value={`RM ${overview?.revenueMonth?.toFixed(2) || "0.00"}`} color="#22c55e" />
      </div>

      {/* Activity cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: "2rem" }}>
        <StatCard label="Total Users" value={overview?.totalUsers || 0} />
        <StatCard label="Active Handles" value={overview?.totalActiveHandles || 0} />
        <StatCard label="Pending Transactions" value={overview?.pendingTransactions || 0} color="#f59e0b" />
        <StatCard label="New Users Today" value={overview?.newUsersToday || 0} />
        <StatCard label="Verify Hits Today" value={overview?.verifyHitsToday || 0} color="#3b82f6" />
      </div>

      {/* Top handles */}
      {overview?.topHandles?.length > 0 && (
        <div style={{ background: "#1e293b", borderRadius: 12, padding: "1.5rem", border: "1px solid #334155" }}>
          <p style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            Most Verified Handles
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {overview.topHandles.map((h, i) => (
              <div key={h.handle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < overview.topHandles.length - 1 ? "1px solid #334155" : "none" }}>
                <span style={{ fontSize: "0.9rem", color: "#e2e8f0", fontFamily: "monospace" }}>
                  liveid.asia/{h.handle}
                </span>
                <span style={{ fontSize: "0.85rem", color: "#3b82f6", fontWeight: 600 }}>
                  {h.hits} hits
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </AdminShell>
  );
}

// ============================================================
// SHARED SHELL — used by all admin pages
// ============================================================

export function AdminShell({ children, admin, onLogout }) {
  const navItems = [
    { label: "Overview", href: "/admin/dashboard" },
    { label: "Users", href: "/admin/dashboard/users" },
    { label: "Transactions", href: "/admin/dashboard/transactions" },
    { label: "Referrals", href: "/admin/dashboard/referrals" },
    { label: "Verify Logs", href: "/admin/dashboard/verify-logs" },
    { label: "Vault Offers", href: "/admin/dashboard/vault-offers" },
    { label: "Celebrities", href: "/admin/dashboard/celebrities" },
    { label: "Waitlist", href: "/admin/dashboard/waitlist" },
    { label: "Pricing", href: "/admin/dashboard/pricing" },
    { label: "Invitations", href: "/admin/dashboard/invitations" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex" }}>

      {/* Sidebar */}
      <div style={{ width: 220, background: "#1e293b", borderRight: "1px solid #334155", padding: "1.5rem 0", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 1.5rem", marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>LiveID</p>
          <p style={{ fontSize: "1rem", fontWeight: 700, color: "white", margin: 0 }}>Admin Cockpit</p>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ display: "block", padding: "10px 1.5rem", fontSize: "0.88rem", color: "#94a3b8", textDecoration: "none" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {admin && (
          <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #334155" }}>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 8 }}>{admin.email}</p>
            <button
              onClick={onLogout}
              style={{ background: "none", border: "1px solid #334155", color: "#94a3b8", padding: "6px 12px", borderRadius: 6, fontSize: "0.8rem", cursor: "pointer", width: "100%" }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        {children}
      </div>

    </div>
  );
}

function StatCard({ label, value, color = "#e2e8f0" }) {
  return (
    <div style={{ background: "#1e293b", borderRadius: 10, padding: "1.25rem", border: "1px solid #334155" }}>
      <p style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: "1.4rem", fontWeight: 700, color, margin: 0 }}>{value}</p>
    </div>
  );
}