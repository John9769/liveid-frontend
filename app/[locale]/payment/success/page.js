"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { getTransactionStatus, claimSession } from "../../../../lib/api";
import Navbar from "../../../../components/Navbar";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("Payment");
  const router = useRouter();
  const [status, setStatus] = useState("checking");
  const [handle, setHandle] = useState(null);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const transactionId = searchParams.get("transactionId");
    if (!transactionId) {
      setStatus("unknown");
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let timer = null;

    async function check() {
      if (cancelled) return;
      attempts++;

      try {
        const data = await getTransactionStatus(transactionId);
        if (cancelled) return;

        if (data.status === "SUCCESS") {
          // Exchange the paid transaction for a session so the user
          // lands logged in instead of having to type their password.
          try {
            const session = await claimSession(transactionId);
            if (cancelled) return;
            setHandle(session.user?.activeHandle || null);
            setClaimed(true);
          } catch {
            // Claim can fail (expired window, renewal rather than
            // registration). Payment still succeeded — say so.
            if (!cancelled) setClaimed(false);
          }
          if (!cancelled) setStatus("success");
          return;
        }

        if (data.status === "FAILED") {
          if (!cancelled) setStatus("failed");
          return;
        }
      } catch {
        // Transient — keep polling until we run out of attempts
      }

      if (cancelled) return;

      if (attempts >= 20) {
        setStatus("timeout");
        return;
      }

      timer = setTimeout(check, 3000);
    }

    check();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [searchParams]);

  const buttonStyle = {
    background: "var(--trust-blue)",
    color: "white",
    padding: "12px 24px",
    borderRadius: 8,
    fontWeight: 500,
    fontSize: "1rem",
    border: "none",
    cursor: "pointer",
    display: "inline-block",
  };

  return (
    <div>
      <Navbar showLogin={false} />
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          padding: "3rem 1.5rem",
          textAlign: "center",
        }}
      >
        {status === "checking" && (
          <div>
            <p style={{ color: "var(--text-muted)", marginBottom: 8 }}>{t("confirming")}</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
              {t("confirmingWait")}
            </p>
          </div>
        )}

        {status === "success" && (
          <div>
            <p style={{ fontSize: "3rem", marginBottom: 12 }}>✓</p>
            <h1 className="font-display" style={{ fontSize: "2rem", color: "var(--ink)", marginBottom: 12 }}>
              {t("successTitle")}
            </h1>

            {handle && (
              <p className="font-mono" style={{ fontSize: "1.1rem", color: "var(--trust-blue)", fontWeight: 600, marginBottom: 12 }}>
                liveid.asia/{handle}
              </p>
            )}

            <p style={{ color: "var(--text-muted)", marginBottom: 8 }}>
              {t("handleLive")}
            </p>
            <p style={{ color: "var(--ink)", fontWeight: 600, marginBottom: 24 }}>
              {t("checkEmail")}
            </p>

            {claimed ? (
              <button
                onClick={() => router.push(`/${locale}/dashboard`)}
                style={buttonStyle}
              >
                {t("goDashboard")}
              </button>
            ) : (
              <Link href={`/${locale}/login`} style={buttonStyle}>
                {t("logInAccount")}
              </Link>
            )}
          </div>
        )}

        {status === "failed" && (
          <div>
            <h1 className="font-display" style={{ fontSize: "2rem", color: "#B3261E", marginBottom: 12 }}>
              {t("failedTitle")}
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              {t("failedBody")}
            </p>
            <Link href={`/${locale}/register`} style={buttonStyle}>
              {t("tryAgain")}
            </Link>
          </div>
        )}

        {status === "timeout" && (
          <div>
            <h1 className="font-display" style={{ fontSize: "1.8rem", color: "var(--ink)", marginBottom: 12 }}>
              {t("timeoutTitle")}
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: 24, maxWidth: 420, lineHeight: 1.7 }}>
              {t("timeoutBody")}
            </p>
            <Link href={`/${locale}/login`} style={buttonStyle}>
              {t("goLogin")}
            </Link>
          </div>
        )}

        {status === "unknown" && (
          <div>
            <h1 className="font-display" style={{ fontSize: "1.8rem", color: "var(--ink)", marginBottom: 12 }}>
              {t("unknownTitle")}
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              {t("unknownBody")}
            </p>
            <Link href={`/${locale}`} style={buttonStyle}>
              {t("goHome")}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}