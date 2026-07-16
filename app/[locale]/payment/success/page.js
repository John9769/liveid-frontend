"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { getTransactionStatus, claimSession } from "../../../../lib/api";
import Navbar from "../../../../components/Navbar";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
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
            <p style={{ color: "var(--text-muted)", marginBottom: 8 }}>Confirming your payment…</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
              This can take up to a minute. Please do not close this page.
            </p>
          </div>
        )}

        {status === "success" && (
          <div>
            <p style={{ fontSize: "3rem", marginBottom: 12 }}>✓</p>
            <h1 className="font-display" style={{ fontSize: "2rem", color: "var(--ink)", marginBottom: 12 }}>
              You&apos;re verified.
            </h1>

            {handle && (
              <p className="font-mono" style={{ fontSize: "1.1rem", color: "var(--trust-blue)", fontWeight: 600, marginBottom: 12 }}>
                liveid.asia/{handle}
              </p>
            )}

            <p style={{ color: "var(--text-muted)", marginBottom: 8 }}>
              Your handle is now live.
            </p>
            <p style={{ color: "var(--ink)", fontWeight: 600, marginBottom: 24 }}>
              Check your email — we&apos;ve sent your setup guide.
            </p>

            {claimed ? (
              <button
                onClick={() => router.push(`/${locale}/dashboard`)}
                style={buttonStyle}
              >
                Go to my dashboard
              </button>
            ) : (
              <Link href={`/${locale}/login`} style={buttonStyle}>
                Log in to your account
              </Link>
            )}
          </div>
        )}

        {status === "failed" && (
          <div>
            <h1 className="font-display" style={{ fontSize: "2rem", color: "#B3261E", marginBottom: 12 }}>
              Payment failed
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              Your payment was not completed. No charge was made. Please try again.
            </p>
            <Link href={`/${locale}/register`} style={buttonStyle}>
              Try again
            </Link>
          </div>
        )}

        {status === "timeout" && (
          <div>
            <h1 className="font-display" style={{ fontSize: "1.8rem", color: "var(--ink)", marginBottom: 12 }}>
              Still checking…
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: 24, maxWidth: 420, lineHeight: 1.7 }}>
              Your payment may still be processing. If you were charged, your account will be created shortly — try logging in in a few minutes. If the problem continues, contact us at hello@awas.asia.
            </p>
            <Link href={`/${locale}/login`} style={buttonStyle}>
              Go to login
            </Link>
          </div>
        )}

        {status === "unknown" && (
          <div>
            <h1 className="font-display" style={{ fontSize: "1.8rem", color: "var(--ink)", marginBottom: 12 }}>
              Nothing to confirm
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              We could not find a payment reference on this page.
            </p>
            <Link href={`/${locale}`} style={buttonStyle}>
              Go to homepage
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}