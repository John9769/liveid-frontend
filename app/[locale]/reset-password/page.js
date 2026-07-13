"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "../../../../lib/api";
import Navbar from "../../../../components/Navbar";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!password || !confirm) {
      setError("Fill in both fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid reset link.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          <h1
            className="font-display"
            style={{ fontSize: "1.8rem", marginBottom: "1.5rem", color: "var(--ink)" }}
          >
            Reset password
          </h1>

          {done ? (
            <p style={{ color: "var(--stamp-teal)", fontSize: "1rem" }}>
              Password reset successful. You can now log in.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>New password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Confirm password</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                />
              </label>

              {error && (
                <p style={{ color: "#B3261E", fontSize: "0.9rem" }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
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
                {loading ? "Resetting…" : "Reset password"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}