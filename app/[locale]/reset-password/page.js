"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { resetPassword } from "../../../lib/api";
import Navbar from "../../../components/Navbar";

export default function ResetPasswordPage() {
  const t = useTranslations("ResetPassword");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!password || !confirm) {
      setError(t("errFillBoth"));
      return;
    }
    if (password.length < 8) {
      setError(t("errMinLength"));
      return;
    }
    if (password !== confirm) {
      setError(t("errMismatch"));
      return;
    }
    if (!token) {
      setError(t("errInvalidLink"));
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Navbar />
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "3rem 1.5rem",
        }}
      >
        <div style={{ maxWidth: 420, width: "100%" }}>
          <h1
            className="font-display"
            style={{ fontSize: "1.8rem", marginBottom: "1.5rem", color: "var(--ink)" }}
          >
            {t("title")}
          </h1>

          {done ? (
            <p style={{ color: "var(--stamp-teal)", fontSize: "1rem" }}>
              {t("successMsg")}
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{t("newPassword")}</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("newPasswordPlaceholder")}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{t("confirmPassword")}</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder={t("confirmPasswordPlaceholder")}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                />
              </label>

              {error && (
                <p style={{ color: "#B3261E", fontSize: "0.9rem" }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  border: "none",
                  background: "var(--trust-blue)",
                  color: "white",
                  padding: "12px",
                  borderRadius: 8,
                  fontWeight: 500,
                  fontSize: "1rem",
                  marginTop: 8,
                }}
              >
                {loading ? t("resetting") : t("submit")}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}