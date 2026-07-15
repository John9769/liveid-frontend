"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Navbar from "../../../../components/Navbar";
import {
  getVaultHandle,
  submitVaultOffer,
  initiateVaultPurchase,
  getStoredUser,
} from "../../../../lib/api";

export default function VaultHandlePage() {
  const { name } = useParams();
  const locale = useLocale();
  const router = useRouter();

  const [handle, setHandle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offer, setOffer] = useState({
    offerName: "",
    phone: "",
    email: "",
    offerAmount: "",
    message: "",
  });
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(false);
  const [offerError, setOfferError] = useState(null);

  useEffect(() => {
    setUser(getStoredUser());

    if (!name) return;
    let cancelled = false;

    getVaultHandle(name)
      .then((data) => { if (!cancelled) setHandle(data.vaultHandle || data.handle || data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [name]);

  async function handleBuyNow() {
    if (!user?.id) {
      router.push(`/${locale}/login`);
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      const data = await initiateVaultPurchase({ userId: user.id, vaultHandleName: name });
      if (!data?.paymentUrl) throw new Error("Could not start payment. Please try again.");
      window.location.href = data.paymentUrl;
    } catch (err) {
      if (err.isAuthError) {
        router.push(`/${locale}/login`);
        return;
      }
      setError(err.message);
      setProcessing(false);
    }
  }

  async function handleSubmitOffer() {
    setOfferError(null);

    if (!offer.offerName || !offer.phone || !offer.email || !offer.offerAmount) {
      setOfferError("Please fill in all required fields.");
      return;
    }

    const amount = parseFloat(offer.offerAmount);
    if (isNaN(amount) || amount <= 0) {
      setOfferError("Enter a valid offer amount.");
      return;
    }

    setOfferSubmitting(true);
    try {
      await submitVaultOffer({
        name,
        offerName: offer.offerName,
        phone: offer.phone,
        email: offer.email,
        offerAmount: amount,
        message: offer.message,
      });
      setOfferSuccess(true);
      setShowOfferForm(false);
    } catch (err) {
      setOfferError(err.message);
    } finally {
      setOfferSubmitting(false);
    }
  }

  const money = (n) => `RM ${Number(n || 0).toLocaleString("en-MY")}`;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
        <Navbar showLogin />
        <main style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <p style={{ color: "var(--text-muted)" }}>Loading…</p>
        </main>
      </div>
    );
  }

  if (!handle) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
        <Navbar showLogin />
        <main style={{ maxWidth: 520, margin: "0 auto", padding: "3rem 1.5rem", textAlign: "center" }}>
          <h1 className="font-display" style={{ fontSize: "1.6rem", color: "var(--ink)", marginBottom: "1rem" }}>
            Handle not found
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            {error || "This vault handle does not exist."}
          </p>
          <button
            onClick={() => router.push(`/${locale}/vault`)}
            style={{ background: "var(--trust-blue)", color: "white", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer" }}
          >
            Back to The Vault
          </button>
        </main>
      </div>
    );
  }

  const isAvailable = handle.status === "AVAILABLE";

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <Navbar showLogin />
      <main style={{ maxWidth: 520, margin: "0 auto", padding: "3rem 1.5rem" }}>

        <button
          onClick={() => router.push(`/${locale}/vault`)}
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", padding: 0, marginBottom: "1.5rem" }}
        >
          ← Back to The Vault
        </button>

        <div style={{ background: "var(--mist)", border: "2px solid var(--border)", borderRadius: 12, padding: "2rem", textAlign: "center", marginBottom: "1.5rem" }}>
          <p className="font-mono" style={{ fontSize: "0.7rem", letterSpacing: "0.14em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>
            The Vault
          </p>
          <h1 className="font-mono" style={{ fontSize: "2rem", fontWeight: 700, color: "var(--ink)", margin: 0, wordBreak: "break-all" }}>
            liveid.asia/{handle.name}
          </h1>
          <p style={{ fontSize: "0.85rem", color: isAvailable ? "var(--stamp-teal)" : "#B3261E", fontWeight: 600, marginTop: 8 }}>
            {isAvailable ? "AVAILABLE" : handle.status}
          </p>
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", background: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Buy now price</span>
            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)" }}>
              {money(handle.buyNowPrice)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Annual renewal</span>
            <span style={{ fontSize: "0.9rem", color: "var(--ink)", fontWeight: 500 }}>
              {money(handle.renewalFee)}
            </span>
          </div>
        </div>

        <div style={{ background: "#FFF8E1", border: "1px solid #F59E0B", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "0.82rem", color: "#92400E", lineHeight: 1.6, margin: 0 }}>
            Vault handles are licensed annually, not sold. Failing to renew means your link will show
            an Expired notice to anyone who checks you. Your handle is never released to anyone else.
          </p>
        </div>

        {error && <p style={{ color: "#B3261E", fontSize: "0.9rem", marginBottom: 12 }}>{error}</p>}

        {offerSuccess && (
          <div style={{ background: "#F0FDF4", border: "1px solid var(--stamp-teal)", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "0.88rem", color: "var(--stamp-teal)", fontWeight: 600, margin: 0 }}>
              Offer submitted. We will contact you soon.
            </p>
          </div>
        )}

        {isAvailable && !showOfferForm && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={handleBuyNow}
              disabled={processing}
              style={{ width: "100%", background: "var(--trust-blue)", color: "white", border: "none", borderRadius: 8, padding: "14px", fontSize: "1rem", fontWeight: 600, cursor: processing ? "not-allowed" : "pointer", opacity: processing ? 0.7 : 1 }}
            >
              {processing ? "Processing…" : `Buy now — ${money(handle.buyNowPrice)}`}
            </button>

            {!offerSuccess && (
              <button
                onClick={() => setShowOfferForm(true)}
                style={{ width: "100%", background: "white", color: "var(--trust-blue)", border: "1px solid var(--trust-blue)", borderRadius: 8, padding: "14px", fontSize: "1rem", fontWeight: 600, cursor: "pointer" }}
              >
                Make an offer
              </button>
            )}
          </div>
        )}

        {!isAvailable && (
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            This handle is no longer available.
          </p>
        )}

        {showOfferForm && (
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem", background: "white" }}>
            <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
              Make an offer
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 16 }}>
              Reserve price applies. We will contact you if your offer is accepted.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                  Your name
                </label>
                <input
                  type="text"
                  value={offer.offerName}
                  onChange={(e) => setOffer({ ...offer, offerName: e.target.value })}
                  placeholder="Full name"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                  Phone
                </label>
                <input
                  type="text"
                  value={offer.phone}
                  onChange={(e) => setOffer({ ...offer, phone: e.target.value })}
                  placeholder="60123456789"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={offer.email}
                  onChange={(e) => setOffer({ ...offer, email: e.target.value })}
                  placeholder="you@email.com"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                  Your offer (RM)
                </label>
                <input
                  type="number"
                  value={offer.offerAmount}
                  onChange={(e) => setOffer({ ...offer, offerAmount: e.target.value })}
                  placeholder="3000"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                  Message (optional)
                </label>
                <textarea
                  value={offer.message}
                  onChange={(e) => setOffer({ ...offer, message: e.target.value })}
                  rows={3}
                  placeholder="Anything you want to tell us"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.95rem", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {offerError && (
              <p style={{ color: "#B3261E", fontSize: "0.85rem", marginTop: 12 }}>{offerError}</p>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                onClick={() => { setShowOfferForm(false); setOfferError(null); }}
                style={{ flex: 1, padding: "12px", background: "white", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.9rem", color: "var(--text-muted)", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitOffer}
                disabled={offerSubmitting}
                style={{ flex: 1, padding: "12px", background: "var(--trust-blue)", color: "white", border: "none", borderRadius: 8, fontSize: "0.9rem", fontWeight: 600, cursor: offerSubmitting ? "not-allowed" : "pointer", opacity: offerSubmitting ? 0.7 : 1 }}
              >
                {offerSubmitting ? "Submitting…" : "Submit offer"}
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}