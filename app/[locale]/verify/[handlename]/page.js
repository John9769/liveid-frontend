"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Navbar from "../../../../components/Navbar";
import { getPublicProfile, checkWhatsapp } from "../../../../lib/api";

const rowStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 };
const rowLabelStyle = { fontSize: "0.82rem", color: "var(--text-muted)", flexShrink: 0 };
const rowValueStyle = { fontSize: "0.82rem", color: "var(--ink)", textAlign: "right", wordBreak: "break-all" };

const cardStyle = {
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "1.25rem 1.5rem",
  marginBottom: "1rem",
  background: "white",
};

const checkNumStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 24,
  height: 24,
  borderRadius: "50%",
  background: "var(--trust-blue)",
  color: "white",
  fontSize: "0.78rem",
  fontWeight: 700,
  flexShrink: 0,
};

// A raw handle or URL becomes a real clickable link.
function toUrl(kind, val) {
  if (!val) return null;
  const v = String(val).trim();
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  const u = v.replace(/^@/, "");
  switch (kind) {
    case "instagram": return `https://instagram.com/${u}`;
    case "tiktok": return `https://tiktok.com/@${u}`;
    case "facebook": return `https://facebook.com/${u}`;
    case "twitter": return `https://x.com/${u}`;
    case "youtube": return `https://youtube.com/@${u}`;
    case "website": return v.includes(".") ? `https://${v}` : null;
    default: return v;
  }
}

// The username is the comparison, not the link. A scammer's lookalike
// account is caught by reading @ladyboss against @ladyboss_official —
// which still works when the real profile is private and unopenable.
function toDisplayName(kind, val) {
  if (!val) return null;
  const v = String(val).trim();

  if (!v.startsWith("http")) {
    return kind === "website" ? v : `@${v.replace(/^@/, "")}`;
  }

  try {
    const u = new URL(v);
    if (kind === "website") return u.hostname.replace(/^www\./, "");
    const seg = u.pathname.split("/").filter(Boolean);
    if (!seg.length) return u.hostname.replace(/^www\./, "");
    const last = seg[seg.length - 1];
    return `@${last.replace(/^@/, "")}`;
  } catch {
    return v;
  }
}

