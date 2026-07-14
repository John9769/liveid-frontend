"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Navbar from "../../../../components/Navbar";
import { getUserProfile, initiateRenewal, initiateVaultRenewal, initiatePremiumRenewal } from "../../../../lib/api";

export default function RenewalPage() {
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("liveid_user");
    if (!stored) { router.push(`/${locale}/login`); return; }

    const parsedUser = JSON.parse(stored);
    getUserProfile(parsedUser.id)
      .then((data) => setUser(data))
      .catch(() => router.push(`/${locale}/login`))
      .finally(() => setLoading(false));
  }, []);

  async function handleRenew() {
    if (!user) return;
    setProcessing(true);
    setError(null);

    try {
      let data;
      if (user.tier === "VAULT") {
        data = await initiateVaultRenewal(user.id);
      } else if (user.tier === "PREMIUM_VARIANT") {
        data = await initiatePremiumRenewal(user.id);
      } else {
        data = await initiateRenewal(user.id);
      }
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  }

  if (loading) return (
    <div><Navbar showLogin={false} />
      <main style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      </main>
    </div>
  );

  const isExpired = user?.registrationExpiry && new Date() > new Date(user.registrationExpiry);
  const expiryDate = user?.registrationExpiry
    ? new Date(user.registrationExpiry).toLocaleDateString("en-MY", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  const renewalAmount = user?.tier === "VAULT"
    ? "See your Vault renewal fee"
    : user?.tier === "PREMIUM_VARIANT"
    ? "RM28 + RM1 gateway"
    : "RM28 + RM1 gateway";

  return (
    <div>
      <Navbar showLogin={false} />
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <button
          onClick={() => router.push(`/${locale}/dashboard`)}
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", padding: 0, marginBottom: "1.5rem" }}
        >
          ← Back to dashboard
        </button>
        <h1 className="font-display" style={{ fontSize: "1.8rem", marginBottom: "0.5rem", color: "var(--ink)" }}>
          Annual Renewal
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "2rem" }}>
          Keep your Verified Human status and handle active.
        </p>

        <div
          style={{
            border: `1px solid ${isExpired ? "#B3261E" : "var(--border)"}`,
            borderRadius: 12,
            padding: "1.5rem",
            marginBottom: "1.5rem",
            background: isExpired ? "#FFF5F5" : "var(--mist)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Handle</span>
            <span className="font-mono" style={{ fontSize: "0.9rem", color: "var(--ink)" }}>
              liveid.asia/{user?.activeHandle || "—"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Tier</span>
            <span style={{ fontSize: "0.9rem", color: "var(--ink)", fontWeight: 500 }}>
              {user?.tier === "VAULT" ? "Vault" : user?.tier === "PREMIUM_VARIANT" ? "Premium" : "Standard"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {isExpired ? "Expired on" : "Expires on"}
            </span>
            <span style={{ fontSize: "0.9rem", color: isExpired ? "#B3261E" : "var(--ink)", fontWeight: 500 }}>
              {expiryDate || "—"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Renewal fee</span>
            <span style={{ fontSize: "0.9rem", color: "var(--ink)", fontWeight: 600 }}>{renewalAmount}</span>
          </div>
        </div>

        {error && <p style={{ color: "#B3261E", fontSize: "0.9rem", marginBottom: 12 }}>{error}</p>}

        <button
          onClick={handleRenew}
          disabled={processing}
          style={{
            border: "none",
            background: "var(--trust-blue)",
            color: "white",
            padding: "14px",
            borderRadius: 8,
            fontWeight: 500,
            fontSize: "1rem",
            width: "100%",
            cursor: "pointer",
          }}
        >
          {processing ? "Processing…" : "Renew now — " + renewalAmount}
        </button>

        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
          You will be redirected to ToyyibPay to complete payment.
        </p>
      </main>
    </div>
  );
}