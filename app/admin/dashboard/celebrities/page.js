"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "../page";

const STATUS_OPTIONS = ["PROSPECT", "CONTACTED", "NEGOTIATING", "CLOSED", "DECLINED"];

const statusColor = (s) => ({
  PROSPECT: "#94a3b8", CONTACTED: "#60a5fa",
  NEGOTIATING: "#fb923c", CLOSED: "#4ade80", DECLINED: "#f87171",
}[s] || "#94a3b8");

const statusBg = (s) => ({
  PROSPECT: "#1e293b", CONTACTED: "#1e3a5f",
  NEGOTIATING: "#422006", CLOSED: "#052e16", DECLINED: "#450a0a",
}[s] || "#1e293b");

export default function AdminCelebrities() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [celebrities, setCelebrities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "", phone: "", email: "",
    instagram: "", instagramFollowers: "",
    tiktok: "", tiktokFollowers: "",
    facebook: "", facebookFollowers: "",
    totalReach: "", proposedHandle: "",
    proposedPrice: "", renewalFee: "",
    notes: "", introducedBy: "", status: "PROSPECT",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const stored = localStorage.getItem("liveid_admin");
    if (!stored) { router.push("/admin"); return; }
    const { token, admin } = JSON.parse(stored);
    setToken(token);
    setAdmin(admin);
    fetchCelebrities(token);
  }, []);

  function fetchCelebrities(tk) {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/celebrities`, {
      headers: { Authorization: `Bearer ${tk}` },
    })
      .then((r) => r.json())
      .then((data) => setCelebrities(data.celebrities || []))
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/celebrities/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/celebrities`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSuccess(editingId ? "Celebrity updated." : "Celebrity added.");
      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);
      fetchCelebrities(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(celeb, status) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/celebrities/${celeb.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...celeb, status }),
      });
      fetchCelebrities(token);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(celeb) {
    setForm({
      name: celeb.name || "", phone: celeb.phone || "", email: celeb.email || "",
      instagram: celeb.instagram || "", instagramFollowers: celeb.instagramFollowers || "",
      tiktok: celeb.tiktok || "", tiktokFollowers: celeb.tiktokFollowers || "",
      facebook: celeb.facebook || "", facebookFollowers: celeb.facebookFollowers || "",
      totalReach: celeb.totalReach || "", proposedHandle: celeb.proposedHandle || "",
      proposedPrice: celeb.proposedPrice || "", renewalFee: celeb.renewalFee || "",
      notes: celeb.notes || "", introducedBy: celeb.introducedBy || "",
      status: celeb.status || "PROSPECT",
    });
    setEditingId(celeb.id);
    setShowForm(true);
  }

  function handleLogout() {
    localStorage.removeItem("liveid_admin");
    router.push("/admin");
  }

  return (
    <AdminShell admin={admin} onLogout={handleLogout}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", margin: 0 }}>
          Celebrity Pipeline <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 400 }}>({celebrities.length} prospects)</span>
        </h2>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }}
          style={{ padding: "8px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: 8, fontSize: "0.85rem", cursor: "pointer" }}
        >
          {showForm ? "Cancel" : "+ Add Celebrity"}
        </button>
      </div>

      {error && <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: 12 }}>{error}</p>}
      {success && <p style={{ color: "#4ade80", fontSize: "0.85rem", marginBottom: 12 }}>{success}</p>}

      {showForm && (
        <div style={{ background: "#1e293b", borderRadius: 12, padding: "1.5rem", border: "1px solid #334155", marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "white", marginBottom: "1rem" }}>
            {editingId ? "Edit Celebrity" : "New Celebrity"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <CelebField label="Full Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <CelebField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <CelebField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <CelebField label="Introduced By" value={form.introducedBy} onChange={(v) => setForm({ ...form, introducedBy: v })} />
            <CelebField label="Instagram" value={form.instagram} onChange={(v) => setForm({ ...form, instagram: v })} />
            <CelebField label="Instagram Followers" value={form.instagramFollowers} onChange={(v) => setForm({ ...form, instagramFollowers: v })} placeholder="2300000" />
            <CelebField label="TikTok" value={form.tiktok} onChange={(v) => setForm({ ...form, tiktok: v })} />
            <CelebField label="TikTok Followers" value={form.tiktokFollowers} onChange={(v) => setForm({ ...form, tiktokFollowers: v })} />
            <CelebField label="Facebook" value={form.facebook} onChange={(v) => setForm({ ...form, facebook: v })} />
            <CelebField label="Facebook Followers" value={form.facebookFollowers} onChange={(v) => setForm({ ...form, facebookFollowers: v })} />
            <CelebField label="Total Reach" value={form.totalReach} onChange={(v) => setForm({ ...form, totalReach: v })} />
            <CelebField label="Proposed Handle" value={form.proposedHandle} onChange={(v) => setForm({ ...form, proposedHandle: v })} placeholder="nabil" />
            <CelebField label="Proposed Price (RM)" value={form.proposedPrice} onChange={(v) => setForm({ ...form, proposedPrice: v })} placeholder="5000" />
            <CelebField label="Renewal Fee (RM/year)" value={form.renewalFee} onChange={(v) => setForm({ ...form, renewalFee: v })} placeholder="500" />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 6 }}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={{ padding: "10px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "white", fontSize: "0.85rem", outline: "none" }}
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 6 }}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Deal notes, conversation history…"
              rows={3}
              style={{ width: "100%", padding: "10px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "white", fontSize: "0.85rem", outline: "none", resize: "vertical", boxSizing: "border-box" }}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: "10px 24px", background: "#22c55e", color: "white", border: "none", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
          >
            {saving ? "Saving…" : editingId ? "Update" : "Add Celebrity"}
          </button>
        </div>
      )}

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {celebrities.map((c) => (
            <div key={c.id} style={{ background: "#1e293b", borderRadius: 12, padding: "1.5rem", border: "1px solid #334155" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <p style={{ fontWeight: 700, color: "white", fontSize: "1rem", margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "4px 0 0" }}>
                    {c.email} {c.phone && `· ${c.phone}`}
                    {c.introducedBy && ` · via ${c.introducedBy}`}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select
                    value={c.status}
                    onChange={(e) => handleStatusChange(c, e.target.value)}
                    style={{ padding: "4px 8px", background: statusBg(c.status), border: `1px solid ${statusColor(c.status)}`, borderRadius: 6, color: statusColor(c.status), fontSize: "0.78rem", outline: "none", cursor: "pointer" }}
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => handleEdit(c)}
                    style={{ padding: "4px 12px", background: "#1e3a5f", color: "#60a5fa", border: "1px solid #1d4ed8", borderRadius: 6, fontSize: "0.78rem", cursor: "pointer" }}
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: c.notes ? 12 : 0 }}>
                {c.instagram && <ReachBox label="Instagram" value={c.instagramFollowers?.toLocaleString() || "—"} />}
                {c.tiktok && <ReachBox label="TikTok" value={c.tiktokFollowers?.toLocaleString() || "—"} />}
                {c.facebook && <ReachBox label="Facebook" value={c.facebookFollowers?.toLocaleString() || "—"} />}
                {c.totalReach && <ReachBox label="Total Reach" value={c.totalReach?.toLocaleString()} color="#22c55e" />}
                {c.proposedHandle && <ReachBox label="Proposed Handle" value={`liveid.asia/${c.proposedHandle}`} color="#3b82f6" />}
                {c.proposedPrice && <ReachBox label="Proposed Price" value={`RM ${c.proposedPrice?.toLocaleString()}`} color="#22c55e" />}
                {c.renewalFee && <ReachBox label="Renewal/year" value={`RM ${c.renewalFee?.toLocaleString()}`} />}
              </div>

              {c.notes && (
                <p style={{ fontSize: "0.82rem", color: "#94a3b8", background: "#0f172a", padding: "10px 12px", borderRadius: 8, margin: 0 }}>
                  {c.notes}
                </p>
              )}
            </div>
          ))}
          {celebrities.length === 0 && (
            <p style={{ textAlign: "center", color: "#64748b" }}>No celebrities in pipeline yet.</p>
          )}
        </div>
      )}
    </AdminShell>
  );
}

function CelebField({ label, value, onChange, placeholder = "" }) {
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

function ReachBox({ label, value, color = "#e2e8f0" }) {
  return (
    <div style={{ background: "#0f172a", borderRadius: 8, padding: "10px 12px", border: "1px solid #334155" }}>
      <p style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: "0.85rem", color, fontWeight: 600, margin: 0 }}>{value}</p>
    </div>
  );
}