"use client";

import { useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { verifyLiveness, startVerification } from "../../../lib/api";
import Navbar from "../../../components/Navbar";

const STEPS = {
  FORM: "FORM",
  CAMERA: "CAMERA",
  PROCESSING: "PROCESSING",
  ERROR: "ERROR",
};

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const handleName = searchParams.get("handle") || "";

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

  const [form, setForm] = useState({ phone: "", email: "", password: "" });
  const [step, setStep] = useState(STEPS.FORM);
  const [error, setError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
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
      // Capture frame from video
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);

      stopCamera();

      // Convert canvas to blob
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92)
      );

      // Step 1 — verify liveness
      const livenessResult = await verifyLiveness(blob);

      if (livenessResult.result !== "real") {
        setError("Liveness check failed. Please try again.");
        setStep(STEPS.ERROR);
        return;
      }

      // Step 2 — register with faceId
      const regResult = await startVerification({
        phone: form.phone,
        email: form.email,
        password: form.password,
        handleName,
        faceId: livenessResult.faceId,
        referralCode: referralCode || null,
      });

      // Redirect to ToyyibPay
      window.location.href = regResult.paymentUrl;
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setStep(STEPS.ERROR);
      stopCamera();
    }
  }, [cameraReady, form, handleName]);

  function retryFromForm() {
    setError(null);
    setStep(STEPS.FORM);
    stopCamera();
  }

  return (
    <div>
      <Navbar />
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "3rem 1.5rem",
        }}
      >
        <div style={{ maxWidth: 420, width: "100%" }}>

          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 4 }}>
            Claiming
          </p>
          <p
            className="font-mono"
            style={{ fontSize: "1.4rem", fontWeight: 500, marginBottom: "2rem", color: "var(--ink)" }}
          >
            {handleName}
          </p>

          {/* STEP 1 — FORM */}
          {step === STEPS.FORM && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field
                label="Phone number"
                value={form.phone}
                onChange={(v) => updateField("phone", v)}
                placeholder="60123456789"
              />
              <Field
                label="Email"
                value={form.email}
                onChange={(v) => updateField("email", v)}
                placeholder="you@example.com"
                type="email"
              />
              <Field
                label="Password"
                value={form.password}
                onChange={(v) => updateField("password", v)}
                placeholder="At least 8 characters"
                type="password"
              />

              {error && (
                <p style={{ color: "#B3261E", fontSize: "0.9rem" }}>{error}</p>
              )}

              <button
                onClick={startCamera}
                style={{
                  border: "none",
                  background: "var(--trust-blue)",
                  color: "white",
                  padding: "12px",
                  borderRadius: 8,
                  fontWeight: 500,
                  fontSize: "1rem",
                  marginTop: 8,
                }}
              >
                Continue to face verification
              </button>
            </div>
          )}

          {/* STEP 2 — CAMERA */}
          {step === STEPS.CAMERA && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", textAlign: "center" }}>
                Look directly at the camera and tap the button below
              </p>

              <div
                style={{
                  width: "100%",
                  maxWidth: 340,
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "2px solid var(--stamp-teal)",
                  background: "#000",
                  aspectRatio: "3/4",
                  position: "relative",
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <button
                onClick={captureAndSubmit}
                disabled={!cameraReady}
                style={{
                  border: "none",
                  background: "var(--stamp-teal)",
                  color: "white",
                  padding: "14px 32px",
                  borderRadius: 8,
                  fontWeight: 500,
                  fontSize: "1rem",
                  width: "100%",
                  maxWidth: 340,
                }}
              >
                Take selfie and verify
              </button>

              <button
                onClick={retryFromForm}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  textDecoration: "underline",
                }}
              >
                Go back
              </button>
            </div>
          )}

          {/* STEP 3 — PROCESSING */}
          {step === STEPS.PROCESSING && (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <p style={{ fontSize: "1rem", color: "var(--text-muted)" }}>
                Verifying your identity…
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 8 }}>
                This takes a few seconds
              </p>
            </div>
          )}

          {/* STEP 4 — ERROR */}
          {step === STEPS.ERROR && (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <p style={{ color: "#B3261E", fontSize: "0.95rem", marginBottom: 20 }}>
                {error}
              </p>
              <button
                onClick={retryFromForm}
                style={{
                  border: "none",
                  background: "var(--trust-blue)",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: 8,
                  fontWeight: 500,
                  fontSize: "1rem",
                }}
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