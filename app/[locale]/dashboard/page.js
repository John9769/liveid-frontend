"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import { getUserProfile, getFullProfile, getMyReferralDashboard } from "../../../lib/api";

export default function DashboardPage() {
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("liveid");
  const [referralData, setReferralData] = useState(null);
  const [referralLoading, setReferralLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("liveid_user");
    if (!stored) { router.push(`/${locale}/login`); return; }

    const parsedUser = JSON.parse(stored);
    setUser(parsedUser);

    Promise.all([
      getUserProfile(parsedUser.id),
      getFullProfile(parsedUser.id),
    ])
      .then(([userdata, profileData]) => {
        setUser(userdata);
        setProfile(profileData.profile);

        // Check if user is a referral
        if (userdata.email) {
          getMyReferralDashboard(userdata.email)
            .then((data) => setReferralData(data))
            .catch(() => setReferralData(null));
        }
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
    ? new Date(user.registrationExpiry).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div>
      <Navbar showLogin={false} />
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "3rem 1.5rem" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 4 }}>Your LiveID</p>
            <h1 className="font-mono" style={{ fontSize: "1.6rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
              {user?.activeHandle ? `liveid.asia/${user.activeHandle}` : "No handle yet"}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            style={{ border: "1px solid var(--border)", background: "white", color: "var(--text-muted)", borderRadius: 6, padding: "6px 14px", fontSize: "0.85rem", cursor: "pointer" }}
          >
            Log out
          </button>
        </div>

        {/* Tabs — only show if user is a referral */}
        {referralData && (
          <div style={{ display: "flex", gap: 0, marginBottom: "1.5rem", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <button
              onClick={() => setActiveTab("liveid")}
              style={{ flex: 1, padding: "10px", fontSize: "0.88rem", fontWeight: activeTab === "liveid" ? 700 : 400, background: activeTab === "liveid" ? "var(--trust-blue)" : "white", color: activeTab === "liveid" ? "white" : "var(--text-muted)", border: "none", cursor: "pointer" }}
            >
              My LiveID
            </button>
            <button
              onClick={() => setActiveTab("earnings")}
              style={{ flex: 1, padding: "10px", fontSize: "0.88rem", fontWeight: activeTab === "earnings" ? 700 : 400, background: activeTab === "earnings" ? "var(--trust-blue)" : "white", color: activeTab === "earnings" ? "white" : "var(--text-muted)", border: "none", cursor: "pointer" }}
            >
              My Earnings
            </button>
          </div>
        )}

        {/* TAB 1 — MY LIVEID */}
        {activeTab === "liveid" && (
          <div>
            {/* Status card */}
            <div style={{ border: `1px solid ${isExpired ? "#B3261E" : "var(--border)"}`, borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", background: isExpired ? "#FFF5F5" : "var(--mist)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>Status</p>
                  <p style={{ fontSize: "1rem", fontWeight: 600, color: isExpired ? "#B3261E" : "var(--stamp-teal)" }}>
                    {isExpired ? "⚠ Expired" : "✓ Verified Human"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>
                    {isExpired ? "Expired on" : "Renews on"}
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "var(--ink)", fontWeight: 500 }}>{expiryDate || "—"}</p>
                </div>
              </div>
              {isExpired && (
                <Link href={`/${locale}/dashboard/renewal`} style={{ display: "block", marginTop: "1rem", background: "var(--trust-blue)", color: "white", padding: "10px 16px", borderRadius: 8, textAlign: "center", fontWeight: 500, fontSize: "0.9rem" }}>
                  Renew now
                </Link>
              )}
            </div>

            {/* Tier badge */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>Tier</p>
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ink)" }}>
                  {user?.tier === "VAULT" ? "🏆 Vault" : user?.tier === "PREMIUM_VARIANT" ? "⭐ Premium" : "✓ Standard"}
                </p>
              </div>
              {user?.tier === "STANDARD" && (
                <Link href={`/${locale}/vault`} style={{ border: "1px solid var(--trust-blue)", color: "var(--trust-blue)", padding: "6px 14px", borderRadius: 6, fontSize: "0.85rem", fontWeight: 500 }}>
                  Upgrade
                </Link>
              )}
            </div>

            {/* Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.5rem" }}>
              <ActionCard title="Edit Profile" desc="Photo, bio, social links" href={`/${locale}/dashboard/profile`} />
              <ActionCard title="Renewal" desc="Manage your subscription" href={`/${locale}/dashboard/renewal`} />
              <ActionCard title="Verify a handle" desc="Check if someone is real" href={`/${locale}/dashboard/verify`} />
              <ActionCard title="The Vault" desc="Browse premium handles" href={`/${locale}/vault`} />
            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
              Generic ID: {user?.genericId}
            </p>
          </div>
        )}

        {/* TAB 2 — MY EARNINGS */}
        {activeTab === "earnings" && referralData && (
          <div>
            {/* Referral code */}
            <div style={{ background: "var(--mist)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Your Referral Code</p>
              <p className="font-mono" style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--trust-blue)" }}>
                {referralData.referral.code}
              </p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
                Share: liveid.asia/register?ref={referralData.referral.code}
              </p>
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.5rem" }}>
              <StatBox label="Total Registrations" value={referralData.totalRegistrations} />
              <StatBox label="Total Earned" value={`RM ${referralData.referral.totalEarnings.toFixed(2)}`} color="var(--stamp-teal)" />
              <StatBox label="Paid Out" value={`RM ${referralData.referral.totalPaid.toFixed(2)}`} />
              <StatBox label="Pending Payout" value={`RM ${referralData.unpaidDirect.toFixed(2)}`} color={referralData.unpaidDirect > 0 ? "#F59E0B" : "var(--text-muted)"} />
            </div>

            {/* Super Referral override earnings */}
            {referralData.referral.isSuperReferral && (
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  Override Earnings — Super Referral
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <StatBox label="Override Earned" value={`RM ${referralData.referral.totalOverrideEarnings.toFixed(2)}`} color="var(--trust-blue)" />
                  <StatBox label="Override Pending" value={`RM ${referralData.unpaidOverride.toFixed(2)}`} color={referralData.unpaidOverride > 0 ? "#F59E0B" : "var(--text-muted)"} />
                </div>

                {/* Sub referrals */}
                {referralData.referral.subReferrals?.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 8 }}>Your recruited referrals:</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {referralData.referral.subReferrals.map((sub) => (
                        <div key={sub.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--mist)", borderRadius: 8 }}>
                          <div>
                            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}>{sub.name}</p>
                            <p className="font-mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>{sub.code}</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "0.82rem", color: "var(--stamp-teal)", fontWeight: 600, margin: 0 }}>RM {sub.totalEarnings?.toFixed(2)}</p>
                            <p style={{ fontSize: "0.72rem", color: sub.isActive ? "var(--stamp-teal)" : "#B3261E", margin: 0 }}>{sub.isActive ? "Active" : "Inactive"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recent earnings */}
            {referralData.referral.earnings?.length > 0 && (
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: "1.5rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)", margin: 0 }}>
                  Recent Earnings
                </p>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {referralData.referral.earnings.map((e, i) => (
                    <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 1.25rem", borderBottom: i < referralData.referral.earnings.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <div>
                        <p style={{ fontSize: "0.82rem", color: "var(--ink)", margin: 0 }}>{e.type.replace(/_/g, " ")}</p>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>{new Date(e.createdAt).toLocaleDateString("en-MY")}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "0.88rem", color: "var(--stamp-teal)", fontWeight: 600, margin: 0 }}>RM {e.amount.toFixed(2)}</p>
                        <p style={{ fontSize: "0.72rem", color: e.isPaid ? "var(--stamp-teal)" : "#F59E0B", margin: 0 }}>{e.isPaid ? "Paid" : "Pending"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {referralData.referral.earnings?.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                No earnings yet. Share your referral link to start earning.
              </p>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

function ActionCard({ title, desc, href }) {
  return (
    <Link href={href} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "1rem", display: "block", background: "white" }}>
      <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--ink)", marginBottom: 4 }}>{title}</p>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>{desc}</p>
    </Link>
  );
}

function StatBox({ label, value, color = "var(--ink)" }) {
  return (
    <div style={{ background: "var(--mist)", border: "1px solid var(--border)", borderRadius: 10, padding: "1rem 1.25rem" }}>
      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: "1.1rem", fontWeight: 700, color, margin: 0 }}>{value}</p>
    </div>
  );
}