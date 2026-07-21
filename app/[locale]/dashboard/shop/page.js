"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  getMyShopItems,
  addShopItem,
  updateShopItem,
  deleteShopItem,
  getStoredUser,
  clearSession,
} from "../../../../lib/api";

const EMPTY_ITEM = { name: "", price: "", detail: "", hasImages: false };

export default function ShopPage() {
  const locale = useLocale();
  const t = useTranslations("Shop");
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [handle, setHandle] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add-item form
  const [draft, setDraft] = useState(EMPTY_ITEM);
  const [adding, setAdding] = useState(false);

  // Which item is being edited inline
  const [editId, setEditId] = useState(null);
  const [editDraft, setEditDraft] = useState(EMPTY_ITEM);
  const [savingEdit, setSavingEdit] = useState(false);

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
        const data = await getMyShopItems(user.id);
        if (!cancelled) setItems(data.items || []);
      } catch (err) {
        if (cancelled) return;
        if (err.isAuthError) {
          clearSession();
          router.push(`/${locale}/login`);
          return;
        }
        setError(t("loadError"));
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [locale, router]);

  async function handleAdd() {
    if (!draft.name.trim()) {
      setError(t("nameRequired"));
      return;
    }
    setAdding(true);
    setError(null);
    try {
      const data = await addShopItem(userId, draft);
      setItems((prev) => [...prev, data.item]);
      setDraft(EMPTY_ITEM);
    } catch (err) {
      if (err.isAuthError) { clearSession(); router.push(`/${locale}/login`); return; }
      setError(err.message || t("addFailed"));
    } finally {
      setAdding(false);
    }
  }

  function startEdit(item) {
    setEditId(item.id);
    setEditDraft({
      name: item.name || "",
      price: item.price || "",
      detail: item.detail || "",
      hasImages: item.hasImages === true,
    });
    setError(null);
  }

  function cancelEdit() {
    setEditId(null);
    setEditDraft(EMPTY_ITEM);
  }

  async function saveEdit(itemId) {
    if (!editDraft.name.trim()) {
      setError(t("nameEmptyEdit"));
      return;
    }
    setSavingEdit(true);
    setError(null);
    try {
      const data = await updateShopItem(userId, itemId, editDraft);
      setItems((prev) => prev.map((i) => (i.id === itemId ? data.item : i)));
      cancelEdit();
    } catch (err) {
      if (err.isAuthError) { clearSession(); router.push(`/${locale}/login`); return; }
      setError(err.message || t("saveFailed"));
    } finally {
      setSavingEdit(false);
    }
  }

  async function toggleAvailable(item) {
    try {
      const data = await updateShopItem(userId, item.id, { isAvailable: !item.isAvailable });
      setItems((prev) => prev.map((i) => (i.id === item.id ? data.item : i)));
    } catch (err) {
      if (err.isAuthError) { clearSession(); router.push(`/${locale}/login`); return; }
      setError(err.message || t("updateFailed"));
    }
  }

  async function handleDelete(itemId) {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      await deleteShopItem(userId, itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      if (err.isAuthError) { clearSession(); router.push(`/${locale}/login`); return; }
      setError(err.message || t("deleteFailed"));
    }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--text-muted)" }}>{t("loading")}</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "3rem 1.5rem" }}>

        <button
          onClick={() => router.push(`/${locale}/dashboard/profile`)}
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", padding: 0, marginBottom: "1.5rem" }}
        >
          {t("backToProfile")}
        </button>

        <h1 className="font-display" style={{ fontSize: "1.8rem", marginBottom: "0.25rem", color: "var(--ink)" }}>
          {t("myShop")}
        </h1>
        {handle && (
          <p className="font-mono" style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
            liveid.asia/{handle}
          </p>
        )}
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "2rem" }}>
          {t("intro")}
        </p>

        {error && <p style={{ color: "#B3261E", fontSize: "0.85rem", marginBottom: 16 }}>{error}</p>}

        {/* ---- ADD NEW ITEM ---- */}
        <div style={{ padding: "1.25rem", border: "1px solid var(--border)", borderRadius: 12, marginBottom: "2rem", background: "var(--mist)" }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: 12 }}>{t("addItem")}</p>

          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder={t("namePlaceholder")}
            style={inputStyle}
          />
          <input
            type="text"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
            placeholder={t("pricePlaceholder")}
            style={inputStyle}
          />
          <textarea
            value={draft.detail}
            onChange={(e) => setDraft({ ...draft, detail: e.target.value })}
            placeholder={t("detailPlaceholder")}
            rows={2}
            style={{ ...inputStyle, resize: "vertical" }}
          />
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={draft.hasImages}
              onChange={(e) => setDraft({ ...draft, hasImages: e.target.checked })}
              style={{ width: 16, height: 16 }}
            />
            <span style={{ fontSize: "0.82rem", color: "var(--ink)" }}>{t("imagesOnRequest")}</span>
          </label>

          <button
            onClick={handleAdd}
            disabled={adding}
            style={{ width: "100%", background: "var(--trust-blue)", color: "white", border: "none", borderRadius: 8, padding: "11px", fontSize: "0.92rem", fontWeight: 600, cursor: adding ? "not-allowed" : "pointer", opacity: adding ? 0.7 : 1 }}
          >
            {adding ? t("adding") : t("addItemBtn")}
          </button>
        </div>

        {/* ---- ITEM LIST ---- */}
        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: 12 }}>
          {t("yourItems", { count: items.length })}
        </p>

        {items.length === 0 && (
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", padding: "1rem 0" }}>
            {t("emptyItems")}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "1rem 1.25rem",
                background: item.isAvailable ? "white" : "var(--mist)",
                opacity: item.isAvailable ? 1 : 0.7,
              }}
            >
              {editId === item.id ? (
                /* EDIT MODE */
                <div>
                  <input type="text" value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} placeholder={t("namePlaceholderShort")} style={inputStyle} />
                  <input type="text" value={editDraft.price} onChange={(e) => setEditDraft({ ...editDraft, price: e.target.value })} placeholder={t("pricePlaceholderShort")} style={inputStyle} />
                  <textarea value={editDraft.detail} onChange={(e) => setEditDraft({ ...editDraft, detail: e.target.value })} placeholder={t("detailPlaceholderShort")} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 12 }}>
                    <input type="checkbox" checked={editDraft.hasImages} onChange={(e) => setEditDraft({ ...editDraft, hasImages: e.target.checked })} style={{ width: 16, height: 16 }} />
                    <span style={{ fontSize: "0.82rem", color: "var(--ink)" }}>{t("imagesOnRequest")}</span>
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => saveEdit(item.id)} disabled={savingEdit} style={{ flex: 1, background: "var(--trust-blue)", color: "white", border: "none", borderRadius: 8, padding: "9px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>
                      {savingEdit ? t("saving") : t("save")}
                    </button>
                    <button onClick={cancelEdit} style={{ flex: 1, background: "white", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px", fontSize: "0.85rem", cursor: "pointer" }}>
                      {t("cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                /* VIEW MODE */
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--ink)", margin: "0 0 2px" }}>
                        {item.name}
                        {!item.isAvailable && <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 400 }}>{t("unavailableSuffix")}</span>}
                      </p>
                      {item.price && <p style={{ fontSize: "0.88rem", color: "var(--trust-blue)", margin: "0 0 4px", fontWeight: 500 }}>{item.price}</p>}
                      {item.detail && <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 4px", lineHeight: 1.5 }}>{item.detail}</p>}
                      {item.hasImages && <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: 0 }}>{t("imagesOnRequestBadge")}</p>}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 14, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <button onClick={() => startEdit(item)} style={linkBtn}>{t("edit")}</button>
                    <button onClick={() => toggleAvailable(item)} style={linkBtn}>
                      {item.isAvailable ? t("markUnavailable") : t("markAvailable")}
                    </button>
                    <button onClick={() => handleDelete(item.id)} style={{ ...linkBtn, color: "#B3261E" }}>{t("delete")}</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
  marginBottom: 10,
};

const linkBtn = {
  background: "none",
  border: "none",
  color: "var(--trust-blue)",
  fontSize: "0.82rem",
  fontWeight: 500,
  cursor: "pointer",
  padding: 0,
};