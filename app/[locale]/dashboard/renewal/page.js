"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Navbar from "../../../../components/Navbar";
import {
  getUserProfile,
  initiateRenewal,
  initiateTitleRenewal,
  initiatePremiumRenewal,
  getStoredUser,
  clearSession,
} from "../../../../lib/api";

export default function RenewalPage() {
  const locale = useLocale();
  const t = useTranslations("Renewal");
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const stored = getStoredUser();
      if (!stored?.id) {
        clearSession();
        router.push(`/${locale}/login`);
        return;
      }

      try {
        const data = await getUserProfile(stored.id);
        if (!cancelled) setUser(data);
      } catch (err) {
        if (cancelled) return;
        clearSession();
        router.push(`/${locale}/login`);
        return;
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [locale, router]);

  async function handleRenew() {
    if (!user) return;
    setProcessing(true);
    setError(null);

    try {
      let data;
      if (user.tier === "TITLE") {
        data = await initiateTitleRenewal(user.id);
      } else if (user.tier === "PREMIUM_VARIANT") {
        data = await initiatePremiumRenewal(user.id);
      } else {
        data = await initiateRenewal(user.id);
      }

      if (!data?.paymentUrl) {
        throw new Error(t("startPaymentError"));
      }

      window.location.href = data.paymentUrl;
    } catch (err) {
      if (err.isAuthError) {
        clearSession();
        router.push(`/${locale}/login`);
        return;
      }
      setError(err.message);
      setProcessing(false);
    }
  }

  if (loading) return (
    <div>
      <Navbar showLogin={false} />
      <main style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <p style={{ color: "var(--text-muted)" }}>{t("loading")}</p>
      </main>
    </div>
  );

  const isExpired = user?.registrationExpiry && new Date() > new Date(user.registrationExpiry);
  const expiryDate = user?.registrationExpiry
    ? new Date(user.registrationExpiry).toLocaleDateString("en-MY", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  const tierLabel =
    user?.tier === "TITLE" ? t("tierTitle") :
    user?.tier === "PREMIUM_VARIANT" ? t("tierPremium") :
    t("tierStandard");

  // The exact amount is calculated by the backend from PricingConfig.
  // Never hardcode a figure here that could drift from the DB.
  const feeNote = user?.tier === "TITLE" ? t("feeNoteTitle") : t("feeNoteStandard");

  return (
    <div>
      <Navbar showLogin={false} />
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <button
          onClick={() => router.push(`/${locale}/dashboard`)}
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", padding: 0, marginBottom: "1.5rem" }}
        >
          {t("backToDashboard")}
        </button>

        <h1 className="font-display" style={{ fontSize: "1.8rem", marginBottom: "0.5rem", color: "var(--ink)" }}>
          {t("title")}
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "2rem" }}>
          {t("subtitle")}
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
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{t("handle")}</span>
            <span className="font-mono" style={{ fontSize: "0.9rem", color: "var(--ink)" }}>
              liveid.asia/{user?.activeHandle || "—"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{t("tier")}</span>
            <span style={{ fontSize: "0.9rem", color: "var(--ink)", fontWeight: 500 }}>
              {tierLabel}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {isExpired ? t("expiredOn") : t("expiresOn")}
            </span>
            <span style={{ fontSize: "0.9rem", color: isExpired ? "#B3261E" : "var(--ink)", fontWeight: 500 }}>
              {expiryDate || "—"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{t("renewalFee")}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "right", maxWidth: 220 }}>
              {feeNote}
            </span>
          </div>
        </div>

        {!user?.activeHandle && (
          <p style={{ color: "#B3261E", fontSize: "0.9rem", marginBottom: 12 }}>
            {t("noHandle")}
          </p>
        )}

        {error && <p style={{ color: "#B3261E", fontSize: "0.9rem", marginBottom: 12 }}>{error}</p>}

        <button
          onClick={handleRenew}
          disabled={processing || !user?.activeHandle}
          style={{
            border: "none",
            background: (!user?.activeHandle) ? "var(--border)" : "var(--trust-blue)",
            color: "white",
            padding: "14px",
            borderRadius: 8,
            fontWeight: 500,
            fontSize: "1rem",
            width: "100%",
            cursor: (processing || !user?.activeHandle) ? "not-allowed" : "pointer",
            opacity: processing ? 0.7 : 1,
          }}
        >
          {processing ? t("processing") : t("renewNow")}
        </button>

        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
          {t("amountNote")}
        </p>
      </main>
    </div>
  );
}