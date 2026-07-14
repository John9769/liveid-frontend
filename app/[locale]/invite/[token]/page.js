"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Navbar from "../../../../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function InvitePage() {
  const { token } = useParams();
  const locale = useLocale();
  const router = useRouter();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [invitation, setInvitation] = useState(null);
  const [step, setStep] = useState("loading"); // loading | info | camera | password | submitting | done | error
  const [errorMsg, setErrorMsg] = useState("");
  const [faceId, setFaceId] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cameraError, setCameraError] = useState(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/invites/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setErrorMsg(data.error); setStep("error"); return; }
        setInvitation(data);
        setStep("info");
      })
      .catch(() => { setErrorMsg("Could not load invitation."); setStep("error"); });
  }, [token]);

  async function startCamera() {
    setStep("camera");
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setCameraError("Could not access camera. Please allow camera access and try again.");
    }
  }

  function stopCamera() {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
  }

  async function captureAndVerify() {
    setCapturing(true);
    setErrorMsg("");
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      const formData = new FormData();
      formData.append("photo", blob, "selfie.jpg");

      const res = await fetch(`${API}/api/auth/verify-liveness`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Liveness check failed");

      setFaceId(data.faceId);
      stopCamera();
      setStep("password");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCapturing(false);
    }
  }

  async function handleSubmit() {
    if (!password || password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setStep("submitting");
    setErrorMsg("");

    try {
      const res = await fetch(`${API}/api/invites/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faceId, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete onboarding");
      setStep("done");
    } catch (err) {
      setErrorMsg(err.message);
      setStep("password");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <Navbar showLogin />
      <main style={{ maxWidth: 520, margin: "0 auto", padding: "3rem 1.5rem" }}>

        {/* Loading */}
        {step === "loading" && (
          <p style={{ color: "var(--text-muted)", textAlign: "center" }}>Loading your invitation…</p>
        )}

        {/* Error */}
        {step === "error" && (
          <div style={{ background: "#FFF5F5", border: "2px solid #B3261E", borderRadius: 12, padding: "2rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "#B3261E", marginBottom: 8 }}>⚠ Invalid Invitation</p>
            <p style={{ color: "#B3261E", fontSize: "0.9rem" }}>{errorMsg}</p>
          </div>
        )}

        {/* Step 1 — Info */}
        {step === "info" && invitation && (
          <div>
            <div style={{ background: "#F0FDF4", border: "2px solid var(--stamp-teal)", borderRadius: 12, padding: "1.5rem", textAlign: "center", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--stamp-teal)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                Personal Invitation
              </p>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                Welcome, {invitation.name}
              </h1>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                Your reserved handle:
              </p>
              <p style={{ fontFamily: "monospace", fontSize: "1.2rem", fontWeight: 700, color: "var(--trust-blue)", marginTop: 4 }}>
                liveid.asia/{invitation.handle}
              </p>
            </div>

            <div style={{ background: "var(--mist)", border: "1px solid var(--border)", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                To complete your onboarding you will need to:
                <br />1. Pass a quick <strong>liveness check</strong> — your face, on your device
                <br />2. Set your <strong>password</strong>
                <br /><br />
                This link expires on <strong>{new Date(invitation.expiresAt).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}</strong>.
              </p>
            </div>

            <button
              onClick={startCamera}
              style={{ width: "100%", padding: "14px", background: "var(--trust-blue)", color: "white", border: "none", borderRadius: 8, fontSize: "1rem", fontWeight: 600, cursor: "pointer" }}
            >
              Start Liveness Check
            </button>
          </div>
        )}

        {/* Step 2 — Camera */}
        {step === "camera" && (
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)", marginBottom: "1rem", textAlign: "center" }}>
              Liveness Check
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "1rem" }}>
              Look directly at the camera, ensure good lighting, then tap Capture.
            </p>

            {cameraError ? (
              <p style={{ color: "#B3261E", textAlign: "center", marginBottom: 16 }}>{cameraError}</p>
            ) : (
              <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", marginBottom: "1rem", background: "#000" }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", display: "block" }} />
                <canvas ref={canvasRef} style={{ display: "none" }} />
              </div>
            )}

            {errorMsg && <p style={{ color: "#B3261E", fontSize: "0.85rem", textAlign: "center", marginBottom: 12 }}>{errorMsg}</p>}

            <button
              onClick={captureAndVerify}
              disabled={capturing || !!cameraError}
              style={{ width: "100%", padding: "14px", background: "var(--stamp-teal)", color: "white", border: "none", borderRadius: 8, fontSize: "1rem", fontWeight: 600, cursor: "pointer" }}
            >
              {capturing ? "Verifying…" : "Capture & Verify"}
            </button>
          </div>
        )}

        {/* Step 3 — Password */}
        {step === "password" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "1.5rem" }}>✅</p>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)" }}>Liveness Verified</h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Now set your password to complete onboarding.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {errorMsg && <p style={{ color: "#B3261E", fontSize: "0.85rem", marginBottom: 12 }}>{errorMsg}</p>}

            <button
              onClick={handleSubmit}
              style={{ width: "100%", padding: "14px", background: "var(--trust-blue)", color: "white", border: "none", borderRadius: 8, fontSize: "1rem", fontWeight: 600, cursor: "pointer" }}
            >
              Complete Onboarding
            </button>
          </div>
        )}

        {/* Submitting */}
        {step === "submitting" && (
          <p style={{ color: "var(--text-muted)", textAlign: "center" }}>Creating your account…</p>
        )}

        {/* Done */}
        {step === "done" && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "3rem", marginBottom: 16 }}>🎉</p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
              You&apos;re in!
            </h1>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              Your LiveID account has been created. Your handle <strong>liveid.asia/{invitation?.handle}</strong> is reserved.
              <br /><br />
              Your account is pending admin activation. You will be notified once it is live.
            </p>
            <button
              onClick={() => router.push(`/${locale}/login`)}
              style={{ padding: "12px 24px", background: "var(--trust-blue)", color: "white", border: "none", borderRadius: 8, fontSize: "0.95rem", fontWeight: 600, cursor: "pointer" }}
            >
              Go to Login
            </button>
          </div>
        )}

      </main>
    </div>
  );
}