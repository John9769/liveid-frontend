"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { joinWaitlist } from "../../../lib/api";

export default function WaitlistPage() {
  const searchParams = useSearchParams();
  const prefillHandle = searchParams.get("handle") || "";
  const prefillType = searchParams.get("type") || "TAKEN_HANDLE";

  const [form, setForm] = useState({
    type: prefillType,
    handleName: prefillHandle,
    name: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.handleName || !form.name || !form.phone || !form.email) {
      setError("Fill in all fields to continue.");
      return;
    }

    setLoading(true);
    try {
      await joinWaitlist(form);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Navbar showLogin />
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "3rem 1.5rem" }}>

        {done ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <h1 className="font-display" style={{ fontSize: "1.8rem", color: "var(--ink)", marginBottom: "1rem" }}>
              You're on the list.
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              We'll notify you at {form.email} when{" "}
              <span className="font-mono">liveid.asia/{form.handleName}</span> becomes available.
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-display" style={{ fontSize: "1.8rem", marginBottom: "0.5rem", color: "var(--ink)" }}>
              {form.type === "WISH_REQUEST" ? "Request a handle" : "Join the waitlist"}
            </h1>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "2rem" }}>
              {form.type === "WISH_REQUEST"
                ? "Tell us which handle you want. We'll review and notify you if it becomes available."
                : "Be first in line when this handle expires or becomes available."}
            </p>

            {/* Type toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
              <button
                onClick={() => updateField("type", "TAKEN_HANDLE")}
                style={{
                  border: "1px solid var(--border)",
                  background: form.type === "TAKEN_HANDLE" ? "var(--trust-blue)" : "white",
                  color: form.type === "TAKEN_HANDLE" ? "white" : "var(--ink)",
                  borderRadius: 6,
                  padding: "6px 14px",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Taken handle
              </button>
              <button
                onClick={() => updateField("type", "WISH_REQUEST")}
                style={{
                  border: "1px solid var(--border)",
                  background: form.type === "WISH_REQUEST" ? "var(--trust-blue)" : "white",
                  color: form.type === "WISH_REQUEST" ? "white" : "var(--ink)",
                  borderRadius: 6,
                  padding: "6px 14px",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Wish request
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field
                label={form.type === "WISH_REQUEST" ? "Handle you want" : "Handle name"}
                value={form.handleName}
                onChange={(v) => updateField("handleName", v)}
                placeholder="e.g. john, boss, dina88"
              />
              <Field label="Your name" value={form.name} onChange={(v) => updateField("name", v)} placeholder="Full name" />
              <Field label="Phone" value={form.phone} onChange={(v) => updateField("phone", v)} placeholder="60123456789" />
              <Field label="Email" value={form.email} onChange={(v) => updateField("email", v)} placeholder="you@example.com" type="email" />

              {error && <p style={{ color: "#B3261E", fontSize: "0.9rem" }}>{error}</p>}

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
                  cursor: "pointer",
                }}
              >
                {loading ? "Submitting…" : "Join waitlist"}
              </button>
            </form>
          </>
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