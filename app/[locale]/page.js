"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import SearchBar from "../../components/SearchBar";
import BillboardStrip from "../../components/BillboardStrip";
import Navbar from "../../components/Navbar";

function PhoneMockup() {
  return (
    <div
      style={{
        width: 260,
        borderRadius: 32,
        border: "8px solid var(--ink)",
        background: "white",
        overflow: "hidden",
        boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
      }}
    >
      {/* Verified stamp */}
      <div
        style={{
          background: "#F0FDF4",
          borderBottom: "1px solid var(--border)",
          padding: "18px 16px",
          textAlign: "center",
        }}
      >
        <p
          className="font-mono"
          style={{
            fontSize: "0.55rem",
            letterSpacing: "0.14em",
            color: "var(--stamp-teal)",
            textTransform: "uppercase",
            margin: "0 0 6px",
          }}
        >
          LiveID Verified
        </p>
        <p
          className="font-mono"
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--ink)",
            margin: "0 0 2px",
          }}
        >
          liveid.asia/hanim
        </p>
        <p
          style={{
            fontSize: "0.6rem",
            color: "var(--stamp-teal)",
            fontWeight: 600,
            margin: 0,
          }}
        >
          VERIFIED HUMAN
        </p>
      </div>

      {/* Identity */}
      <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundImage:
              "url(https://res.cloudinary.com/dugbnq9oz/image/upload/v1784293664/liveid_mobile_mockup_nc9gtr.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: "2px solid var(--stamp-teal)",
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
            Hanim Rashid
          </p>
          <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
            Online Seller
          </p>
        </div>
      </div>

      {/* Verification details */}
      <div
        style={{
          margin: "0 16px 16px",
          background: "var(--mist)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "10px 12px",
        }}
      >
        <Row label="Verified on" value="17 July 2026" />
        <Row label="Valid until" value="17 July 2027" />
      </div>

      {/* Seal */}
      <div style={{ padding: "0 16px 20px" }}>
        <p
          style={{
            fontSize: "0.5rem",
            fontWeight: 700,
            color: "var(--ink)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: "0 0 4px",
          }}
        >
          LiveID Security Seal
        </p>
        <p
          className="font-mono"
          style={{
            fontSize: "0.4rem",
            color: "var(--stamp-teal)",
            wordBreak: "break-all",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          3f2fb9557202edbf1916c10207c4e3dde35a50fcf042ec1c5400305670ae5e21
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{label}</span>
      <span className="font-mono" style={{ fontSize: "0.6rem", color: "var(--ink)" }}>
        {value}
      </span>
    </div>
  );
}

// Clean curated words are never sold — the product is the variant.
// These are examples that drive the search, not stock.
const VIP_HANDLES = [
  { name: "liveid.asia/bossali", handle: "bossali" },
  { name: "liveid.asia/queen888", handle: "queen888" },
  { name: "liveid.asia/kinghassan", handle: "kinghassan" },
  { name: "liveid.asia/prince99", handle: "prince99" },
  { name: "liveid.asia/princessdina", handle: "princessdina" },
  { name: "liveid.asia/tycoon888", handle: "tycoon888" },
  { name: "liveid.asia/richali", handle: "richali" },
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
      <main style={{ padding: "4rem 1.5rem 4rem" }}>
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "3rem",
            alignItems: "center",
          }}
        >
          {/* Left — the pitch and the search */}
          <div>
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(2.1rem, 4.5vw, 3.2rem)",
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "var(--ink)",
                margin: "0 0 1.2rem",
              }}
            >
              {t("tagline")}
            </h1>
            <p
              style={{
                fontSize: "clamp(1rem, 2vw, 1.15rem)",
                color: "var(--text-muted)",
                lineHeight: 1.65,
                margin: "0 0 2rem",
              }}
            >
              <strong style={{ color: "var(--ink)" }}>{t("subtitleBold")}</strong>{" "}
              {t("subtitleRest")}
            </p>

            <SearchBar />

            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                lineHeight: 1.6,
                margin: "1rem 0 0",
              }}
            >
              {t("heroFootnote")}
            </p>
          </div>

          {/* Right — the product, shown not described */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PhoneMockup />
          </div>
        </div>
      </main>

      {/* SELLER BEAT — featured use case, not a gate */}
      <section style={{ padding: "4rem 1.5rem", background: "var(--mist)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <p className="font-mono" style={{ fontSize: "0.72rem", letterSpacing: "0.14em", color: "var(--stamp-teal)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            {t("sellerLabel")}
          </p>
          <h2 className="font-display" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 600, color: "var(--ink)", marginBottom: "1rem", lineHeight: 1.2 }}>
            {t("sellerHeading")}
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.7, margin: "0 auto", maxWidth: 600 }}>
            {t("sellerBody")}
          </p>
        </div>
      </section>

      {/* VIP HANDLES */}
      <section style={{ padding: "4rem 1.5rem" }}>
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
      <section style={{ padding: "5rem 1.5rem", background: "var(--mist)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
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
            {t("whyStat")}
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

      {/* NOT A SELLER + PRICE */}
      <section style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <p className="font-mono" style={{ fontSize: "0.72rem", letterSpacing: "0.14em", color: "var(--stamp-teal)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            {t("everyoneLabel")}
          </p>
          <p style={{ fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "2.5rem" }}>
            {t("everyoneBody")}
          </p>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "2.5rem" }}>
            <p className="font-mono" style={{ fontSize: "0.72rem", letterSpacing: "0.14em", color: "var(--stamp-teal)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
              {t("priceLabel")}
            </p>
            <p style={{ fontSize: "1.05rem", color: "var(--ink)", lineHeight: 1.6, marginBottom: "1.75rem", fontWeight: 500 }}>
              {t("priceLine")}
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={{ border: "none", background: "var(--trust-blue)", color: "white", padding: "12px 28px", borderRadius: 8, fontWeight: 600, fontSize: "0.95rem", cursor: "pointer" }}
            >
              {t("whyCta")}
            </button>
          </div>
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