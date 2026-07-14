"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminShell } from "../../page";

export default function AdminUserDetail() {
  const router = useRouter();
  const { userId } = useParams();
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [user, setUser] = useState(null);
  const [verifyHits, setVerifyHits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("liveid_admin");
    if (!stored) { router.push("/admin"); return; }
    const { token, admin } = JSON.parse(stored);
    setToken(token);
    setAdmin(admin);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setUser(data.user); setVerifyHits(data.verifyHits || 0); })
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }, [userId]);

  function handleLogout() {
    localStorage.removeItem("liveid_admin");
    router.push("/admin");
  }

  return (
    <AdminShell admin={admin} onLogout={handleLogout}>
      <button
        onClick={() => router.push("/admin/dashboard/users")}
        style={{ background: "none", border: "none", color: "#64748b", fontSize: "0.85rem", cursor: "pointer", padding: 0, marginBottom: "1.5rem" }}
      >
        ← Back to Users
      </button>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading…</p>
      ) : !user ? (
        <p style={{ color: "#f87171" }}>User not found.</p>
      ) : (
        <div>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "white", margin: 0 }}>
                {user.activeHandle ? `liveid.asia/${user.activeHandle.name}` : user.genericId}
              </h2>
              <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: 4 }}>{user.genericId}</p>
            </div>
            <span style={{
              fontSize: "0.75rem", padding: "4px 10px", borderRadius: 4,
              background: user.registrationExpiry && new Date() > new Date(user.registrationExpiry) ? "#450a0a" : "#052e16",
              color: user.registrationExpiry && new Date() > new Date(user.registrationExpiry) ? "#f87171" : "#4ade80",
            }}>
              {user.registrationExpiry && new Date() > new Date(user.registrationExpiry) ? "EXPIRED" : "ACTIVE"}
            </span>
          </div>

          {/* Details grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "2rem" }}>
            <InfoCard label="Email" value={user.email} />
            <InfoCard label="Phone" value={user.phone} />
            <InfoCard label="Tier" value={user.tier} />
            <InfoCard label="Handle" value={user.activeHandle?.name || "—"} />
            <InfoCard label="Registered" value={new Date(user.createdAt).toLocaleDateString("en-MY")} />
            <InfoCard label="Expiry" value={user.registrationExpiry ? new Date(user.registrationExpiry).toLocaleDateString("en-MY") : "—"} />
            <InfoCard label="Verify Page Hits" value={verifyHits} color="#3b82f6" />
            <InfoCard label="Trust Score" value={user.trustScore?.score || 0} />
          </div>

          {/* Profile */}
          {user.profile && (
            <div style={{ background: "#1e293b", borderRadius: 12, padding: "1.5rem", border: "1px solid #334155", marginBottom: "2rem" }}>
              <p style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Profile</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {user.profile.displayName && <ProfileRow label="Display Name" value={user.profile.displayName} />}
                {user.profile.bio && <ProfileRow label="Bio" value={user.profile.bio} />}
                {user.profile.city && <ProfileRow label="City" value={user.profile.city} />}
                {user.profile.profession && <ProfileRow label="Profession" value={user.profile.profession} />}
                {user.profile.instagram && <ProfileRow label="Instagram" value={user.profile.instagram} />}
                {user.profile.tiktok && <ProfileRow label="TikTok" value={user.profile.tiktok} />}
                {user.profile.facebook && <ProfileRow label="Facebook" value={user.profile.facebook} />}
                {user.profile.twitter && <ProfileRow label="Twitter/X" value={user.profile.twitter} />}
                {user.profile.youtube && <ProfileRow label="YouTube" value={user.profile.youtube} />}
                {user.profile.whatsapp && <ProfileRow label="WhatsApp" value={user.profile.whatsapp} />}
                {user.profile.website && <ProfileRow label="Website" value={user.profile.website} />}
              </div>
            </div>
          )}

          {/* Transactions */}
          {user.transactions?.length > 0 && (
            <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", overflow: "hidden" }}>
              <p style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", padding: "1rem 1.5rem", borderBottom: "1px solid #334155", margin: 0 }}>
                Transactions
              </p>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #334155" }}>
                    {["Type", "Amount", "Status", "Date"].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {user.transactions.map((t, i) => (
                    <tr key={t.id} style={{ borderBottom: i < user.transactions.length - 1 ? "1px solid #334155" : "none" }}>
                      <td style={{ padding: "10px 16px", fontSize: "0.82rem", color: "#94a3b8" }}>{t.type}</td>
                      <td style={{ padding: "10px 16px", fontSize: "0.82rem", color: "#22c55e" }}>RM {t.amountRM?.toFixed(2)}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{
                          fontSize: "0.75rem", padding: "2px 8px", borderRadius: 4,
                          background: t.status === "SUCCESS" ? "#052e16" : t.status === "PENDING" ? "#422006" : "#450a0a",
                          color: t.status === "SUCCESS" ? "#4ade80" : t.status === "PENDING" ? "#fb923c" : "#f87171",
                        }}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px", fontSize: "0.82rem", color: "#64748b" }}>
                        {new Date(t.createdAt).toLocaleDateString("en-MY")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}

function InfoCard({ label, value, color = "#e2e8f0" }) {
  return (
    <div style={{ background: "#1e293b", borderRadius: 10, padding: "1rem 1.25rem", border: "1px solid #334155" }}>
      <p style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: "0.95rem", color, fontWeight: 500, margin: 0 }}>{value}</p>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{label}</span>
      <span style={{ fontSize: "0.85rem", color: "#e2e8f0", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}