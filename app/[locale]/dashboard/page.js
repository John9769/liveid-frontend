"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import { getUserProfile, getFullProfile } from "../../../lib/api";

export default function DashboardPage() {
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("liveid_user");
    if (!stored) {
      router.push(`/${locale}/login`);
      return;
    }

    const parsedUser = JSON.parse(stored);
    setUser(parsedUser);

    Promise.all([
      getUserProfile(parsedUser.id),
      getFullProfile(parsedUser.id),
    ])
      .then(([userdata, profileData]) => {
        setUser(userdata);
        setProfile(profileData.profile);
      })
      .catch(() => {
        localStorage.removeItem("liveid_user");
        router.push(`/${locale}/login`);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    localStorage.removeItem("liveid_user");
    router.push(`/${locale}`);
  }

  if (loading) {
    return (
      <div>
        <Navbar showLogin={false} />
        <main style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <p style={{ color: "var(--text-muted)" }}>Loading…</p>
        </main>
      </div>
    );
  }

  const isExpired = user?.registrationExpiry && new Date() > new Date(user.registrationExpiry);
  const expiryDate = user?.registrationExpiry
    ? new Date(user.registrationExpiry).toLocaleDateString("en-MY", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <div>
      <Navbar showLogin={false} />
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "3rem 1.5rem" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
          <div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 4 }}>Your LiveID</p>
            <h1
              className="font-mono"
              style={{ fontSize: "1.6rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}
            >
              {user?.activeHandle ? `liveid.asia/${user.activeHandle}` : "No handle yet"}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            style={{
              border: "1px solid var(--border)",
              background: "white",
              color: "var(--text-muted)",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>

        {/* Status card */}
        <div
          style={{
            border: `1px solid ${isExpired ? "#B3261E" : "var(--border)"}`,
            borderRadius: 12,
            padding: "1.5rem",
            marginBottom: "1.5rem",
            background: isExpired ? "#FFF5F5" : "var(--mist)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>Status</p>
              <p
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: isExpired ? "#B3261E" : "var(--stamp-teal)",
                }}
              >
                {isExpired ? "⚠ Expired" : "✓ Verified Human"}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>
                {isExpired ? "Expired on" : "Renews on"}
              </p>
              <p style={{ fontSize: "0.9rem", color: "var(--ink)", fontWeight: 500 }}>
                {expiryDate || "—"}
              </p>
            </div>
          </div>

          {isExpired && (
            <Link
              href={`/${locale}/dashboard/renewal`}
              style={{
                display: "block",
                marginTop: "1rem",
                background: "var(--trust-blue)",
                color: "white",
                padding: "10px 16px",
                borderRadius: 8,
                textAlign: "center",
                fontWeight: 500,
                fontSize: "0.9rem",
              }}
            >
              Renew now
            </Link>
          )}
        </div>

        {/* Tier badge */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "1.25rem 1.5rem",
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>Tier</p>
            <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ink)" }}>
              {user?.tier === "VAULT" ? "🏆 Vault" : user?.tier === "PREMIUM_VARIANT" ? "⭐ Premium" : "✓ Standard"}
            </p>
          </div>
          {user?.tier === "STANDARD" && (
            <Link
              href={`/${locale}/vault`}
              style={{
                border: "1px solid var(--trust-blue)",
                color: "var(--trust-blue)",
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              Upgrade
            </Link>
          )}
        </div>

        {/* Quick actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: "1.5rem",
          }}
        >
          <ActionCard
            title="Edit Profile"
            desc="Photo, bio, social links"
            href={`/${locale}/dashboard/profile`}
          />
          <ActionCard
            title="Renewal"
            desc="Manage your subscription"
            href={`/${locale}/dashboard/renewal`}
          />
          <ActionCard
            title="Verify a handle"
            desc="Check if someone is real"
            href={`/${locale}`}
          />
          <ActionCard
            title="The Vault"
            desc="Browse premium handles"
            href={`/${locale}/vault`}
          />
        </div>

        {/* Generic ID */}
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
          Generic ID: {user?.genericId}
        </p>

      </main>
    </div>
  );
}

function ActionCard({ title, desc, href }) {
  return (
    <Link
      href={href}
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "1rem",
        display: "block",
        background: "white",
      }}
    >
      <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--ink)", marginBottom: 4 }}>
        {title}
      </p>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>{desc}</p>
    </Link>
  );
}