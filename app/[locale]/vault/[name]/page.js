"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Navbar from "../../../../components/Navbar";
import { getVaultHandle, submitVaultOffer, initiateVaultPurchase } from "../../../../lib/api";

export default function VaultHandlePage() {
  const { name } = useParams();
  const locale = useLocale();
  const router = useRouter();

  const [handle, setHandle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ offerName: "", phone: "", email: "", offerAmount: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [buyNowLoading, setBuyNowLoading] = useState(false);

  useEffect(() => {
    if (!name) return;
    getVaultHandle(name)
      .then((data) => setHandle(data.handle))
      .catch(() => setHandle(null))
      .finally(() => setLoading(false));
  }, [name]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleOffer(e) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!form.offerName || !form.phone || !form.email || !form.offerAmount) {
      setError("Fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await submitVaultOffer({
        name,
        offerName: form.offerName,
        phone: form.phone,
        email: form.email,
        offerAmount: parseFloat(form.offerAmount),
        message: form.message,
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBuyNow() {
    const stored = localStorage.getItem("liveid_user");
    if (!stored) {
      router.push(`/${locale}/login`);
      return;
    }
    const user = JSON.parse(stored);
    setBuyNowLoading(true);
    setError(null);
    try {
      const data = await initiateVaultPurchase({ userId: user.id, vaultHandleName: name });
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err.message);
      setBuyNowLoading(false);
    }
  }

  if (loading) return (
    <div><Navbar showLogin />
      <main style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      </main>
    </div>
  );

  if (!handle) return (
    <div><Navbar showLogin />
      <main style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <p style={{ color: "var(--text-muted)" }}>Handle not found.</p>
      </main>
    </div>
  );

  return (
    <div>
      <Navbar showLogin />
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "4rem 1.5rem" }}>

        {/* Handle display */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p
            className="font-mono"
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              color: "var(--stamp-teal)",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            LiveID Premium Reserve
          </p>
          <h1
            className="font-mono"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 700, color: "var(--ink)", marginBottom: "0.5rem" }}
          >
            liveid.asia/{handle.name}
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            {handle.status === "AVAILABLE" ? "Available now" : "No longer available"}
          </p>
        </div>

        {handle.status === "AVAILABLE" && (
          <>
            {/* Pricing */}
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "1.5rem",
                marginBottom: "1.5rem",
                background: "var(--mist)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Buy now price</span>
                <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)" }}>
                  RM {handle.buyNowPrice?.toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Annual renewal</span>
                <span style={{ fontSize: "0.9rem", color: "var(--ink)", fontWeight: 500 }}>
                  RM {handle.renewalFee?.toLocaleString()}/year
                </span>
              </div>
            </div>

            {/* Buy Now */}
            <button
              onClick={handleBuyNow}
              disabled={buyNowLoading}
              style={{
                border: "none",
                background: "var(--ink)",
                color: "white",
                padding: "14px",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: "1rem",
                width: "100%",
                cursor: "pointer",
                marginBottom: "1rem",
              }}
            >
              {buyNowLoading ? "Processing…" : `Buy now — RM ${handle.buyNowPrice?.toLocaleString()}`}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "1.5rem 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>or make an offer</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            {/* Make Offer form */}
            {result ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <p style={{ fontSize: "1rem", color: result.accepted ? "var(--stamp-teal)" : "var(--ink)", fontWeight: 500 }}>
                  {result.message}
                </p>
              </div>
            ) : (
              <form onSubmit={handleOffer} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}>Make an offer</p>

                <Field label="Your name *" value={form.offerName} onChange={(v) => updateField("offerName", v)} placeholder="Full name" />
                <Field label="Phone *" value={form.phone} onChange={(v) => updateField("phone", v)} placeholder="60123456789" />
                <Field label="Email *" value={form.email} onChange={(v) => updateField("email", v)} placeholder="you@example.com" type="email" />
                <Field label="Your offer (RM) *" value={form.offerAmount} onChange={(v) => updateField("offerAmount", v)} placeholder="e.g. 5000" type="number" />
                <Field label="Message (optional)" value={form.message} onChange={(v) => updateField("message", v)} placeholder="Why you want this handle" />

                {error && <p style={{ color: "#B3261E", fontSize: "0.9rem" }}>{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    border: "1px solid var(--trust-blue)",
                    background: "white",
                    color: "var(--trust-blue)",
                    padding: "12px",
                    borderRadius: 8,
                    fontWeight: 500,
                    fontSize: "1rem",
                    cursor: "pointer",
                    marginTop: 8,
                  }}
                >
                  {submitting ? "Submitting…" : "Submit offer"}
                </button>
              </form>
            )}
          </>
        )}

        {handle.status === "SOLD" && (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <p style={{ fontSize: "1rem", color: "var(--text-muted)" }}>
              This handle has been claimed. It will never be resold.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "10px 12px",
          fontSize: "1rem",
          outline: "none",
        }}
      />
    </label>
  );
}