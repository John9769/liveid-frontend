"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { getTransactionStatus } from "../../../../lib/api";
import Navbar from "../../../../components/Navbar";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const transactionId = searchParams.get("transactionId");
    if (!transactionId) {
      setStatus("unknown");
      return;
    }

    // Poll transaction status
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const data = await getTransactionStatus(transactionId);
        if (data.status === "SUCCESS") {
          setStatus("success");
          clearInterval(interval);
        } else if (data.status === "FAILED") {
          setStatus("failed");
          clearInterval(interval);
        } else if (attempts >= 10) {
          setStatus("timeout");
          clearInterval(interval);
        }
      } catch {
        if (attempts >= 10) {
          setStatus("timeout");
          clearInterval(interval);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [searchParams]);

  return (
    <div>
      <Navbar />
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
          <p style={{ color: "var(--text-muted)" }}>Confirming your payment…</p>
        )}

        {status === "success" && (
          <div>
            <h1 className="font-display" style={{ fontSize: "2rem", color: "var(--ink)", marginBottom: 12 }}>
              You're verified.
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              Your handle is now live. Share your LiveID link with the world.
            </p>
            <Link
              href={`/${locale}`}
              style={{
                background: "var(--trust-blue)",
                color: "white",
                padding: "12px 24px",
                borderRadius: 8,
                fontWeight: 500,
                fontSize: "1rem",
              }}
            >
              Go to homepage
            </Link>
          </div>
        )}

        {status === "failed" && (
          <div>
            <h1 className="font-display" style={{ fontSize: "2rem", color: "#B3261E", marginBottom: 12 }}>
              Payment failed
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              Your payment was not completed. Please try again.
            </p>
            <Link
              href={`/${locale}`}
              style={{
                background: "var(--trust-blue)",
                color: "white",
                padding: "12px 24px",
                borderRadius: 8,
                fontWeight: 500,
                fontSize: "1rem",
              }}
            >
              Try again
            </Link>
          </div>
        )}

        {(status === "timeout" || status === "unknown") && (
          <div>
            <h1 className="font-display" style={{ fontSize: "1.8rem", color: "var(--ink)", marginBottom: 12 }}>
              Still checking…
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              Payment confirmation is taking longer than expected. Check back in a few minutes.
            </p>
            <Link
              href={`/${locale}`}
              style={{
                background: "var(--trust-blue)",
                color: "white",
                padding: "12px 24px",
                borderRadius: 8,
                fontWeight: 500,
                fontSize: "1rem",
              }}
            >
              Go to homepage
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}