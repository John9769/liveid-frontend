"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Navbar from "../../../components/Navbar";

const SECTIONS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s9a", "s10", "s11", "s12"];

export default function PrivacyPage() {
  const t = useTranslations("Privacy");
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <Navbar showLogin />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem" }}>

        <button
          onClick={() => {
            // router.back() dies when there is no history — a fresh tab, or
            // a click straight from the consent checkbox in a new window.
            // Fall back to the landing page so the button always does
            // something.
            if (window.history.length > 1) router.back();
            else router.push(`/${locale}`);
          }}
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", padding: 0, marginBottom: "1.5rem" }}
        >
          {t("back")}
        </button>

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>{t("title")}</h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 6 }}>{t("lastUpdated")}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {SECTIONS.map((s) => (
            <div key={s}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>{t(`${s}h`)}</h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.8, margin: 0, whiteSpace: "pre-line" }}>{t(`${s}b`)}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "3rem", padding: "1rem 1.25rem", background: "var(--mist)", borderRadius: 10, border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, textAlign: "center" }}>
            © {new Date().getFullYear()} {t("copyright")}
          </p>
        </div>

      </main>
    </div>
  );
}