export default function VerifyPage() {
  const { handlename } = useParams();
  const locale = useLocale();
  const t = useTranslations("Verify");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!handlename) return;
    let cancelled = false;

    getPublicProfile(handlename)
      .then((data) => { if (!cancelled) setResult(data); })
      .catch((err) => {
        if (cancelled) return;
        setResult({ verified: false, message: err.message || t("couldNotVerify") });
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [handlename, t]);

  const socials = result
    ? [
        { label: "Facebook", kind: "facebook", raw: result.facebook },
        { label: "Instagram", kind: "instagram", raw: result.instagram },
        { label: "TikTok", kind: "tiktok", raw: result.tiktok },
        { label: "Twitter / X", kind: "twitter", raw: result.twitter },
        { label: "YouTube", kind: "youtube", raw: result.youtube },
        { label: "Website", kind: "website", raw: result.website },
      ]
        .filter((s) => s.raw)
        .map((s) => ({ ...s, url: toUrl(s.kind, s.raw), name: toDisplayName(s.kind, s.raw) }))
        .filter((s) => s.url)
    : [];

  const hasSocials = socials.length > 0;
  const hasPhotoOnFile = result?.hasPhoto === true;
  const showWhatsappCheck = result?.whatsappCheckAvailable === true;
  const showWhatsappNumber = !!result?.whatsapp;
  const hasWhatsappCheck = showWhatsappCheck || showWhatsappNumber;

  // Only the checks actually rendered are counted. A page that cannot
  // offer a face check must never claim three.
  const totalChecks =
    (hasPhotoOnFile ? 1 : 0) + (hasSocials ? 1 : 0) + (hasWhatsappCheck ? 1 : 0);

  let n = 0;
  const numFace = hasPhotoOnFile ? ++n : null;
  const numSocial = hasSocials ? ++n : null;
  const numWhatsapp = hasWhatsappCheck ? ++n : null;

  const dateLocale = locale === "ms" ? "ms-MY" : "en-MY";
  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" }) : "—";

  const verdictLabel =
    totalChecks >= 3 ? t("verdictAll", { count: totalChecks })
      : totalChecks === 2 ? t("verdictBoth")
      : t("verdictOne");

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <Navbar showLogin />
      <main style={{ maxWidth: 580, margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {loading && (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <p style={{ color: "var(--text-muted)" }}>{t("verifying")}</p>
          </div>
        )}

        {!loading && result?.verified && (
          <div>

            {/* ---- WELCOME ---- */}
            <div style={{ marginBottom: "1.5rem" }}>
              <p className="font-mono" style={{ fontSize: "0.7rem", letterSpacing: "0.14em", color: "var(--stamp-teal)", textTransform: "uppercase", marginBottom: 8 }}>
                {t("welcomeLabel")}
              </p>
              <h1 className="font-mono" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 4px", wordBreak: "break-all" }}>
                liveid.asia/{result.handle}
              </h1>
              <p style={{ fontSize: "0.85rem", color: "var(--stamp-teal)", fontWeight: 600, margin: "0 0 12px" }}>
                ✓ {t("verifiedHuman")}
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>
                {t("welcomeBody")}
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--ink)", fontWeight: 600, lineHeight: 1.65, margin: "10px 0 0" }}>
                {t("welcomeInstruction")}
              </p>
            </div>

            {/* ---- NO CHECKS AVAILABLE ---- */}
            {totalChecks === 0 && (
              <div style={{ background: "#FFF5F5", border: "1px solid #B3261E", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
                <p style={{ fontSize: "0.85rem", color: "#B3261E", fontWeight: 700, margin: "0 0 6px" }}>
                  ⚠ {t("cannotConfirmTitle")}
                </p>
                <p style={{ fontSize: "0.82rem", color: "#B3261E", lineHeight: 1.65, margin: 0 }}>
                  {t("cannotConfirmBody")}
                </p>
              </div>
            )}

            {/* ---- CHECK: FACE ---- */}
            {hasPhotoOnFile && (
              <div style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={checkNumStyle}>{numFace}</span>
                  <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                    {t("checkFaceTitle")}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 84,
                    height: 84,
                    borderRadius: "50%",
                    backgroundImage: result.photoUrl ? `url(${result.photoUrl})` : "none",
                    backgroundColor: result.photoUrl ? "transparent" : "var(--mist)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: `2px solid ${result.photoLocked ? "var(--border)" : "var(--stamp-teal)"}`,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.6rem",
                  }}>
                    {result.photoLocked ? "🔒" : null}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    {result.displayName && (
                      <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--ink)", margin: "0 0 2px" }}>
                        {result.displayName}
                      </p>
                    )}
                    {result.profession && (
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 2px" }}>
                        {result.profession}
                      </p>
                    )}
                    {result.city && (
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                        {result.city}
                      </p>
                    )}
                  </div>
                </div>

                {result.photoLocked ? (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "12px 0 0" }}>
                    🔒 {t("checkFaceLocked")}
                  </p>
                ) : (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "12px 0 0" }}>
                    {t("checkFaceBody", { handle: result.handle })}
                  </p>
                )}
              </div>
            )}

            {/* ---- CHECK: SOCIAL ACCOUNTS ---- */}
            {hasSocials && (
              <div style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={checkNumStyle}>{numSocial}</span>
                  <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                    {t("checkSocialTitle")}
                  </p>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 12px" }}>
                  {t("checkSocialBody", { handle: result.handle })}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {socials.map((s) => (
                    <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "11px 14px", border: "1px solid var(--stamp-teal)", borderRadius: 8, background: "#F0FDF4", textDecoration: "none" }}><span style={{ minWidth: 0 }}><span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 1 }}>{s.label}</span><span className="font-mono" style={{ display: "block", fontSize: "0.88rem", color: "var(--ink)", fontWeight: 700, wordBreak: "break-all" }}>{s.name}</span></span><span style={{ fontSize: "0.8rem", color: "var(--stamp-teal)", fontWeight: 600, flexShrink: 0 }}>{t("open")}</span></a>
                  ))}
                </div>

                <div style={{ background: "#FFF8E1", border: "1px solid #F59E0B", borderRadius: 8, padding: "10px 12px", marginTop: 12 }}>
                  <p style={{ fontSize: "0.78rem", color: "#92400E", lineHeight: 1.6, margin: 0 }}>
                    ⚠ {t("lookalikeWarning")}
                  </p>
                </div>
              </div>
            )}

            {/* ---- CHECK: WHATSAPP ---- */}
            {hasWhatsappCheck && (
              <div style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={checkNumStyle}>{numWhatsapp}</span>
                  <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                    {t("checkWhatsappTitle")}
                  </p>
                </div>

                {showWhatsappNumber ? (
                  <div>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 10px" }}>
                      {t("checkWhatsappBodyPublic")}
                    </p>
                    <p className="font-mono" style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                      {result.whatsapp}
                    </p>
                  </div>
                ) : (
                  <WhatsappMatch handle={result.handle} t={t} />
                )}
              </div>
            )}

            {/* ---- VERDICT ---- */}
            {totalChecks > 0 && (
              <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: "1.5rem", border: "1px solid var(--border)" }}>
                <div style={{ background: "#F0FDF4", padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
                  <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--stamp-teal)", margin: "0 0 4px" }}>
                    {verdictLabel}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "var(--ink)", lineHeight: 1.6, margin: 0 }}>
                    ✅ {t("verdictPass", { handle: result.handle })}
                  </p>
                </div>
                <div style={{ background: "#FFF5F5", padding: "1rem 1.25rem" }}>
                  <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#B3261E", margin: "0 0 4px" }}>
                    {t("verdictFailLabel")}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "#B3261E", lineHeight: 1.6, margin: 0 }}>
                    🚨 {t("verdictFail", { handle: result.handle })}
                  </p>
                </div>
              </div>
            )}

            {/* ---- BIO ---- */}
            {result.bio && (
              <div style={cardStyle}>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>
                  {result.bio}
                </p>
              </div>
            )}

            {/* ---- SHOP ---- */}
            {result.shop && (
              <div style={{ border: "1px solid var(--stamp-teal)", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1rem", background: "white" }}>
                <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--stamp-teal)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>
                  {t("shop")}
                </p>
                {result.shop.title && (
                  <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 2px" }}>
                    {result.shop.title}
                  </p>
                )}
                {result.shop.area && (
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 4px" }}>
                    {result.shop.area}
                  </p>
                )}
                {result.shop.about && (
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 14px" }}>
                    {result.shop.about}
                  </p>
                )}

                {result.shop.items?.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                    {result.shop.items.map((item) => (
                      <div key={item.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", background: "var(--paper)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                          <p style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}>{item.name}</p>
                          {item.price && (
                            <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--trust-blue)", margin: 0, whiteSpace: "nowrap" }}>{item.price}</p>
                          )}
                        </div>
                        {item.detail && (
                          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "6px 0 0", lineHeight: 1.5 }}>{item.detail}</p>
                        )}
                        {item.hasImages && (
                          <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: "6px 0 0" }}>
                            📷 {t("imagesOnRequest")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
                    {t("noItems")}
                  </p>
                )}

                {result.whatsapp && (
                  <a href={`https://wa.me/${String(result.whatsapp).replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", marginTop: 16, background: "var(--stamp-teal)", color: "white", padding: "11px", borderRadius: 8, fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>{t("contactWhatsApp")}</a>
                )}
              </div>
            )}

            {/* ---- VERIFICATION DETAILS ---- */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem", background: "var(--mist)" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
                {t("verificationDetails")}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={rowStyle}>
                  <span style={rowLabelStyle}>{t("genericId")}</span>
                  <span className="font-mono" style={rowValueStyle}>{result.genericId}</span>
                </div>
                <div style={rowStyle}>
                  <span style={rowLabelStyle}>{t("tier")}</span>
                  <span className="font-mono" style={rowValueStyle}>{result.tier}</span>
                </div>
                <div style={rowStyle}>
                  <span style={rowLabelStyle}>{t("verifiedOn")}</span>
                  <span className="font-mono" style={rowValueStyle}>{fmtDate(result.verifiedAt)}</span>
                </div>
                <div style={rowStyle}>
                  <span style={rowLabelStyle}>{t("validUntil")}</span>
                  <span className="font-mono" style={rowValueStyle}>{fmtDate(result.registrationExpiry)}</span>
                </div>
              </div>
            </div>

            {/* ---- SECURITY SEAL ---- */}
            {result.handleHash && (
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem", background: "white" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>
                  {t("securitySeal")}
                </p>
                <p className="font-mono" style={{ fontSize: "0.62rem", color: "var(--stamp-teal)", wordBreak: "break-all", lineHeight: 1.8, margin: 0 }}>
                  {result.handleHash}
                </p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 6, lineHeight: 1.6 }}>
                  {t("sealDesc")}
                </p>
              </div>
            )}

            {/* ---- REFERRAL CTA ---- */}
            {result.isReferral && result.referralCode && (
              <div style={{ border: "2px solid var(--trust-blue)", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center", background: "#F0F7FF" }}>
                <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 6px" }}>
                  {t("referralTitle")}
                </p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 16px" }}>
                  {t("referralSubtitle")}
                </p>
                <a href={`/${locale}/register?ref=${result.referralCode}`} style={{ display: "inline-block", background: "var(--trust-blue)", color: "white", padding: "12px 28px", borderRadius: 8, fontWeight: 600, fontSize: "0.95rem", textDecoration: "none" }}>{t("referralButton")}</a>
              </div>
            )}

            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.7 }}>
              {t("poweredBy")}
              <br />
              AWAS Premium Resources (202603141446)
            </p>
          </div>
        )}

        {!loading && result?.expired && (
          <div style={{ border: "2px solid #B3261E", borderRadius: 12, padding: "2rem", textAlign: "center", background: "#FFF5F5" }}>
            <h1 className="font-display" style={{ fontSize: "1.6rem", color: "#B3261E", marginBottom: "1rem" }}>
              {t("expiredTitle")}
            </h1>
            <p style={{ color: "#B3261E", fontSize: "0.95rem", lineHeight: 1.7, margin: 0 }}>
              {t("expiredPre")}{" "}
              <span className="font-mono">liveid.asia/{result.handle || handlename}</span>{" "}
              {t("expiredMid")}
              <br /><br />
              {t("expiredPost")}
            </p>
          </div>
        )}

        {!loading && !result?.verified && !result?.expired && (
          <div style={{ border: "2px solid var(--border)", borderRadius: 12, padding: "2rem", textAlign: "center", background: "white" }}>
            <h1 className="font-display" style={{ fontSize: "1.6rem", color: "var(--ink)", marginBottom: "1rem" }}>
              {t("notFoundTitle")}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7, margin: 0 }}>
              <span className="font-mono">liveid.asia/{handlename}</span> {t("notFoundMid")}
              <br /><br />
              {t("notFoundPost")}
            </p>
          </div>
        )}

      </main>
    </div>
  );
}

// ============================================================
// NUMBER MATCH
//
// The owner keeps their number private. The visitor already has
// a number from whoever is messaging them, so they type that in
// and get back yes or no. The number on file never reaches the
// browser — there is nothing here to scrape.
// ============================================================

function WhatsappMatch({ handle, t }) {
  const [number, setNumber] = useState("");
  const [checking, setChecking] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const [remaining, setRemaining] = useState(null);

  async function run() {
    if (!number.trim() || checking) return;
    setChecking(true);
    setOutcome(null);

    try {
      const data = await checkWhatsapp(handle, number.trim());

      if (data.invalidNumber) setOutcome("invalid");
      else if (data.rateLimited) setOutcome("limited");
      else if (data.notAvailable) setOutcome("unavailable");
      else setOutcome(data.matched ? "match" : "nomatch");

      if (typeof data.remaining === "number") setRemaining(data.remaining);
    } catch {
      setOutcome("error");
    } finally {
      setChecking(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter") run();
  }

  const spent = outcome === "limited" || remaining === 0;

  return (
    <div>
      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 12px" }}>
        {t("checkWhatsappBodyPrivate")}
      </p>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="tel"
          inputMode="tel"
          value={number}
          onChange={(e) => { setNumber(e.target.value); setOutcome(null); }}
          onKeyDown={onKeyDown}
          placeholder={t("checkWhatsappPlaceholder")}
          disabled={spent}
          style={{
            flex: 1,
            minWidth: 0,
            padding: "11px 12px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: "0.95rem",
            outline: "none",
            background: spent ? "var(--mist)" : "white",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={run}
          disabled={checking || spent || !number.trim()}
          style={{
            background: (checking || spent || !number.trim()) ? "var(--border)" : "var(--trust-blue)",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "11px 18px",
            fontSize: "0.88rem",
            fontWeight: 600,
            cursor: (checking || spent || !number.trim()) ? "not-allowed" : "pointer",
            flexShrink: 0,
          }}
        >
          {checking ? t("checking") : t("checkButton")}
        </button>
      </div>

      {outcome === "match" && (
        <div style={{ background: "#F0FDF4", border: "1px solid var(--stamp-teal)", borderRadius: 8, padding: "11px 13px", marginTop: 10 }}>
          <p style={{ fontSize: "0.85rem", color: "var(--stamp-teal)", fontWeight: 700, margin: 0 }}>
            ✅ {t("matchYes", { handle })}
          </p>
        </div>
      )}

      {outcome === "nomatch" && (
        <div style={{ background: "#FFF5F5", border: "1px solid #B3261E", borderRadius: 8, padding: "11px 13px", marginTop: 10 }}>
          <p style={{ fontSize: "0.85rem", color: "#B3261E", fontWeight: 700, margin: "0 0 4px" }}>
            🚨 {t("matchNo", { handle })}
          </p>
          <p style={{ fontSize: "0.8rem", color: "#B3261E", lineHeight: 1.6, margin: 0 }}>
            {t("matchNoBody")}
          </p>
        </div>
      )}

      {outcome === "invalid" && (
        <p style={{ fontSize: "0.8rem", color: "#B3261E", margin: "10px 0 0" }}>
          {t("matchInvalid")}
        </p>
      )}

      {outcome === "limited" && (
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "10px 0 0" }}>
          {t("matchLimited")}
        </p>
      )}

      {outcome === "unavailable" && (
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "10px 0 0" }}>
          {t("matchUnavailable")}
        </p>
      )}

      {outcome === "error" && (
        <p style={{ fontSize: "0.8rem", color: "#B3261E", margin: "10px 0 0" }}>
          {t("matchError")}
        </p>
      )}

      {remaining !== null && outcome !== "limited" && (
        <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", margin: "8px 0 0" }}>
          {t("matchRemaining", { count: remaining })}
        </p>
      )}

      {remaining === null && outcome === null && (
        <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", margin: "8px 0 0" }}>
          {t("matchAllowance")}
        </p>
      )}
    </div>
  );
}