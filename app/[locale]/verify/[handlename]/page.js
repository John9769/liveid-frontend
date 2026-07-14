"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../../../components/Navbar";
import { verifyHandle } from "../../../../lib/api";

export default function VerifyPage() {
  const { handlename } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!handlename) return;
    verifyHandle(handlename)
      .then(setResult)
      .catch(() => setResult({ verified: false, message: "Could not verify this handle." }))
      .finally(() => setLoading(false));
  }, [handlename]);

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
            <div style={{ background: "#F0FDF4", border: "2px solid var(--stamp-teal)", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
              <p className="font-mono" style={{ fontSize: "0.72rem", letterSpacing: "0.14em", color: "var(--stamp-teal)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                ✓ LiveID Verified
              </p>
              <h1 className="font-mono" style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--ink)", marginBottom: "0.25rem" }}>
                liveid.asia/{result.handle}
              </h1>
              <p style={{ fontSize: "0.85rem", color: "var(--stamp-teal)", fontWeight: 600 }}>VERIFIED HUMAN</p>
            </div>

            <div style={{ background: "#FFF8E1", border: "1px solid #F59E0B", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.85rem", color: "#92400E", fontWeight: 600, marginBottom: 6 }}>⚠ Important — Read before you transact</p>
              <p style={{ fontSize: "0.82rem", color: "#92400E", lineHeight: 1.6, margin: 0 }}>
                This page is the <strong>only authentic proof</strong> of this person&apos;s verified identity. You are seeing this because you clicked the link directly.
                <br /><br />
                <strong>If someone sent you a screenshot of this page — do not trust it.</strong> Screenshots can be faked. Only trust what you see by clicking the link yourself.
                <br /><br />
                Compare the person you are dealing with against the official accounts below. If they don&apos;t match — you are talking to a scammer.
              </p>
            </div>

            <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "1.25rem" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundImage: result.photoUrl ? `url(${result.photoUrl})` : "none", backgroundSize: "cover", backgroundPosition: "center", background: result.photoUrl ? undefined : "var(--mist)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                  {!result.photoUrl && "👤"}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "1rem", color: "var(--ink)", marginBottom: 2 }}>
                    {result.displayName || `LiveID/${result.handle}`}
                  </p>
                  {result.profession && <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{result.profession}</p>}
                  {result.city && <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>📍 {result.city}</p>}
                </div>
              </div>

              {result.bio && (
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.25rem" }}>{result.bio}</p>
              )}

              {(result.instagram || result.tiktok || result.facebook || result.twitter || result.youtube || result.website) && (
                <div>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    Official accounts — verify before you transact
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.instagram && <SocialLink label="Instagram" url={result.instagram} />}
                    {result.tiktok && <SocialLink label="TikTok" url={result.tiktok} />}
                    {result.facebook && <SocialLink label="Facebook" url={result.facebook} />}
                    {result.twitter && <SocialLink label="Twitter / X" url={result.twitter} />}
                    {result.youtube && <SocialLink label="YouTube" url={result.youtube} />}
                    {result.website && <SocialLink label="Website" url={result.website} />}
                  </div>
                </div>
              )}
            </div>

            <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem", background: "var(--mist)" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Verification details
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <DetailRow label="Generic ID" value={result.genericId} />
                <DetailRow label="Tier" value={result.tier} />
                <DetailRow label="Verified on" value={result.verifiedAt ? new Date(result.verifiedAt).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
                <DetailRow label="Valid until" value={result.registrationExpiry ? new Date(result.registrationExpiry).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
              </div>
            </div>

            {result.handleHash && (
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  LiveID Security Seal
                </p>
                <p className="font-mono" style={{ fontSize: "0.65rem", color: "var(--stamp-teal)", wordBreak: "break-all", lineHeight: 1.8, margin: 0 }}>
                  {result.handleHash}
                </p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 6 }}>
                  This seal is cryptographically generated from the owner&apos;s verified biometric identity. It cannot be forged or replicated.
                </p>
              </div>
            )}

            {result.isReferral && result.referralCode && (
              <div style={{ border: "2px solid var(--trust-blue)", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center", background: "#F0F7FF" }}>
                <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                  Verify Yourself. Get Your LiveID.
                </p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 16 }}>
                  Join thousands of verified humans on LiveID.
                </p>
                
                  <a href={`/en/register?ref=${result.referralCode}`} style={{ display: "inline-block", background: "var(--trust-blue)", color: "white", padding: "12px 28px", borderRadius: 8, fontWeight: 600, fontSize: "0.95rem", textDecoration: "none" }}>Get Your LiveID</a>
              </div>
            )}

            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center" }}>
              Powered by LiveID — liveid.asia<br />AWAS Premium Resources (202603141446)
            </p>
          </div>
        )}

        {!loading && result?.expired && (
          <div style={{ border: "2px solid #B3261E", borderRadius: 12, padding: "2rem", textAlign: "center", background: "#FFF5F5" }}>
            <h1 className="font-display" style={{ fontSize: "1.6rem", color: "#B3261E", marginBottom: "1rem" }}>⚠ This handle has expired</h1>
            <p style={{ color: "#B3261E", fontSize: "0.95rem", lineHeight: 1.6 }}>
              The owner of <span className="font-mono">liveid.asia/{handlename}</span> has not renewed their LiveID verification.
              <br /><br />
              <strong>Do not transact with anyone using this handle as proof of identity.</strong>
            </p>
          </div>
        )}

        {!loading && !result?.verified && !result?.expired && (
          <div style={{ border: "2px solid var(--border)", borderRadius: 12, padding: "2rem", textAlign: "center" }}>
            <h1 className="font-display" style={{ fontSize: "1.6rem", color: "var(--ink)", marginBottom: "1rem" }}>Handle not found</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              <span className="font-mono">liveid.asia/{handlename}</span> does not exist or has never been registered.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}

function SocialLink({ label, url }) {
  function handleClick() {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  return (
    <div onClick={handleClick} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "white", cursor: "pointer" }}>
      <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: "0.82rem", color: "var(--trust-blue)", wordBreak: "break-all", textAlign: "right", maxWidth: "70%" }}>{url}</span>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{label}</span>
      <span className="font-mono" style={{ fontSize: "0.82rem", color: "var(--ink)" }}>{value}</span>
    </div>
  );
}