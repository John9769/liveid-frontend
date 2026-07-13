"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(newLocale) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <div style={{ display: "flex", gap: 4 }}>
      <button
        onClick={() => switchTo("en")}
        style={{
          border: "1px solid var(--border)",
          background: locale === "en" ? "var(--trust-blue)" : "white",
          color: locale === "en" ? "white" : "var(--ink)",
          borderRadius: 6,
          padding: "4px 12px",
          fontSize: "0.8rem",
          fontWeight: 500,
        }}
      >
        EN
      </button>
      <button
        onClick={() => switchTo("ms")}
        style={{
          border: "1px solid var(--border)",
          background: locale === "ms" ? "var(--trust-blue)" : "white",
          color: locale === "ms" ? "white" : "var(--ink)",
          borderRadius: 6,
          padding: "4px 12px",
          fontSize: "0.8rem",
          fontWeight: 500,
        }}
      >
        BM
      </button>
    </div>
  );
}