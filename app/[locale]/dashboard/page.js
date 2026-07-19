"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import {
  getUserProfile,
  getFullProfile,
  getMyReferralDashboard,
  getStoredUser,
  clearSession,
} from "../../../lib/api";

const money = (n) => `RM ${Number(n || 0).toFixed(2)}`;

export default function DashboardPage() {
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("liveid");
  const [refData, setRefData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const stored = getStoredUser();
      if (!stored?.id) {
        clearSession();
        router.push(`/${locale}/login`);
        return;
      }

      setUser(stored);

      try {
        const userdata = await getUserProfile(stored.id);
        if (cancelled) return;
        setUser(userdata);

        try {
          const profileData = await getFullProfile(stored.id);
          if (!cancelled) setProfile(profileData.profile);
        } catch (err) {
          if (err.isAuthError) throw err;
          if (!cancelled) setProfile(null);
        }

        // Most users are not referrals — a 404 here is normal
        if (userdata.email) {
          try {
            const data = await getMyReferralDashboard(userdata.email);
            if (!cancelled) setRefData(data);
          } catch {
            if (!cancelled) setRefData(null);
          }
        }
      } catch {
        if (cancelled) return;
        clearSession();
        router.push(`/${locale}/login`);
        return;
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [locale, router]);

  function handleLogout() {
    clearSession();
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

  // A referral has a direct block, a super referral has an override block.
  // Nana, promoted, has both.
  const direct = refData?.direct || null;
  const override = refData?.override || null;
  const hasEarnings = !!(direct || override);

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

        {/* Tabs — only for referrals and super referrals */}
        {hasEarnings && (
          <div style={{ display: "flex", gap: 0, marginBottom: "1.5rem", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <TabButton active={activeTab === "liveid"} onClick={() => setActiveTab("liveid")}>
              My LiveID
            </TabButton>
            <TabButton active={activeTab === "earnings"} onClick={() => setActiveTab("earnings")}>
              My Earnings
            </TabButton>
          </div>
        )}

        {/* ============ TAB 1 — MY LIVEID ============ */}
        {activeTab === "liveid" && (
          <div>
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
                <>
                  <p style={{ fontSize: "0.8rem", color: "#B3261E", marginTop: 12, lineHeight: 1.6 }}>
                    Anyone clicking your link now sees an Expired notice. Your handle is still
                    yours — renew to restore your verification.
                  </p>
                  <Link href={`/${locale}/dashboard/renewal`} style={{ display: "block", marginTop: "1rem", background: "var(--trust-blue)", color: "white", padding: "10px 16px", borderRadius: 8, textAlign: "center", fontWeight: 500, fontSize: "0.9rem" }}>
                    Renew now
                  </Link>
                </>
              )}
            </div>

            {/* Tier */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>Tier</p>
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ink)" }}>
                  {user?.tier === "TITLE" ? "👑 Title" : user?.tier === "PREMIUM_VARIANT" ? "⭐ Premium" : "✓ Standard"}
                </p>
              </div>
              
            </div>

            {/* Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.5rem" }}>
              <ActionCard title="Edit Profile" desc="Bio, city, social links" href={`/${locale}/dashboard/profile`} />
              <ActionCard title="Renewal" desc="Manage your subscription" href={`/${locale}/dashboard/renewal`} />
              <ActionCard title="Verify a handle" desc="Check if someone is real" href={`/${locale}/dashboard/verify`} />
              <ActionCard title="My Shop" desc="Manage what you sell" href={`/${locale}/dashboard/shop`} />
            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
              Generic ID: {user?.genericId}
            </p>
          </div>
        )}

        {/* ============ TAB 2 — MY EARNINGS ============ */}
        {activeTab === "earnings" && hasEarnings && (
          <div>

            {/* ---- DIRECT — only for a referral with a code ---- */}
            {direct && (
              <div style={{ marginBottom: "2rem" }}>
                <SectionTitle>Direct Earnings</SectionTitle>

                {refData.referral.code && (
                  <div style={{ background: "var(--mist)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                      Your Referral Code
                    </p>
                    <p className="font-mono" style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--trust-blue)", margin: 0 }}>
                      {refData.referral.code}
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 6, wordBreak: "break-all" }}>
                      Share: liveid.asia/{locale}/register?ref={refData.referral.code}
                    </p>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
                  <StatBox label="Registrations" value={direct.totalRegistrations ?? 0} />
                  <StatBox label="Total Earned" value={money(direct.totalEarnings)} color="var(--stamp-teal)" />
                  <StatBox label="Paid Out" value={money(direct.totalPaid)} />
                  <StatBox label="Pending Payout" value={money(direct.unpaid)} color={direct.unpaid > 0 ? "#F59E0B" : "var(--text-muted)"} />
                </div>

                <EarningsList
                  title="Recent Direct Earnings"
                  rows={direct.earnings}
                  amountOf={(e) => e.amount}
                  paidOf={(e) => e.isPaid}
                  emptyText="No direct earnings yet. Share your referral link to start earning."
                />
              </div>
            )}

            {/* ---- OVERRIDE — only for a super referral ---- */}
            {override && (
              <div>
                <SectionTitle>Override Earnings — Super Referral</SectionTitle>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
                  <StatBox label="My Referrals" value={override.subReferralCount ?? 0} />
                  <StatBox label="Override Earned" value={money(override.totalEarnings)} color="var(--trust-blue)" />
                  <StatBox label="Paid Out" value={money(override.totalPaid)} />
                  <StatBox label="Pending Payout" value={money(override.unpaid)} color={override.unpaid > 0 ? "#F59E0B" : "var(--text-muted)"} />
                </div>

                {/* Recruits — their income is private, only my override shows */}
                {override.subReferrals?.length > 0 ? (
                  <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: "1rem" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)", margin: 0 }}>
                      My Referrals
                    </p>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {override.subReferrals.map((sub, i) => (
                        <div key={sub.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 1.25rem", borderBottom: i < override.subReferrals.length - 1 ? "1px solid var(--border)" : "none" }}>
                          <div>
                            <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}>{sub.name}</p>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
                              {sub.salesCount} sale{sub.salesCount === 1 ? "" : "s"}
                              {" · "}
                              <span style={{ color: sub.isActive ? "var(--stamp-teal)" : "#B3261E" }}>
                                {sub.isActive ? "Active" : "Inactive"}
                              </span>
                            </p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "0.9rem", color: "var(--trust-blue)", fontWeight: 700, margin: 0 }}>
                              {money(sub.myOverrideFromThem)}
                            </p>
                            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0 }}>my override</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.88rem", padding: "1.5rem 0" }}>
                    No referrals under you yet.
                  </p>
                )}

                <EarningsList
                  title="Recent Override Earnings"
                  rows={override.earnings}
                  amountOf={(e) => e.overrideAmount}
                  paidOf={(e) => e.overrideIsPaid}
                  emptyText="No override earnings yet."
                />
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "10px",
        fontSize: "0.88rem",
        fontWeight: active ? 700 : 400,
        background: active ? "var(--trust-blue)" : "white",
        color: active ? "white" : "var(--text-muted)",
        border: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function SectionTitle({ children }) {
  return (
    <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
      {children}
    </p>
  );
}

function EarningsList({ title, rows, amountOf, paidOf, emptyText }) {
  if (!rows || rows.length === 0) {
    return (
      <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", padding: "1rem 0" }}>
        {emptyText}
      </p>
    );
  }

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
      <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)", margin: 0 }}>
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map((e, i) => {
          const paid = paidOf(e);
          return (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 1.25rem", borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div>
                <p style={{ fontSize: "0.82rem", color: "var(--ink)", margin: 0 }}>
                  {e.type?.replace(/_/g, " ")}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
                  {new Date(e.createdAt).toLocaleDateString("en-MY")}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "0.88rem", color: "var(--stamp-teal)", fontWeight: 600, margin: 0 }}>
                  {money(amountOf(e))}
                </p>
                <p style={{ fontSize: "0.72rem", color: paid ? "var(--stamp-teal)" : "#F59E0B", margin: 0 }}>
                  {paid ? "Paid" : "Pending"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
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