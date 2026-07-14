"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("liveid_admin", JSON.stringify({ token: data.token, admin: data.admin }));
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.2em", color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>
            LiveID
          </p>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "white", margin: 0 }}>
            Admin Cockpit
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: 8 }}>
            AWAS Premium Resources
          </p>
        </div>

        <div style={{ background: "#1e293b", borderRadius: 12, padding: "2rem", border: "1px solid #334155" }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="admin@liveid.asia"
              style={{ width: "100%", padding: "10px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "white", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
              style={{ width: "100%", padding: "10px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "white", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {error && (
            <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: 16 }}>{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: "100%", padding: "12px", background: "#3b82f6", color: "white", border: "none", borderRadius: 8, fontSize: "0.95rem", fontWeight: 600, cursor: "pointer" }}
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </div>

      </div>
    </div>
  );
}