"use client";

import { useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { verifyLiveness, startVerification, searchHandle } from "../../../lib/api";
import Navbar from "../../../components/Navbar";

const STEPS = {
  HANDLE: "HANDLE",
  FORM: "FORM",
  CAMERA: "CAMERA",
  PROCESSING: "PROCESSING",
  ERROR: "ERROR",
};

export default function RegisterPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const handleFromUrl = searchParams.get("handle") || "";

  // Read referral code from URL or cookie
  const refFromUrl = searchParams.get("ref") || "";
  const refFromCookie = typeof document !== "undefined"
    ? document.cookie.split("; ").find((r) => r.startsWith("liveid_ref="))?.split("=")[1] || ""
    : "";
  const referralCode = refFromUrl || refFromCookie;

  // Store in cookie only if no existing ref — first click wins
  if (refFromUrl && !refFromCookie && typeof document !== "undefined") {
    document.cookie = `liveid_ref=${refFromUrl}; path=/; max-age=${30 * 24 * 60 * 60}`;
  }

  const [handleName, setHandleName] = useState(handleFromUrl);
  const [handleQuery, setHandleQuery] = useState("");
  const [handleResults, setHandleResults] = useState([]);
  const [handleSearching, setHandleSearching] = useState(false);
  const [handleError, setHandleError] = useState(null);

  const [form, setForm] = useState({ phone: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState(handleFromUrl ? STEPS.FORM : STEPS.HANDLE);
  const [error, setError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  async function handleSearch() {
    if (!handleQuery.trim()) return;
    setHandleSearching(true);
    setHandleError(null);
    setHandleResults([]);
    try {
      const data = await searchHandle(handleQuery.trim());
      if (data.results?.length === 0) {
        setHandleError("No handles found. Try a different name.");
      } else {
        setHandleResults(data.results || []);
      }
    } catch (err) {
      setHandleError("Search failed. Please try again.");
    } finally {
      setHandleSearching(false);
    }
  }

  function selectHandle(name) {
    setHandleName(name);
    setStep(STEPS.FORM);
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateForm() {
    if (!form.phone || !form.email || !form.password) {
      setError("Fill in all fields to continue.");
      return false;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    return true;
  }

  async function startCamera() {
    if (!validateForm()) return;
    setError(null);
    setStep(STEPS.CAMERA);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraReady(true);
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera to continue.");
      setStep(STEPS.ERROR);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }

  const captureAndSubmit = useCallback(async () => {
    if (!videoRef.current || !cameraReady) return;
    setStep(STEPS.PROCESSING);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
      stopCamera();

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      const livenessResult = await verifyLiveness(blob);

      const regResult = await startVerification({
        phone: form.phone,
        email: form.email,
        password: form.password,
        handleName,
        faceId: livenessResult.faceId,
        photoUrl: livenessResult.photoUrl || null,
        referralCode: referralCode || null,
      });

      window.location.href = regResult.paymentUrl;
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setStep(STEPS.ERROR);
      stopCamera();
    }
  }, [cameraReady, form, handleName, referralCode]);

  function retryFromForm() {
    setError(null);
    setStep(STEPS.FORM);
    stopCamera();
  }

  return (
    <div>
      <Navbar />
      <main style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 1.5rem" }}>
        <div style={{ maxWidth: 420, width: "100%" }}>

          {/* STEP 0 — PICK HANDLE */}
          {step === STEPS.HANDLE && (
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                Get Your LiveID
              </h2>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                Choose your handle — this is your verified identity on LiveID.
              </p>

              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                  type="text"
                  value={handleQuery}
                  onChange={(e) => setHandleQuery(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search a handle name"
                  style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: "1rem", outline: "none" }}
                />
                <button
                  onClick={handleSearch}
                  disabled={handleSearching}
                  style={{ border: "none", background: "var(--trust-blue)", color: "white", padding: "10px 16px", borderRadius: 8, fontWeight: 500, fontSize: "0.9rem", cursor: "pointer" }}
                >
                  {handleSearching ? "…" : "Search"}
                </button>
              </div>

              {handleError && <p style={{ color: "#B3261E", fontSize: "0.85rem", marginBottom: 12 }}>{handleError}</p>}

              {handleResults.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {handleResults.map((h) => (
                    <div
                      key={h.handle}
                      onClick={() => h.available && selectHandle(h.handle)}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        padding: "12px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: h.available ? "white" : "var(--mist)",
                        cursor: h.available ? "pointer" : "default",
                        opacity: h.available ? 1 : 0.6,
                      }}
                    >
                      <div>
                        <p className="font-mono" style={{ fontSize: "0.95rem", color: "var(--ink)", margin: 0 }}>
                          liveid.asia/{h.handle}
                        </p>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
                          {h.available ? `RM ${h.price}` : "Taken"}
                        </p>
                      </div>
                      {h.available && (
                        <span style={{ fontSize: "0.78rem", color: "var(--trust-blue)", fontWeight: 600 }}>
                          Select →
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 1 — FORM */}
          {step === STEPS.FORM && (
            <div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 4 }}>Claiming</p>
              <p className="font-mono" style={{ fontSize: "1.4rem", fontWeight: 500, marginBottom: "2rem", color: "var(--ink)" }}>
                liveid.asia/{handleName}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Field label="Phone number" value={form.phone} onChange={(v) => updateField("phone", v)} placeholder="60123456789" />
                <Field label="Email" value={form.email} onChange={(v) => updateField("email", v)} placeholder="you@example.com" type="email" />
                <Field label="Password" value={form.password} onChange={(v) => updateField("password", v)} placeholder="At least 8 characters" type="password" />

                {error && <p style={{ color: "#B3261E", fontSize: "0.9rem" }}>{error}</p>}

                {/* Consent checkbox */}
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    style={{ marginTop: 3, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                    I agree to LiveID&apos;s{" "}
                    <a href={`/${locale}/terms`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--trust-blue)" }}>Terms & Conditions</a>
                    {" "}and{" "}
                    <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--trust-blue)" }}>Privacy Policy</a>
                    . I consent to LiveID collecting and storing my selfie photograph for identity verification purposes.
                  </span>
                </label>

                <button
                  onClick={startCamera}
                  disabled={!agreed}
                  style={{ border: "none", background: agreed ? "var(--trust-blue)" : "var(--border)", color: "white", padding: "12px", borderRadius: 8, fontWeight: 500, fontSize: "1rem", marginTop: 8, cursor: agreed ? "pointer" : "not-allowed" }}
                >
                  Continue to face verification
                </button>

                {!handleFromUrl && (
                  <button
                    onClick={() => setStep(STEPS.HANDLE)}
                    style={{ border: "none", background: "transparent", color: "var(--text-muted)", fontSize: "0.9rem", textDecoration: "underline", cursor: "pointer" }}
                  >
                    Change handle
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 — CAMERA */}
          {step === STEPS.CAMERA && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                Take your selfie
              </h2>

              {/* Warning — permanent profile photo */}
              <div style={{ background: "#FFF8E1", border: "1px solid #F59E0B", borderRadius: 8, padding: "10px 14px", width: "100%", boxSizing: "border-box" }}>
                <p style={{ fontSize: "0.82rem", color: "#92400E", margin: 0, textAlign: "center" }}>
                  📸 This selfie will be your <strong>permanent LiveID profile photo</strong>. It cannot be changed after registration.
                </p>
              </div>

              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", textAlign: "center", margin: 0 }}>
                Look directly at the camera and tap the button below.
              </p>

              <div style={{ width: "100%", maxWidth: 340, borderRadius: 16, overflow: "hidden", border: "2px solid var(--stamp-teal)", background: "#000", aspectRatio: "3/4", position: "relative" }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              <button
                onClick={captureAndSubmit}
                disabled={!cameraReady}
                style={{ border: "none", background: "var(--stamp-teal)", color: "white", padding: "14px 32px", borderRadius: 8, fontWeight: 500, fontSize: "1rem", width: "100%", maxWidth: 340, cursor: "pointer" }}
              >
                Take selfie and continue
              </button>

              <button onClick={retryFromForm} style={{ border: "none", background: "transparent", color: "var(--text-muted)", fontSize: "0.9rem", textDecoration: "underline", cursor: "pointer" }}>
                Go back
              </button>
            </div>
          )}

          {/* STEP 3 — PROCESSING */}
          {step === STEPS.PROCESSING && (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <p style={{ fontSize: "1rem", color: "var(--text-muted)" }}>Processing your registration…</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 8 }}>This takes a few seconds</p>
            </div>
          )}

          {/* STEP 4 — ERROR */}
          {step === STEPS.ERROR && (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <p style={{ color: "#B3261E", fontSize: "0.95rem", marginBottom: 20 }}>{error}</p>
              <button
                onClick={retryFromForm}
                style={{ border: "none", background: "var(--trust-blue)", color: "white", padding: "12px 24px", borderRadius: 8, fontWeight: 500, fontSize: "1rem", cursor: "pointer" }}
              >
                Try again
              </button>
            </div>
          )}

        </div>
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
        style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: "1rem", outline: "none" }}
      />
    </label>
  );
}