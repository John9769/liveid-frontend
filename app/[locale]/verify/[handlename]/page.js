"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import Navbar from "../../../../components/Navbar";
import { getPublicProfile, getToken } from "../../../../lib/api";

const labelStyle = { fontSize: "0.82rem", color: "var(--text-muted)", flexShrink: 0, marginRight: 12 };
const urlStyle = { fontSize: "0.82rem", color: "var(--trust-blue)", wordBreak: "break-all", textAlign: "right" };
const rowStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 };
const rowLabelStyle = { fontSize: "0.82rem", color: "var(--text-muted)", flexShrink: 0 };
const rowValueStyle = { fontSize: "0.82rem", color: "var(--ink)", textAlign: "right", wordBreak: "break-all" };

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

export default function VerifyPage() {
  const { handlename } = useParams();
  const locale = useLocale();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!handlename) return;
    let cancelled = false;

    getPublicProfile(handlename)
      .then((data) => { if (!cancelled) setResult(data); })
      .catch((err) => {
        if (cancelled) return;
        setResult({ verified: false, message: err.message || "Could not verify this handle." });
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [handlename]);

  const socials = result
    ? [
        { label: "Facebook", url: toUrl("facebook", result.facebook) },
        { label: "Instagram", url: toUrl("instagram", result.instagram) },
        { label: "TikTok", url: toUrl("tiktok", result.tiktok) },
        { label: "Twitter / X", url: toUrl("twitter", result.twitter) },
        { label: "YouTube", url: toUrl("youtube", result.youtube) },
        { label: "Website", url: toUrl("website", result.website) },
      ].filter((s) => s.url)
    : [];

  const hasOfficialAccounts = socials.length > 0;

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" }) : "—";

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <Navbar showLogin />
      <main style={{ maxWidth: 580, margin: "0 auto", padding: "3rem 1.5rem" }}>

        {loading && (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <p style={{ color: "var(--text-muted)" }}>Verifying…</p>
          </div>
        )}

        {!loading && result?.verified && (
          <div>
            {/* ---- VERDICT STAMP ---- */}
            <div style={{ background: "#F0FDF4", border: "2px solid var(--stamp-teal)", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
              <p className="font-mono" style={{ fontSize: "0.72rem", letterSpacing: "0.14em", color: "var(--stamp-teal)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                LiveID Verified
              </p>
              <h1 className="font-mono" style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--ink)", marginBottom: "0.25rem", wordBreak: "break-all" }}>
                liveid.asia/{result.handle}
              </h1>
              <p style={{ fontSize: "0.85rem", color: "var(--stamp-teal)", fontWeight: 600, margin: 0 }}>
                VERIFIED HUMAN
              </p>
            </div>

            {/* ---- THE ANTI-SCAM CORE ---- */}
            {hasOfficialAccounts ? (
              <div style={{ background: "#FFF8E1", border: "1px solid #F59E0B", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
                <p style={{ fontSize: "0.85rem", color: "#92400E", fontWeight: 700, marginBottom: 6 }}>
                  ⚠ How to not get scammed
                </p>
                <p style={{ fontSize: "0.82rem", color: "#92400E", lineHeight: 1.6, margin: 0 }}>
                  The accounts listed below are this person&apos;s <strong>only real accounts</strong>. Tap one to open it.
                  <br /><br />
                  If the account you are chatting with is <strong>not one of these</strong>, you are talking to a scammer who copied this link. Anyone can paste a LiveID link — only the real owner controls the accounts below.
                </p>
              </div>
            ) : (
              <div style={{ background: "#FFF5F5", border: "1px solid #B3261E", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
                <p style={{ fontSize: "0.85rem", color: "#B3261E", fontWeight: 700, marginBottom: 6 }}>
                  ⚠ Do not transact based on this page alone
                </p>
                <p style={{ fontSize: "0.82rem", color: "#B3261E", lineHeight: 1.6, margin: 0 }}>
                  This person is verified as a real human, but has <strong>not yet confirmed their official social accounts</strong>. That means this page cannot prove which Facebook, Instagram or TikTok account truly belongs to them.
                  <br /><br />
                  A scammer could copy this link onto a fake profile. Until the owner lists their official accounts here, do not treat this page as proof of who you are dealing with.
                </p>
              </div>
            )}

            {/* ---- IDENTITY + OFFICIAL ACCOUNTS ---- */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", background: "white" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "1.25rem" }}>
                <div style={{
                  width: 72,
                  height: 72,
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
                  fontSize: "1.4rem",
                }}>
                  {result.photoLocked ? "🔒" : null}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--ink)", margin: 0 }}>
                    {result.displayName || `liveid.asia/${result.handle}`}
                  </p>
                  {result.profession && (
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
                      {result.profession}
                    </p>
                  )}
                  {result.city && (
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
                      {result.city}
                    </p>
                  )}
                </div>
              </div>

              {result.bio && (
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: hasOfficialAccounts ? "1.25rem" : 0 }}>
                  {result.bio}
                </p>
              )}

              {hasOfficialAccounts && (
                <div>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    ✓ Their only real accounts — tap to check
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {socials.map((s) => (

                      <a
                      
                        key={s.label}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px 14px",
                          border: "1px solid var(--stamp-teal)",
                          borderRadius: 8,
                          background: "#F0FDF4",
                          textDecoration: "none",
                        }}
                      >
                        <span style={{ fontSize: "0.85rem", color: "var(--ink)", fontWeight: 600 }}>{s.label}</span>
                        <span style={{ fontSize: "0.82rem", color: "var(--stamp-teal)", fontWeight: 600 }}>Open →</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ---- SHOP ---- */}
            {result.shop && (
              <div style={{ border: "1px solid var(--stamp-teal)", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", background: "white" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stamp-teal)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                  Shop
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
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 16px" }}>
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
                            📷 Images on request — contact seller
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
                    No items listed yet.
                  </p>
                )}

                {result.whatsapp && (

                  <a
                  
                    href={`https://wa.me/${String(result.whatsapp).replace(/[^0-9]/g, "").replace(/^0/, "60")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", textAlign: "center", marginTop: 16, background: "var(--stamp-teal)", color: "white", padding: "11px", borderRadius: 8, fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}
                  >
                    Contact seller on WhatsApp
                  </a>
                )}
              </div>
            )}

            {/* ---- VERIFICATION DETAILS ---- */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem", background: "var(--mist)" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Verification details
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={rowStyle}>
                  <span style={rowLabelStyle}>Generic ID</span>
                  <span className="font-mono" style={rowValueStyle}>{result.genericId}</span>
                </div>
                <div style={rowStyle}>
                  <span style={rowLabelStyle}>Tier</span>
                  <span className="font-mono" style={rowValueStyle}>{result.tier}</span>
                </div>
                <div style={rowStyle}>
                  <span style={rowLabelStyle}>Verified on</span>
                  <span className="font-mono" style={rowValueStyle}>{fmtDate(result.verifiedAt)}</span>
                </div>
                <div style={rowStyle}>
                  <span style={rowLabelStyle}>Valid until</span>
                  <span className="font-mono" style={rowValueStyle}>{fmtDate(result.registrationExpiry)}</span>
                </div>
              </div>
            </div>

            {/* ---- SECURITY SEAL ---- */}
            {result.handleHash && (
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem", background: "white" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  LiveID Security Seal
                </p>
                <p className="font-mono" style={{ fontSize: "0.65rem", color: "var(--stamp-teal)", wordBreak: "break-all", lineHeight: 1.8, margin: 0 }}>
                  {result.handleHash}
                </p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 6, lineHeight: 1.6 }}>
                  A unique cryptographic seal generated when this handle was issued. It is bound to this person&apos;s verified identity and cannot be forged or reused.
                </p>
              </div>
            )}

            {/* ---- REFERRAL CTA ---- */}
            {result.isReferral && result.referralCode && (
              <div style={{ border: "2px solid var(--trust-blue)", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center", background: "#F0F7FF" }}>
                <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                  Verify Yourself. Get Your LiveID.
                </p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 16 }}>
                  Get your own verified handle at liveid.asia
                </p>
                <a
                
                  href={`/${locale}/register?ref=${result.referralCode}`}
                  style={{ display: "inline-block", background: "var(--trust-blue)", color: "white", padding: "12px 28px", borderRadius: 8, fontWeight: 600, fontSize: "0.95rem", textDecoration: "none" }}
                >
                  Get Your LiveID
                </a>
              </div>
            )}

            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.7 }}>
              Powered by LiveID — liveid.asia
              <br />
              AWAS Premium Resources (202603141446)
            </p>
          </div>
        )}

        {!loading && result?.expired && (
          <div style={{ border: "2px solid #B3261E", borderRadius: 12, padding: "2rem", textAlign: "center", background: "#FFF5F5" }}>
            <h1 className="font-display" style={{ fontSize: "1.6rem", color: "#B3261E", marginBottom: "1rem" }}>
              This handle has expired
            </h1>
            <p style={{ color: "#B3261E", fontSize: "0.95rem", lineHeight: 1.7, margin: 0 }}>
              The owner of{" "}
              <span className="font-mono">liveid.asia/{result.handle || handlename}</span>{" "}
              has not renewed their LiveID verification.
              <br /><br />
              Do not accept this handle as proof of identity. An expired LiveID does not confirm who this person is.
            </p>
          </div>
        )}

        {!loading && !result?.verified && !result?.expired && (
          <div style={{ border: "2px solid var(--border)", borderRadius: 12, padding: "2rem", textAlign: "center", background: "white" }}>
            <h1 className="font-display" style={{ fontSize: "1.6rem", color: "var(--ink)", marginBottom: "1rem" }}>
              Handle not found
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7, margin: 0 }}>
              <span className="font-mono">liveid.asia/{handlename}</span> is not a verified LiveID.
              <br /><br />
              If someone gave you this link as proof of identity, they are not verified.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}