"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { getFullProfile, updateProfile } from "../../../lib/api";

export default function ProfilePage() {
  const locale = useLocale();
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    city: "",
    profession: "",
    instagram: "",
    tiktok: "",
    facebook: "",
    twitter: "",
    youtube: "",
    whatsapp: "",
    website: "",
  });
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("liveid_user");
    if (!stored) { router.push(`/${locale}/login`); return; }
    const user = JSON.parse(stored);
    setUserId(user.id);

    getFullProfile(user.id)
      .then((data) => {
        const p = data.profile || {};
        setPhotoUrl(p.photoUrl || null);
        setForm({
          displayName: p.displayName || "",
          bio: p.bio || "",
          city: p.city || "",
          profession: p.profession || "",
          instagram: p.instagram || "",
          tiktok: p.tiktok || "",
          facebook: p.facebook || "",
          twitter: p.twitter || "",
          youtube: p.youtube || "",
          whatsapp: p.whatsapp || "",
          website: p.website || "",
        });
      })
      .catch(() => router.push(`/${locale}/login`))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      await updateProfile(userId, form);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--text-muted)" }}>Loading…</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <main style={{ maxWidth: 520, margin: "0 auto", padding: "3rem 1.5rem" }}>

        <button
          onClick={() => router.push(`/${locale}/dashboard`)}
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", padding: 0, marginBottom: "1.5rem" }}
        >
          ← Back to dashboard
        </button>

        <h1 className="font-display" style={{ fontSize: "1.8rem", marginBottom: "2rem", color: "var(--ink)" }}>
          Edit Profile
        </h1>

        {/* Profile photo — permanent, cannot change */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "2rem", padding: "1rem 1.25rem", background: "var(--mist)", border: "1px solid var(--border)", borderRadius: 12 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            backgroundImage: photoUrl ? `url(${photoUrl})` : "none",
            backgroundSize: "cover", backgroundPosition: "center",
            background: photoUrl ? undefined : "var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", flexShrink: 0, border: "2px solid var(--border)",
          }}>
            {!photoUrl && "👤"}
          </div>
          <div>
            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}>Profile Photo</p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "4px 0 0", lineHeight: 1.5 }}>
              Your profile photo is your verified selfie taken during registration. It cannot be changed.
            </p>
          </div>
        </div>

        {/* Display name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Display name</label>
          <input
            type="text"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            placeholder="How you want to be known"
            style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Bio */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="A short bio"
            rows={3}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.95rem", outline: "none", resize: "vertical", boxSizing: "border-box" }}
          />
        </div>

        {/* City */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="Kuala Lumpur"
            style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Profession */}
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Profession</label>
          <input
            type="text"
            value={form.profession}
            onChange={(e) => setForm({ ...form, profession: e.target.value })}
            placeholder="Entrepreneur, Influencer, etc"
            style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Social links */}
        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: 12 }}>Social links</p>

        {[
          { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourname" },
          { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourname" },
          { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourname" },
          { key: "twitter", label: "Twitter / X", placeholder: "https://x.com/yourname" },
          { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourname" },
          { key: "whatsapp", label: "WhatsApp", placeholder: "60123456789" },
          { key: "website", label: "Website", placeholder: "https://yourwebsite.com" },
        ].map((field) => (
          <div key={field.key} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{field.label}</label>
            <input
              type="text"
              value={form[field.key]}
              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>
        ))}

        {error && <p style={{ color: "#B3261E", fontSize: "0.85rem", marginBottom: 12 }}>{error}</p>}
        {success && <p style={{ color: "var(--stamp-teal)", fontSize: "0.85rem", marginBottom: 12 }}>Profile saved successfully.</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ width: "100%", background: "var(--trust-blue)", color: "white", border: "none", borderRadius: 8, padding: "12px", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", marginTop: 8 }}
        >
          {saving ? "Saving…" : "Save profile"}
        </button>

      </main>
    </div>
  );
}