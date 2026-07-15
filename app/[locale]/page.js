"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import SearchBar from "../../components/SearchBar";
import BillboardStrip from "../../components/BillboardStrip";
import Navbar from "../../components/Navbar";

const VIP_HANDLES = [
  { name: "liveid.asia/king", handle: "king" },
  { name: "liveid.asia/queen888", handle: "queen888" },
  { name: "liveid.asia/boss", handle: "boss" },
  { name: "liveid.asia/prince99", handle: "prince99" },
  { name: "liveid.asia/princess", handle: "princess" },
  { name: "liveid.asia/tycoon888", handle: "tycoon888" },
  { name: "liveid.asia/dato", handle: "dato" },
  { name: "liveid.asia/legend1", handle: "legend1" },
];

export default function Home() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const router = useRouter();

  const HOW_STEPS = [
    { number: "01", title: t("step01Title"), desc: t("step01Desc") },
    { number: "02", title: t("step02Title"), desc: t("step02Desc") },
    { number: "03", title: t("step03Title"), desc: t("step03Desc") },
  ];

  function handleClaim(handle) {
    router.push(`/${locale}/register?handle=${encodeURIComponent(handle)}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

      <Navbar showLogin />
      <BillboardStrip />

      {/* HERO */}
      <main style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "5rem 1.5rem 4rem", textAlign: "center" }}>
        <div style={{ maxWidth: 680, width: "100%" }}>
          <h1 className="font-display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.03em", color: "var(--ink)", margin: "0 0 1.2rem" }}>
            {t("tagline")}
          </h1>
          <p style={{ fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)", color: "var(--text-muted)", lineHeight: 1.65, margin: "0 0 2.75rem", maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
            <strong style={{ color: "var(--ink)" }}>{t("subtitleBold")}</strong>{" "}
            {t("subtitleRest")}
          </p>
          <SearchBar />
        </div>
      </main>

      {/* VIP HANDLES */}
      <section style={{ padding: "4rem 1.5rem", background: "var(--mist)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <p className="font-mono" style={{ fontSize: "0.72rem", letterSpacing: "0.14em", color: "var(--stamp-teal)", textTransform: "uppercase", marginBottom: "0.5rem", textAlign: "center" }}>
            {t("premiumLabel")}
          </p>
          <h2 className="font-display" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 600, color: "var(--ink)", textAlign: "center", marginBottom: "2.5rem" }}>
            {t("premiumHeading")}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12 }}>
            {VIP_HANDLES.map((v) => (
              <div key={v.name} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span className="font-mono" style={{ fontSize: "0.82rem", color: "var(--ink)", wordBreak: "break-all" }}>
                  {v.name}
                </span>
                <button
                  onClick={() => handleClaim(v.handle)}
                  style={{ flexShrink: 0, border: "1px solid var(--trust-blue)", background: "white", color: "var(--trust-blue)", borderRadius: 6, padding: "5px 12px", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  {t("claim")}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <p className="font-mono" style={{ fontSize: "0.72rem", letterSpacing: "0.14em", color: "var(--stamp-teal)", textTransform: "uppercase", marginBottom: "0.5rem", textAlign: "center" }}>
            {t("howLabel")}
          </p>
          <h2 className="font-display" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 600, color: "var(--ink)", textAlign: "center", marginBottom: "3rem" }}>
            {t("howHeading")}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
            {HOW_STEPS.map((s) => (
              <div key={s.number} style={{ textAlign: "center" }}>
                <span className="font-mono" style={{ fontSize: "2.5rem", fontWeight: 600, color: "var(--border)", display: "block", marginBottom: 12 }}>
                  {s.number}
                </span>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section style={{ padding: "4.5rem 1.5rem", background: "var(--ink)", textAlign: "center" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <p className="font-mono" style={{ fontSize: "0.72rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "1rem" }}>
            {t("whyLabel")}
          </p>
          <p className="font-display" style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", color: "white", lineHeight: 1.5, marginBottom: "1rem" }}>
            {t("whyStat").split("RM830 million").map((part, i) => (
              i === 0
                ? <span key={i}>{part}<span style={{ color: "#4ADE80" }}>RM830 million</span></span>
                : <span key={i}>{part}</span>
            ))}
          </p>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.75rem", lineHeight: 1.6 }}>
            {t("whyBeat2")}
          </p>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.8)", marginBottom: "2rem", lineHeight: 1.6 }}>
            {t("whyBeat3")}
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{ border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "white", padding: "12px 28px", borderRadius: 8, fontWeight: 500, fontSize: "0.95rem", cursor: "pointer" }}
          >
            {t("whyCta")}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "2rem 1.5rem", textAlign: "center", marginTop: "auto" }}>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.8 }}>
          © {new Date().getFullYear()} {t("footerLine1")}
          <br />
          <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{t("footerLine2")}</span>
        </p>
        <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 24 }}>
          <a href={`/${locale}/terms`} style={{ fontSize: "0.75rem", color: "var(--text-muted)", textDecoration: "none" }}>Terms & Conditions</a>
          <a href={`/${locale}/privacy`} style={{ fontSize: "0.75rem", color: "var(--text-muted)", textDecoration: "none" }}>Privacy Policy</a>
        </div>
      </footer>

    </div>
  );
}