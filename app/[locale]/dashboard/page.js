"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [completeness, setCompleteness] = useState(null);
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
          if (!cancelled) {
            setProfile(profileData.profile);
            // Sibling of profile in the response, not nested inside it.
            setCompleteness(profileData.completeness || null);
          }
        } catch (err) {
          if (err.isAuthError) throw err;
          if (!cancelled) { setProfile(null); setCompleteness(null); }
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
          <p style={{ color: "var(--text-muted)" }}>{t("loading")}</p>
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
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 4 }}>{t("yourLiveId")}</p>
            <h1 className="font-mono" style={{ fontSize: "1.6rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
              {user?.activeHandle ? `liveid.asia/${user.activeHandle}` : t("noHandleYet")}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            style={{ border: "1px solid var(--border)", background: "white", color: "var(--text-muted)", borderRadius: 6, padding: "6px 14px", fontSize: "0.85rem", cursor: "pointer" }}
          >
            {t("logout")}
          </button>
        </div>

        {/* Tabs — only for referrals and super referrals */}
        {hasEarnings && (
          <div style={{ display: "flex", gap: 0, marginBottom: "1.5rem", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <TabButton active={activeTab === "liveid"} onClick={() => setActiveTab("liveid")}>
              {t("tabLiveId")}
            </TabButton>
            <TabButton active={activeTab === "earnings"} onClick={() => setActiveTab("earnings")}>
              {t("tabEarnings")}
            </TabButton>
          </div>
        )}

        {/* ============ TAB 1 — MY LIVEID ============ */}
        {activeTab === "liveid" && (
          <div>
            <div style={{ border: `1px solid ${isExpired ? "#B3261E" : "var(--border)"}`, borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", background: isExpired ? "#FFF5F5" : "var(--mist)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>{t("status")}</p>
                  <p style={{ fontSize: "1rem", fontWeight: 600, color: isExpired ? "#B3261E" : "var(--stamp-teal)" }}>
                    {isExpired ? t("statusExpired") : t("statusVerified")}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>
                    {isExpired ? t("expiredOn") : t("renewsOn")}
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "var(--ink)", fontWeight: 500 }}>{expiryDate || "—"}</p>
                </div>
              </div>
              {isExpired && (
                <>
                  <p style={{ fontSize: "0.8rem", color: "#B3261E", marginTop: 12, lineHeight: 1.6 }}>
                    {t("expiredNote")}
                  </p>
                  <Link href={`/${locale}/dashboard/renewal`} style={{ display: "block", marginTop: "1rem", background: "var(--trust-blue)", color: "white", padding: "10px 16px", borderRadius: 8, textAlign: "center", fontWeight: 500, fontSize: "0.9rem" }}>
                    {t("renewNow")}
                  </Link>
                </>
              )}
            </div>

            {/* Page strength.
                Being verified is not the same as having a page a buyer can
                use. This says which checks a visitor can actually perform,
                and links straight to the field that is missing. */}
            {completeness && (
              <PageStrength c={completeness} t={t} locale={locale} handle={user?.activeHandle} />
            )}

            {/* Tier */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>{t("tier")}</p>
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ink)" }}>
                  {user?.tier === "TITLE" ? t("tierTitle") : user?.tier === "PREMIUM_VARIANT" ? t("tierPremium") : t("tierStandard")}
                </p>
              </div>
              
            </div>

            {/* Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.5rem" }}>
              <ActionCard title={t("actionEditProfileTitle")} desc={t("actionEditProfileDesc")} href={`/${locale}/dashboard/profile`} />
              <ActionCard title={t("actionRenewalTitle")} desc={t("actionRenewalDesc")} href={`/${locale}/dashboard/renewal`} />
              <ActionCard title={t("actionVerifyTitle")} desc={t("actionVerifyDesc")} href={`/${locale}/dashboard/verify`} />
              <ActionCard title={t("actionShopTitle")} desc={t("actionShopDesc")} href={`/${locale}/dashboard/shop`} />
            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
              {t("genericId", { id: user?.genericId })}
            </p>
          </div>
        )}

        {/* ============ TAB 2 — MY EARNINGS ============ */}
        {activeTab === "earnings" && hasEarnings && (
          <div>

            {/* ---- DIRECT — only for a referral with a code ---- */}
            {direct && (
              <div style={{ marginBottom: "2rem" }}>
                <SectionTitle>{t("directEarnings")}</SectionTitle>

                {refData.referral.code && (
                  <div style={{ background: "var(--mist)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                      {t("yourReferralCode")}
                    </p>
                    <p className="font-mono" style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--trust-blue)", margin: 0 }}>
                      {refData.referral.code}
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 6, wordBreak: "break-all" }}>
                      {t("share", { url: `liveid.asia/${locale}/register?ref=${refData.referral.code}` })}
                    </p>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
                  <StatBox label={t("statRegistrations")} value={direct.totalRegistrations ?? 0} />
                  <StatBox label={t("statTotalEarned")} value={money(direct.totalEarnings)} color="var(--stamp-teal)" />
                  <StatBox label={t("statPaidOut")} value={money(direct.totalPaid)} />
                  <StatBox label={t("statPendingPayout")} value={money(direct.unpaid)} color={direct.unpaid > 0 ? "#F59E0B" : "var(--text-muted)"} />
                </div>

                <EarningsList
                  title={t("recentDirectEarnings")}
                  rows={direct.earnings}
                  amountOf={(e) => e.amount}
                  paidOf={(e) => e.isPaid}
                  emptyText={t("emptyDirect")}
                  paidLabel={t("paid")}
                  pendingLabel={t("pending")}
                />
              </div>
            )}

            {/* ---- OVERRIDE — only for a super referral ---- */}
            {override && (
              <div>
                <SectionTitle>{t("overrideEarnings")}</SectionTitle>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
                  <StatBox label={t("statMyReferrals")} value={override.subReferralCount ?? 0} />
                  <StatBox label={t("statOverrideEarned")} value={money(override.totalEarnings)} color="var(--trust-blue)" />
                  <StatBox label={t("statPaidOut")} value={money(override.totalPaid)} />
                  <StatBox label={t("statPendingPayout")} value={money(override.unpaid)} color={override.unpaid > 0 ? "#F59E0B" : "var(--text-muted)"} />
                </div>

                {/* Recruits — their income is private, only my override shows */}
                {override.subReferrals?.length > 0 ? (
                  <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: "1rem" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)", margin: 0 }}>
                      {t("myReferrals")}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {override.subReferrals.map((sub, i) => (
                        <div key={sub.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 1.25rem", borderBottom: i < override.subReferrals.length - 1 ? "1px solid var(--border)" : "none" }}>
                          <div>
                            <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}>{sub.name}</p>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
                              {sub.salesCount} {sub.salesCount === 1 ? t("saleSingular") : t("salePlural")}
                              {" · "}
                              <span style={{ color: sub.isActive ? "var(--stamp-teal)" : "#B3261E" }}>
                                {sub.isActive ? t("active") : t("inactive")}
                              </span>
                            </p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "0.9rem", color: "var(--trust-blue)", fontWeight: 700, margin: 0 }}>
                              {money(sub.myOverrideFromThem)}
                            </p>
                            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0 }}>{t("myOverride")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.88rem", padding: "1.5rem 0" }}>
                    {t("noRecruits")}
                  </p>
                )}

                <EarningsList
                  title={t("recentOverrideEarnings")}
                  rows={override.earnings}
                  amountOf={(e) => e.overrideAmount}
                  paidOf={(e) => e.overrideIsPaid}
                  emptyText={t("emptyOverride")}
                  paidLabel={t("paid")}
                  pendingLabel={t("pending")}
                />
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}

// ============================================================
// PAGE STRENGTH
//
// The score is private to the owner. A visitor never sees a grade —
// they see what they can and cannot check. Here the owner sees the
// same facts framed as work to do, with a link to the exact field.
// ============================================================

function PageStrength({ c, t, locale, handle }) {
  const score = c.score ?? 0;
  const complete = score >= 100;

  const bar = complete ? "var(--stamp-teal)" : score >= 70 ? "#F59E0B" : "#B3261E";
  const tint = complete ? "#F0FDF4" : score >= 70 ? "#FFF8E1" : "#FFF5F5";
  const edge = complete ? "var(--stamp-teal)" : score >= 70 ? "#F59E0B" : "#B3261E";

  const rows = [
    { ok: true, label: t("strengthVerified") },
    { ok: c.hasPhoto, label: c.hasPhoto ? t("strengthPhotoOk") : t("strengthPhotoNo") },
    { ok: c.hasSocial, label: c.hasSocial ? t("strengthSocialOk") : t("strengthSocialNo") },
    { ok: c.hasWhatsapp, label: c.hasWhatsapp ? t("strengthWhatsappOk") : t("strengthWhatsappNo") },
  ];

  return (
    <div style={{ border: `1px solid ${edge}`, borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.5rem", background: tint }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
          {t("strengthTitle")}
        </p>
        <p style={{ fontSize: "1.1rem", fontWeight: 700, color: bar, margin: 0 }}>
          {score}%
        </p>
      </div>

      <div style={{ height: 6, background: "rgba(0,0,0,0.08)", borderRadius: 999, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ width: `${score}%`, height: "100%", background: bar, borderRadius: 999 }} />
      </div>

      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 12px" }}>
        {complete ? t("strengthCompleteBody") : t("strengthIncompleteBody")}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: complete ? 0 : 14 }}>
        {rows.map((r, i) => (
          <p key={i} style={{ fontSize: "0.8rem", color: r.ok ? "var(--text-muted)" : "var(--ink)", fontWeight: r.ok ? 400 : 600, lineHeight: 1.5, margin: 0 }}>
            {r.ok ? "✓" : "✗"} {r.label}
          </p>
        ))}
      </div>

      {!complete && (
        <Link href={`/${locale}/dashboard/profile`} style={{ display: "block", textAlign: "center", background: "var(--trust-blue)", color: "white", padding: "10px", borderRadius: 8, fontWeight: 600, fontSize: "0.88rem", textDecoration: "none" }}>{t("strengthCta")}</Link>
      )}
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

function EarningsList({ title, rows, amountOf, paidOf, emptyText, paidLabel, pendingLabel }) {
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
                  {paid ? paidLabel : pendingLabel}
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