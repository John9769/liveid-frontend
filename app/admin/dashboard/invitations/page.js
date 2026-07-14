"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "../page";

export default function AdminInvitations() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [superReferrals, setSuperReferrals] = useState([]);

  const emptyForm = {
    name: "", phone: "", email: "", handle: "",
    role: "REFERRAL", superReferralId: "",
    bankName: "", bankAccount: "", bankAccountName: "",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const stored = localStorage.getItem("liveid_admin");
    if (!stored) { router.push("/admin"); return; }
    const { token, admin } = JSON.parse(stored);
    setToken(token);
    setAdmin(admin);
    fetchAll(token);
  }, []);

  async function fetchAll(tk) {
    setLoading(true);
    try {
      const [invRes, refRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/invitations`, {
          headers: { Authorization: `Bearer ${tk}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/referrals`, {
          headers: { Authorization: `Bearer ${tk}` },
        }),
      ]);
      const invData = await invRes.json();
      const refData = await refRes.json();
      setInvitations(invData.invitations || []);
      setSuperReferrals((refData.referrals || []).filter((r) => r.isSuperReferral));
    } catch (err) {
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invites`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invitation");
      setSuccess(`Invitation sent to ${form.email} — handle liveid.asia/${form.handle} reserved.`);
      setForm(emptyForm);
      setShowForm(false);
      fetchAll(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleResend(id) {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invites/${id}/resend`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Resend failed");
      setSuccess("Invitation resent. Link extended by 7 days.");
      fetchAll(token);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRevoke(id) {
    if (!confirm("Revoke this invitation? The link will no longer work.")) return;
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invites/${id}/revoke`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Revoke failed");
      setSuccess("Invitation revoked.");
      fetchAll(token);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("liveid_admin");
    router.push("/admin");
  }

  const roleColor = (r) => ({ REFERRAL: "#4ade80", SUPER_REFERRAL: "#60a5fa", BOTH: "#fb923c" }[r] || "#94a3b8");
  const roleBg = (r) => ({ REFERRAL: "#052e16", SUPER_REFERRAL: "#1e3a5f", BOTH: "#422006" }[r] || "#1e293b");

  return (
    <AdminShell admin={admin} onLogout={handleLogout}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", margin: 0 }}>
          Invitations <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 400 }}>({invitations.length} total)</span>
        </h2>
        <button
          onClick={() => { setShowForm(!showForm); setError(null); setSuccess(null); }}
          style={{ padding: "8px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: 8, fontSize: "0.85rem", cursor: "pointer" }}
        >
          {showForm ? "Cancel" : "+ Send Invitation"}
        </button>
      </div>

      {error && <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: 12 }}>{error}</p>}
      {success && <p style={{ color: "#4ade80", fontSize: "0.85rem", marginBottom: 12 }}>{success}</p>}

      {/* Create invitation form */}
      {showForm && (
        <div style={{ background: "#1e293b", borderRadius: 12, padding: "1.5rem", border: "1px solid #334155", marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "white", marginBottom: "1rem" }}>New Invitation</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <InvField label="Full Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <InvField label="Phone *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="601xxxxxxxx" />
            <InvField label="Email *" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="nabil@example.com" />
            <InvField label="Requested Handle *" value={form.handle} onChange={(v) => setForm({ ...form, handle: v.toLowerCase().replace(/[^a-z0-9_]/g, "") })} placeholder="nabilzira" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 6 }}>Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "white", fontSize: "0.85rem", outline: "none" }}
              >
                <option value="REFERRAL">Referral only</option>
                <option value="SUPER_REFERRAL">Super Referral only</option>
                <option value="BOTH">Both (Referral + Super Referral)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 6 }}>Under Super Referral (optional)</label>
              <select
                value={form.superReferralId}
                onChange={(e) => setForm({ ...form, superReferralId: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "white", fontSize: "0.85rem", outline: "none" }}
              >
                <option value="">None — direct by admin</option>
                {superReferrals.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            <InvField label="Bank Name *" value={form.bankName} onChange={(v) => setForm({ ...form, bankName: v })} placeholder="Maybank" />
            <InvField label="Account Number *" value={form.bankAccount} onChange={(v) => setForm({ ...form, bankAccount: v })} />
            <InvField label="Account Name *" value={form.bankAccountName} onChange={(v) => setForm({ ...form, bankAccountName: v })} />
          </div>

          {form.handle && (
            <p style={{ fontSize: "0.82rem", color: "#3b82f6", marginBottom: 16, fontFamily: "monospace" }}>
              Handle preview: liveid.asia/{form.handle} — Referral code: {form.handle}
            </p>
          )}

          <button
            onClick={handleCreate}
            disabled={saving}
            style={{ padding: "10px 24px", background: "#22c55e", color: "white", border: "none", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
          >
            {saving ? "Sending…" : "Send Invitation"}
          </button>
        </div>
      )}

      {/* Invitations list */}
      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {invitations.map((inv) => {
            const isExpired = new Date() > new Date(inv.expiresAt);
            const isUsed = inv.isUsed;
            return (
              <div key={inv.id} style={{ background: "#1e293b", borderRadius: 10, padding: "1.25rem 1.5rem", border: "1px solid #334155" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontWeight: 700, color: "white", fontSize: "0.95rem", margin: 0 }}>{inv.name}</p>
                    <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "4px 0" }}>{inv.email} · {inv.phone}</p>
                    <p style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#3b82f6", margin: 0 }}>
                      liveid.asia/{inv.handle}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: 4, background: roleBg(inv.role), color: roleColor(inv.role) }}>
                      {inv.role}
                    </span>
                    <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: 4, background: isUsed ? "#052e16" : isExpired ? "#450a0a" : "#422006", color: isUsed ? "#4ade80" : isExpired ? "#f87171" : "#fb923c" }}>
                      {isUsed ? "COMPLETED" : isExpired ? "EXPIRED" : "PENDING"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                    Expires: {new Date(inv.expiresAt).toLocaleDateString("en-MY")}
                  </p>
                  {!isUsed && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleResend(inv.id)}
                        style={{ fontSize: "0.78rem", padding: "5px 12px", background: "#1e3a5f", color: "#60a5fa", border: "1px solid #1d4ed8", borderRadius: 6, cursor: "pointer" }}
                      >
                        Resend
                      </button>
                      {!isExpired && (
                        <button
                          onClick={() => handleRevoke(inv.id)}
                          style={{ fontSize: "0.78rem", padding: "5px 12px", background: "#450a0a", color: "#f87171", border: "1px solid #7f1d1d", borderRadius: 6, cursor: "pointer" }}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {invitations.length === 0 && (
            <p style={{ textAlign: "center", color: "#64748b" }}>No invitations sent yet.</p>
          )}
        </div>
      )}
    </AdminShell>
  );
}

function InvField({ label, value, onChange, placeholder = "" }) {
  return (
    <div>
      <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 6 }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: "10px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "white", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
      />
    </div>
  );
}