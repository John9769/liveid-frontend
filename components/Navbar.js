"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar({ showLogin = false }) {
  const locale = useLocale();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 1.5rem",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <Link
        href={`/${locale}`}
        className="font-display"
        style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--ink)" }}
      >
        LiveID
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {showLogin && (
          <Link
            href={`/${locale}/login`}
            style={{
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "var(--trust-blue)",
              border: "1px solid var(--trust-blue)",
              borderRadius: 6,
              padding: "5px 14px",
            }}
          >
            Login
          </Link>
        )}
        <LanguageSwitcher />
      </div>
    </nav>
  );
}