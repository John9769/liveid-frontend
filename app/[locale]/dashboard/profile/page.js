"use client";

import { useEffect, useState, useRef } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Navbar from "../../../../components/Navbar";
import { getFullProfile, updateProfile, uploadProfilePhoto } from "../../../../lib/api";

export default function ProfilePage() {
  const locale = useLocale();
  const router = useRouter();
  const fileRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState({
    displayName: "", bio: "", city: "", profession: "",
    instagram: "", tiktok: "", facebook: "",
    twitter: "", youtube: "", whatsapp: "", website: "",
  });
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("liveid_user");
    if (!stored) { router.push(`/${locale}/login`); return; }

    const parsedUser = JSON.parse(stored);
    setUserId(parsedUser.id);

    getFullProfile(parsedUser.id)
      .then((data) => {
        const p = data.profile;
        if (p) {
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
          setPhotoUrl(p.photoUrl || null);
        }
      })
      .catch(() => router.push(`/${locale}/login`))
      .finally(() => setLoading(false));
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const data = await uploadProfilePhoto(userId, file);
      setPhotoUrl(data.photoUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateProfile(userId, form);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div><Navbar showLogin={false} />
      <main style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      </main>
    </div>
  );

  return (
    <div>
      <Navbar showLogin={false} />
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <h1 className="font-display" style={{ fontSize: "1.8rem", marginBottom: "2rem", color: "var(--ink)" }}>
          Edit Profile
        </h1>

        {/* Photo upload */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "2rem" }}>
          <div
            style={{
              width: 80, height: 80, borderRadius: "50%",
              background: photoUrl ? `url(${photoUrl}) center/cover` : "var(--mist)",
              border: "2px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.5rem", color: "var(--text-muted)",
              backgroundImage: photoUrl ? `url(${photoUrl})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!photoUrl && "👤"}
          </div>
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                border: "1px solid var(--trust-blue)",
                background: "white",
                color: "var(--trust-blue)",
                borderRadius: 6,
                padding: "6px 14px",
                fontSize: "0.85rem",
                fontWeight: 500,
                cursor: "pointer",
                display: "block",
                marginBottom: 4,
              }}
            >
              {uploading ? "Uploading…" : "Upload photo"}
            </button>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>JPG or PNG, max 500KB</p>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Display name" value={form.displayName} onChange={(v) => updateField("displayName", v)} placeholder="How you want to be known" />
          <Field label="Bio" value={form.bio} onChange={(v) => updateField("bio", v)} placeholder="A short bio" />
          <Field label="City" value={form.city} onChange={(v) => updateField("city", v)} placeholder="Kuala Lumpur" />
          <Field label="Profession" value={form.profession} onChange={(v) => updateField("profession", v)} placeholder="Entrepreneur, Influencer, etc" />

          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginTop: 8, marginBottom: 0 }}>Social links</p>

          <Field label="Instagram" value={form.instagram} onChange={(v) => updateField("instagram", v)} placeholder="https://instagram.com/yourname" />
          <Field label="TikTok" value={form.tiktok} onChange={(v) => updateField("tiktok", v)} placeholder="https://tiktok.com/@yourname" />
          <Field label="Facebook" value={form.facebook} onChange={(v) => updateField("facebook", v)} placeholder="https://facebook.com/yourname" />
          <Field label="Twitter / X" value={form.twitter} onChange={(v) => updateField("twitter", v)} placeholder="https://x.com/yourname" />
          <Field label="YouTube" value={form.youtube} onChange={(v) => updateField("youtube", v)} placeholder="https://youtube.com/@yourname" />
          <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => updateField("whatsapp", v)} placeholder="60123456789" />
          <Field label="Website" value={form.website} onChange={(v) => updateField("website", v)} placeholder="https://yourwebsite.com" />

          {error && <p style={{ color: "#B3261E", fontSize: "0.9rem" }}>{error}</p>}
          {success && <p style={{ color: "var(--stamp-teal)", fontSize: "0.9rem" }}>Profile saved successfully.</p>}

          <button
            type="submit"
            disabled={saving}
            style={{
              border: "none",
              background: "var(--trust-blue)",
              color: "white",
              padding: "12px",
              borderRadius: 8,
              fontWeight: 500,
              fontSize: "1rem",
              marginTop: 8,
              cursor: "pointer",
            }}
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "10px 12px",
          fontSize: "1rem",
          outline: "none",
        }}
      />
    </label>
  );
}