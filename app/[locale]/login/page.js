"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import { loginUser } from "../../../lib/api";

export default function LoginPage() {
  const locale = useLocale();
  const t = useTranslations("Login");
  const router = useRouter();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.phone || !form.password) {
      setError(t("errorFillAll"));
      return;
    }

    setLoading(true);
    try {
      // loginUser saves the token and user to localStorage on success
      const data = await loginUser({ phone: form.phone, password: form.password });

      if (!data?.token || !data?.user) {
        throw new Error(t("errorUnexpected"));
      }

      router.push(`/${locale}/dashboard`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div>
      <Navbar showLogin={false} />
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
            style={{ fontSize: "1.8rem", marginBottom: "0.5rem", color: "var(--ink)" }}
          >
            {t("title")}
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "2rem" }}>
            {t("subtitle")}
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <Field
              label={t("phoneLabel")}
              value={form.phone}
              onChange={(v) => updateField("phone", v)}
              placeholder="60123456789"
            />
            <Field
              label={t("passwordLabel")}
              value={form.password}
              onChange={(v) => updateField("password", v)}
              placeholder={t("passwordPlaceholder")}
              type="password"
            />

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
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? t("loggingIn") : t("loginButton")}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center" }}>
            <Link
              href={`/${locale}/reset-password`}
              style={{ fontSize: "0.85rem", color: "var(--trust-blue)" }}
            >
              {t("forgotPassword")}
            </Link>
          </div>

          <p
            style={{
              marginTop: 24,
              textAlign: "center",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
            }}
          >
            {t("noAccount")}{" "}
            <Link href={`/${locale}/register`} style={{ color: "var(--trust-blue)" }}>
              {t("claimHandle")}
            </Link>
          </p>
        </div>
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
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
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