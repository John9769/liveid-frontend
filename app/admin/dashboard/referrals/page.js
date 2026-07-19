"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "../page";

export default function AdminReferrals() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const emptyForm = {
    name: "", phone: "", email: "", code: "",
    isActiveReferral: true, isSuperReferral: false,
    superReferralId: "", minFollowers: "",
    bankName: "", bankAccount: "", bankAccountName: "",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const stored = localStorage.getItem("liveid_admin");
    if (!stored) { router.push("/admin"); return; }
    const { token, admin } = JSON.parse(stored);
    setToken(token);
    setAdmin(admin);
    fetchReferrals(token);
  }, []);

  function fetchReferrals(tk) {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/referrals`, {
      headers: { Authorization: `Bearer ${tk}` },
    })
      .then((r) => r.json())
      .then((data) => setReferrals(data.referrals || []))
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }

  async function handleCreate() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/referrals`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create referral");
      setSuccess("Referral created successfully.");
      setForm(emptyForm);
      setShowForm(false);
      fetchReferrals(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePayout(referralId, type) {
    if (!confirm(`Mark all unpaid ${type} earnings as paid?`)) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/referrals/${referralId}/payout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error("Payout failed");
      setSuccess("Payout marked as paid.");
      fetchReferrals(token);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleActive(referral) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/referrals/${referral.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...referral, isActive: !referral.isActive }),
      });
      fetchReferrals(token);
    } catch (err) {
      setError(err.message);
    }
  }

  // Promote / demote a referral to Super Referral.
  // A referral keeps his own direct income (isActiveReferral stays as-is)
  // and gains override earnings when others are placed under him.
  // A pure Super Referral (never a referral) is untouched by this.
  async function handleToggleSuper(referral) {
    const promoting = !referral.isSuperReferral;

    if (!promoting) {
      const subs = (referral.subReferrals || []).length;
      if (subs > 0) {
        setError(`Cannot remove Super Referral — ${subs} referral(s) still sit under this person. Reassign them first.`);
        return;
      }
    }

    if (!confirm(
      promoting
        ? `Make ${referral.name} a Super Referral? They keep their own direct income and start overriding anyone placed under them.`
        : `Remove Super Referral status from ${referral.name}?`
    )) return;

    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/referrals/${referral.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...referral, isSuperReferral: promoting }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update super referral status");
      setSuccess(promoting ? `${referral.name} is now a Super Referral.` : `${referral.name} is no longer a Super Referral.`);
      fetchReferrals(token);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("liveid_admin");
    router.push("/admin");
  }

  const superReferrals = referrals.filter((r) => r.isSuperReferral);

  return (
    <AdminShell admin={admin} onLogout={handleLogout}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", margin: 0 }}>
          Referrals <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 400 }}>({referrals.length} total)</span>
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: "8px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: 8, fontSize: "0.85rem", cursor: "pointer" }}
        >
          {showForm ? "Cancel" : "+ Create Referral"}
        </button>
      </div>

      {error && <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: 12 }}>{error}</p>}
      {success && <p style={{ color: "#4ade80", fontSize: "0.85rem", marginBottom: 12 }}>{success}</p>}

      {/* Create form */}
      {showForm && (
        <div style={{ background: "#1e293b", borderRadius: 12, padding: "1.5rem", border: "1px solid #334155", marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "white", marginBottom: "1rem" }}>New Referral</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <FormField label="Full Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <FormField label="Phone *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <FormField label="Email *" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <FormField label="Referral Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} placeholder="e.g. nabil2026" />
            <FormField label="Min Followers" value={form.minFollowers} onChange={(v) => setForm({ ...form, minFollowers: v })} placeholder="500000" />
            <div>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 6 }}>Super Referral Parent</label>
              <select
                value={form.superReferralId}
                onChange={(e) => setForm({ ...form, superReferralId: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "white", fontSize: "0.85rem", outline: "none" }}
              >
                <option value="">None</option>
                {superReferrals.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <FormField label="Bank Name" value={form.bankName} onChange={(v) => setForm({ ...form, bankName: v })} />
            <FormField label="Account Number" value={form.bankAccount} onChange={(v) => setForm({ ...form, bankAccount: v })} />
            <FormField label="Account Name" value={form.bankAccountName} onChange={(v) => setForm({ ...form, bankAccountName: v })} />
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", fontSize: "0.85rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.isActiveReferral} onChange={(e) => setForm({ ...form, isActiveReferral: e.target.checked })} />
              Active Referral (has own link)
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", fontSize: "0.85rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.isSuperReferral} onChange={(e) => setForm({ ...form, isSuperReferral: e.target.checked })} />
              Super Referral (can recruit)
            </label>
          </div>

          <button
            onClick={handleCreate}
            disabled={saving}
            style={{ padding: "10px 24px", background: "#22c55e", color: "white", border: "none", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
          >
            {saving ? "Creating…" : "Create Referral"}
          </button>
        </div>
      )}

      {/* Referral list */}
      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {referrals.map((r) => {
            const unpaidDirect = r.totalEarnings - r.totalPaid;
            const unpaidOverride = r.totalOverrideEarnings - r.totalOverridePaid;
            const subCount = (r.subReferrals || []).length;
            return (
              <div key={r.id} style={{ background: "#1e293b", borderRadius: 12, padding: "1.5rem", border: "1px solid #334155" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <p style={{ fontWeight: 700, color: "white", fontSize: "0.95rem", margin: 0 }}>{r.name}</p>
                    <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "4px 0 0" }}>{r.email} · {r.phone}</p>
                    {r.code && <p style={{ fontSize: "0.8rem", color: "#3b82f6", margin: "4px 0 0", fontFamily: "monospace" }}>Code: {r.code}</p>}
                    {r.isSuperReferral && subCount > 0 && (
                      <p style={{ fontSize: "0.75rem", color: "#60a5fa", margin: "4px 0 0" }}>Overriding {subCount} referral(s)</p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {r.isSuperReferral && (
                      <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: 4, background: "#1e3a5f", color: "#60a5fa" }}>SUPER</span>
                    )}
                    {r.isActiveReferral && (
                      <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: 4, background: "#1a2e1a", color: "#4ade80" }}>ACTIVE REFERRAL</span>
                    )}
                    <button
                      onClick={() => handleToggleSuper(r)}
                      style={{ fontSize: "0.75rem", padding: "4px 10px", background: r.isSuperReferral ? "#422006" : "#1e3a5f", color: r.isSuperReferral ? "#fb923c" : "#60a5fa", border: "none", borderRadius: 6, cursor: "pointer" }}
                    >
                      {r.isSuperReferral ? "Remove Super" : "Make Super"}
                    </button>
                    <button
                      onClick={() => handleToggleActive(r)}
                      style={{ fontSize: "0.75rem", padding: "4px 10px", background: r.isActive ? "#450a0a" : "#052e16", color: r.isActive ? "#f87171" : "#4ade80", border: "none", borderRadius: 6, cursor: "pointer" }}
                    >
                      {r.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
                  <EarningBox label="Total Earned" value={`RM ${r.totalEarnings.toFixed(2)}`} />
                  <EarningBox label="Total Paid" value={`RM ${r.totalPaid.toFixed(2)}`} />
                  <EarningBox label="Override Earned" value={`RM ${r.totalOverrideEarnings.toFixed(2)}`} />
                  <EarningBox label="Override Paid" value={`RM ${r.totalOverridePaid.toFixed(2)}`} />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {unpaidDirect > 0 && (
                    <button
                      onClick={() => handlePayout(r.id, "direct")}
                      style={{ fontSize: "0.8rem", padding: "6px 14px", background: "#22c55e", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
                    >
                      Pay RM {unpaidDirect.toFixed(2)} Direct
                    </button>
                  )}
                  {unpaidOverride > 0 && (
                    <button
                      onClick={() => handlePayout(r.id, "override")}
                      style={{ fontSize: "0.8rem", padding: "6px 14px", background: "#3b82f6", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
                    >
                      Pay RM {unpaidOverride.toFixed(2)} Override
                    </button>
                  )}
                  {unpaidDirect === 0 && unpaidOverride === 0 && (
                    <span style={{ fontSize: "0.8rem", color: "#4ade80" }}>✓ All paid out</span>
                  )}
                </div>
              </div>
            );
          })}
          {referrals.length === 0 && (
            <p style={{ textAlign: "center", color: "#64748b" }}>No referrals yet.</p>
          )}
        </div>
      )}
    </AdminShell>
  );
}

function FormField({ label, value, onChange, placeholder = "" }) {
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

function EarningBox({ label, value }) {
  return (
    <div style={{ background: "#0f172a", borderRadius: 8, padding: "10px 12px", border: "1px solid #334155" }}>
      <p style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: "0.9rem", color: "#22c55e", fontWeight: 600, margin: 0 }}>{value}</p>
    </div>
  );
}