"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  getFullProfile,
  updateProfile,
  deleteAccount,
  getStoredUser,
  clearSession,
} from "../../../../lib/api";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
};

export default function ProfilePage() {
  const locale = useLocale();
  const t = useTranslations("Profile");
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
    shopActive: false,
    shopTitle: "",
    shopArea: "",
    shopAbout: "",
  });
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoPublic, setPhotoPublic] = useState(false);
  // How the number is exposed on the verification page. MATCH_ONLY is the
  // default: nobody is ever shown the number, but a visitor holding one can
  // test it. That protects the owner and still catches an impersonator who
  // hands out their own contact.
  const [whatsappMode, setWhatsappMode] = useState("MATCH_ONLY");
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
        setPhotoPublic(p.photoPublic === true);
        setWhatsappMode(p.whatsappMode || "MATCH_ONLY");
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
          shopActive: p.shopActive === true,
          shopTitle: p.shopTitle || "",
          shopArea: p.shopArea || "",
          shopAbout: p.shopAbout || "",
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
      await updateProfile(userId, { ...form, photoPublic, whatsappMode });
      setSuccess(true);
    } catch (err) {
      if (err.isAuthError) {
        clearSession();
        router.push(`/${locale}/login`);
        return;
      }
      setError(err.message || t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteInput !== "DELETE") {
      setDeleteError(t("errTypeDelete"));
      return;
    }
    if (!deletePassword) {
      setDeleteError(t("errEnterPassword"));
      return;
    }

    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(userId, "DELETE", deletePassword);
      clearSession();
      router.push(`/${locale}`);
    } catch (err) {
      setDeleteError(err.message || t("deleteFailed"));
      setDeleting(false);
    }
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setDeleteInput("");
    setDeletePassword("");
    setDeleteError(null);
  }

  // WhatsApp is no longer in this list. It carries a phone number, which is
  // the one detail on the page that is not already public elsewhere, so it
  // gets its own section with its own visibility choice.
  const socialFields = [
    { key: "instagram", label: t("labelInstagram"), placeholder: t("phInstagram") },
    { key: "tiktok", label: t("labelTiktok"), placeholder: t("phTiktok") },
    { key: "facebook", label: t("labelFacebook"), placeholder: t("phFacebook") },
    { key: "twitter", label: t("labelTwitter"), placeholder: t("phTwitter") },
    { key: "youtube", label: t("labelYoutube"), placeholder: t("phYoutube") },
    { key: "website", label: t("labelWebsite"), placeholder: t("phWebsite") },
  ];

  const waModes = [
    { value: "MATCH_ONLY", boldKey: "waModeMatchBold", restKey: "waModeMatchRest" },
    { value: "PUBLIC", boldKey: "waModePublicBold", restKey: "waModePublicRest" },
    { value: "HIDDEN", boldKey: "waModeHiddenBold", restKey: "waModeHiddenRest" },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--text-muted)" }}>{t("loading")}</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <main style={{ maxWidth: 520, margin: "0 auto", padding: "3rem 1.5rem" }}>

        <button
          onClick={() => router.push(`/${locale}/dashboard`)}
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", padding: 0, marginBottom: "1.5rem" }}
        >
          {t("backToDashboard")}
        </button>

        <h1 className="font-display" style={{ fontSize: "1.8rem", marginBottom: "2rem", color: "var(--ink)" }}>
          {t("editProfile")}
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
            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}>{t("profilePhoto")}</p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "4px 0 0", lineHeight: 1.5 }}>
              {t("profilePhotoDesc")}
            </p>
          </div>
        </div>

        {/* Who can see the verified photo — the member decides */}
        <div style={{ marginBottom: "2rem", padding: "1rem 1.25rem", border: "1px solid var(--border)", borderRadius: 12 }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>
            {t("whoCanSee")}
          </p>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 10 }}>
            <input
              type="radio"
              name="photoVisibility"
              checked={photoPublic === false}
              onChange={() => setPhotoPublic(false)}
              style={{ marginTop: 3, flexShrink: 0 }}
            />
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--ink)" }}>{t("membersOnlyBold")}</strong>{t("membersOnlyRest")}
            </span>
          </label>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
            <input
              type="radio"
              name="photoVisibility"
              checked={photoPublic === true}
              onChange={() => setPhotoPublic(true)}
              style={{ marginTop: 3, flexShrink: 0 }}
            />
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--ink)" }}>{t("everyoneBold")}</strong>{t("everyoneRest")}
            </span>
          </label>

          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "12px 0 0", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
            💡 {t("photoTip")}
          </p>
        </div>

        {/* Display name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{t("displayName")}</label>
          <input
            type="text"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            placeholder={t("displayNamePlaceholder")}
            style={inputStyle}
          />
        </div>

        {/* Bio */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{t("bio")}</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder={t("bioPlaceholder")}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* City */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{t("city")}</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder={t("cityPlaceholder")}
            style={inputStyle}
          />
        </div>

        {/* Profession */}
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{t("profession")}</label>
          <input
            type="text"
            value={form.profession}
            onChange={(e) => setForm({ ...form, profession: e.target.value })}
            placeholder={t("professionPlaceholder")}
            style={inputStyle}
          />
        </div>

        {/* Social links */}
        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{t("socialLinks")}</p>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
          {t("socialLinksDesc")}
        </p>

        {socialFields.map((field) => (
          <div key={field.key} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{field.label}</label>
            <input
              type="text"
              value={form[field.key]}
              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              style={inputStyle}
            />
          </div>
        ))}

        {/* WhatsApp — its own section.
            A phone number is the one detail here that is not public
            somewhere else already, so the owner picks how it is exposed
            and is told plainly what each choice means. */}
        <div style={{ marginTop: "2.5rem", marginBottom: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{t("waTitle")}</p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
            {t("waDesc")}
          </p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{t("labelWhatsapp")}</label>
            <input
              type="tel"
              inputMode="tel"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder={t("phWhatsapp")}
              style={inputStyle}
            />
            <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: "6px 0 0" }}>
              {t("waFormatHint")}
            </p>
          </div>

          {form.whatsapp.trim() !== "" && (
            <div style={{ padding: "1rem 1.25rem", border: "1px solid var(--border)", borderRadius: 12 }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>
                {t("waWhoCanSee")}
              </p>

              {waModes.map((m) => (
                <label key={m.value} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 10 }}>
                  <input
                    type="radio"
                    name="whatsappMode"
                    checked={whatsappMode === m.value}
                    onChange={() => setWhatsappMode(m.value)}
                    style={{ marginTop: 3, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                    <strong style={{ color: "var(--ink)" }}>{t(m.boldKey)}</strong>{t(m.restKey)}
                  </span>
                </label>
              ))}

              {/* Consent notice. The owner is told where the number goes at
                  the moment they choose, which is what makes the consent
                  informed rather than assumed. */}
              <div style={{ background: whatsappMode === "PUBLIC" ? "#FFF8E1" : "var(--mist)", border: `1px solid ${whatsappMode === "PUBLIC" ? "#F59E0B" : "var(--border)"}`, borderRadius: 8, padding: "10px 12px", marginTop: 4 }}>
                <p style={{ fontSize: "0.78rem", color: whatsappMode === "PUBLIC" ? "#92400E" : "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
                  {whatsappMode === "PUBLIC" && `⚠ ${t("waNoticePublic")}`}
                  {whatsappMode === "MATCH_ONLY" && `🔒 ${t("waNoticeMatch")}`}
                  {whatsappMode === "HIDDEN" && t("waNoticeHidden")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* My Shop */}
        <div style={{ marginTop: "2.5rem", marginBottom: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>{t("myShop")}</p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
            {t("myShopDesc")}
          </p>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 16 }}>
            <input
              type="checkbox"
              checked={form.shopActive}
              onChange={(e) => setForm({ ...form, shopActive: e.target.checked })}
              style={{ marginTop: 3, flexShrink: 0, width: 16, height: 16 }}
            />
            <span style={{ fontSize: "0.85rem", color: "var(--ink)", lineHeight: 1.6 }}>
              <strong>{t("turnOnShopBold")}</strong>{t("turnOnShopRest")}
            </span>
          </label>

          {form.shopActive && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{t("shopTitleLabel")}</label>
                <input
                  type="text"
                  value={form.shopTitle}
                  onChange={(e) => setForm({ ...form, shopTitle: e.target.value })}
                  placeholder={t("shopTitlePlaceholder")}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{t("shopAreaLabel")}</label>
                <input
                  type="text"
                  value={form.shopArea}
                  onChange={(e) => setForm({ ...form, shopArea: e.target.value })}
                  placeholder={t("shopAreaPlaceholder")}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{t("shopAboutLabel")}</label>
                <textarea
                  value={form.shopAbout}
                  onChange={(e) => setForm({ ...form, shopAbout: e.target.value })}
                  placeholder={t("shopAboutPlaceholder")}
                  rows={2}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ padding: "1rem 1.25rem", background: "var(--mist)", border: "1px solid var(--border)", borderRadius: 12 }}>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 12px" }}>
                  {t("saveFirstNote")}
                </p>
                <button
                  onClick={() => router.push(`/${locale}/dashboard/shop`)}
                  style={{ background: "white", border: "1px solid var(--trust-blue)", color: "var(--trust-blue)", borderRadius: 8, padding: "9px 18px", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" }}
                >
                  {t("manageItems")}
                </button>
              </div>
            </>
          )}
        </div>

        {error && <p style={{ color: "#B3261E", fontSize: "0.85rem", marginBottom: 12 }}>{error}</p>}
        {success && <p style={{ color: "var(--stamp-teal)", fontSize: "0.85rem", marginBottom: 12 }}>{t("saveSuccess")}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ width: "100%", background: "var(--trust-blue)", color: "white", border: "none", borderRadius: 8, padding: "12px", fontSize: "0.95rem", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", marginTop: 8, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? t("saving") : t("saveProfile")}
        </button>

        {/* Delete account section */}
        <div style={{ marginTop: "3rem", padding: "1.25rem", border: "1px solid #B3261E", borderRadius: 12, background: "#FFF5F5" }}>
          <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#B3261E", marginBottom: 6 }}>{t("deleteAccount")}</p>
          <p style={{ fontSize: "0.82rem", color: "#B3261E", lineHeight: 1.6, marginBottom: 12 }}>
            {t("deleteWarnPre")}<strong>liveid.asia/{handle}</strong>{t("deleteWarnPost")}
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{ background: "#B3261E", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" }}
          >
            {t("deleteMyAccount")}
          </button>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1.5rem" }}>
            <div style={{ background: "white", borderRadius: 16, padding: "2rem", maxWidth: 420, width: "100%", border: "2px solid #B3261E" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#B3261E", marginBottom: 8 }}>
                {t("modalTitle")}
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16 }}>
                {t("modalWarnPre")}<strong>liveid.asia/{handle}</strong>{t("modalWarnPost")}
              </p>

              <p style={{ fontSize: "0.85rem", color: "var(--ink)", fontWeight: 600, marginBottom: 8 }}>
                {t("typeToConfirmPre")}<strong>DELETE</strong>{t("typeToConfirmPost")}
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder={t("typeDeletePlaceholder")}
                style={{ ...inputStyle, border: "2px solid #B3261E", marginBottom: 12 }}
              />

              <p style={{ fontSize: "0.85rem", color: "var(--ink)", fontWeight: 600, marginBottom: 8 }}>
                {t("enterPassword")}
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                style={{ ...inputStyle, border: "2px solid #B3261E", marginBottom: 12 }}
              />

              {deleteError && <p style={{ color: "#B3261E", fontSize: "0.82rem", marginBottom: 12 }}>{deleteError}</p>}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  style={{ flex: 1, padding: "10px", background: "white", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.88rem", cursor: "pointer", color: "var(--text-muted)" }}
                >
                  {t("cancel")}
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
                  {deleting ? t("deleting") : t("confirmDelete")}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}