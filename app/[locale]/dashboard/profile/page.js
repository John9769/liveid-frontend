"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  getFullProfile,
  updateProfile,
  deleteAccount,
  getStoredUser,
  clearSession,
} from "../../../../lib/api";

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
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const user = getStoredUser();
      if (!user?.id) {
        clearSession();
        router.push(`/${locale}/login`);
        return;
      }

      setUserId(user.id);
      setHandle(user.activeHandle || "");

      try {
        const data = await getFullProfile(user.id);
        if (cancelled) return;
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
      } catch (err) {
        if (cancelled) return;
        if (err.isAuthError) {
          clearSession();
          router.push(`/${locale}/login`);
          return;
        }
        // A missing profile is not fatal — let the user create one
        setError(null);
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [locale, router]);

  async function handleSave() {
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      await updateProfile(userId, form);
      setSuccess(true);
    } catch (err) {
      if (err.isAuthError) {
        clearSession();
        router.push(`/${locale}/login`);
        return;
      }
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteInput !== "DELETE") {
      setDeleteError("Please type DELETE to confirm.");
      return;
    }
    if (!deletePassword) {
      setDeleteError("Enter your password to confirm.");
      return;
    }

    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(userId, "DELETE", deletePassword);
      clearSession();
      router.push(`/${locale}`);
    } catch (err) {
      setDeleteError(err.message || "Failed to delete account.");
      setDeleting(false);
    }
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setDeleteInput("");
    setDeletePassword("");
    setDeleteError(null);
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
            backgroundColor: photoUrl ? "transparent" : "var(--border)",
            backgroundSize: "cover", backgroundPosition: "center",
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
          style={{ width: "100%", background: "var(--trust-blue)", color: "white", border: "none", borderRadius: 8, padding: "12px", fontSize: "0.95rem", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", marginTop: 8, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? "Saving…" : "Save profile"}
        </button>

        {/* Delete account section */}
        <div style={{ marginTop: "3rem", padding: "1.25rem", border: "1px solid #B3261E", borderRadius: 12, background: "#FFF5F5" }}>
          <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#B3261E", marginBottom: 6 }}>Delete Account</p>
          <p style={{ fontSize: "0.82rem", color: "#B3261E", lineHeight: 1.6, marginBottom: 12 }}>
            This action is permanent and cannot be undone. Your handle <strong>liveid.asia/{handle}</strong> will be retired forever and cannot be claimed by anyone else. All your data will be deleted.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{ background: "#B3261E", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" }}
          >
            Delete My Account
          </button>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1.5rem" }}>
            <div style={{ background: "white", borderRadius: 16, padding: "2rem", maxWidth: 420, width: "100%", border: "2px solid #B3261E" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#B3261E", marginBottom: 8 }}>
                ⚠ Delete Account
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16 }}>
                You are about to permanently delete your LiveID account. Your handle <strong>liveid.asia/{handle}</strong> will be retired forever. This cannot be undone.
              </p>

              <p style={{ fontSize: "0.85rem", color: "var(--ink)", fontWeight: 600, marginBottom: 8 }}>
                Type <strong>DELETE</strong> to confirm:
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Type DELETE here"
                style={{ width: "100%", padding: "10px 12px", border: "2px solid #B3261E", borderRadius: 8, fontSize: "0.95rem", outline: "none", boxSizing: "border-box", marginBottom: 12 }}
              />

              <p style={{ fontSize: "0.85rem", color: "var(--ink)", fontWeight: 600, marginBottom: 8 }}>
                Enter your password:
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
                style={{ width: "100%", padding: "10px 12px", border: "2px solid #B3261E", borderRadius: 8, fontSize: "0.95rem", outline: "none", boxSizing: "border-box", marginBottom: 12 }}
              />

              {deleteError && <p style={{ color: "#B3261E", fontSize: "0.82rem", marginBottom: 12 }}>{deleteError}</p>}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  style={{ flex: 1, padding: "10px", background: "white", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.88rem", cursor: "pointer", color: "var(--text-muted)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteInput !== "DELETE" || !deletePassword}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: (deleteInput === "DELETE" && deletePassword) ? "#B3261E" : "var(--border)",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    cursor: (deleteInput === "DELETE" && deletePassword) ? "pointer" : "not-allowed",
                  }}
                >
                  {deleting ? "Deleting…" : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}