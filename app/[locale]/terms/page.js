"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Navbar from "../../../components/Navbar";

const CONTENT = {
  en: {
    title: "Terms & Conditions",
    lastUpdated: "Last updated: 15 July 2026",
    sections: [
      {
        heading: "1. Service Provider",
        body: `LiveID is a product of AWAS Premium Resources (SSM Registration: 202603141446), a company incorporated in Malaysia. By registering for LiveID, you agree to these Terms & Conditions in full.`,
      },
      {
        heading: "2. What LiveID Is",
        body: `LiveID is a verified human identity platform. Upon registration, you are issued a unique handle (e.g. liveid.asia/yourname) that serves as your verified online identity. Your handle is linked to a selfie taken at the time of registration.`,
      },
      {
        heading: "3. Handle Ownership",
        body: `Your handle is licensed to you, not sold. It is non-transferable and non-resalable. Your handle remains active for as long as your subscription is valid. Upon expiry and non-renewal, your handle may be deactivated. Upon account deletion, your handle is permanently retired and cannot be claimed by anyone else.`,
      },
      {
        heading: "4. One Account Per Human",
        body: `Each individual may only register one LiveID account. Registering multiple accounts is strictly prohibited and will result in immediate termination of all accounts without refund.`,
      },
      {
        heading: "5. Payment & Refunds",
        body: `All payments are processed via ToyyibPay. Registration fees and handle fees are non-refundable once payment is successfully processed. Annual renewal fees are non-refundable after payment.`,
      },
      {
        heading: "6. Annual Renewal",
        body: `Your LiveID subscription must be renewed annually to remain active. It is your sole responsibility to renew before your expiry date. AWAS Premium Resources will send a reminder email 14 days before expiry but is not liable for any lapse caused by failure to renew.`,
      },
      {
        heading: "7. Prohibited Conduct",
        body: `You must not use LiveID to impersonate another person, conduct fraud, provide false identity information, or use the platform for any illegal purpose. Violation of this clause will result in immediate account termination without refund and may be reported to the relevant authorities.`,
      },
      {
        heading: "8. Termination",
        body: `AWAS Premium Resources reserves the right to terminate any account at any time without prior notice if we determine that these Terms & Conditions have been violated. No refund will be issued upon termination for violations.`,
      },
      {
        heading: "9. Limitation of Liability",
        body: `AWAS Premium Resources shall not be liable for any loss or damage arising from your use of LiveID, including but not limited to financial loss, reputational damage, or unauthorized access to your account. Use of LiveID is at your own risk.`,
      },
      {
        heading: "10. Governing Law",
        body: `These Terms & Conditions are governed by the laws of Malaysia. Any disputes arising shall be subject to the exclusive jurisdiction of the courts of Malaysia.`,
      },
      {
        heading: "11. Changes to Terms",
        body: `AWAS Premium Resources reserves the right to update these Terms & Conditions at any time. Continued use of LiveID after changes constitutes acceptance of the updated terms.`,
      },
      {
        heading: "12. Contact",
        body: `For any queries regarding these Terms & Conditions, please contact us at hello@awas.asia.`,
      },
    ],
  },
  bm: {
    title: "Terma & Syarat",
    lastUpdated: "Tarikh kemaskini: 15 Julai 2026",
    sections: [
      {
        heading: "1. Pembekal Perkhidmatan",
        body: `LiveID adalah produk AWAS Premium Resources (Pendaftaran SSM: 202603141446), sebuah syarikat yang diperbadankan di Malaysia. Dengan mendaftar untuk LiveID, anda bersetuju sepenuhnya dengan Terma & Syarat ini.`,
      },
      {
        heading: "2. Apakah LiveID",
        body: `LiveID adalah platform identiti manusia yang disahkan. Selepas pendaftaran, anda diberi nama tanganan unik (contoh: liveid.asia/namaanda) yang berfungsi sebagai identiti dalam talian anda yang disahkan. Nama tanganan anda dikaitkan dengan selfie yang diambil semasa pendaftaran.`,
      },
      {
        heading: "3. Pemilikan Nama Tanganan",
        body: `Nama tanganan anda dilesenkan kepada anda, bukan dijual. Ia tidak boleh dipindahmilik atau dijual semula. Nama tanganan anda kekal aktif selagi langganan anda sah. Selepas tamat tempoh dan tidak diperbaharui, nama tanganan anda mungkin dinyahaktifkan. Setelah akaun dipadam, nama tanganan anda bersara secara kekal dan tidak boleh dituntut oleh sesiapa pun.`,
      },
      {
        heading: "4. Satu Akaun Setiap Manusia",
        body: `Setiap individu hanya boleh mendaftar satu akaun LiveID. Pendaftaran berbilang akaun adalah dilarang sama sekali dan akan mengakibatkan penamatan segera semua akaun tanpa bayaran balik.`,
      },
      {
        heading: "5. Pembayaran & Bayaran Balik",
        body: `Semua pembayaran diproses melalui ToyyibPay. Yuran pendaftaran dan yuran nama tanganan tidak boleh dikembalikan setelah pembayaran berjaya diproses. Yuran pembaharuan tahunan tidak boleh dikembalikan selepas pembayaran.`,
      },
      {
        heading: "6. Pembaharuan Tahunan",
        body: `Langganan LiveID anda mesti diperbaharui setiap tahun agar kekal aktif. Adalah tanggungjawab anda sepenuhnya untuk memperbaharui sebelum tarikh tamat tempoh. AWAS Premium Resources akan menghantar e-mel peringatan 14 hari sebelum tamat tempoh tetapi tidak bertanggungjawab atas sebarang kegagalan yang disebabkan oleh tidak memperbaharui.`,
      },
      {
        heading: "7. Tingkah Laku Dilarang",
        body: `Anda tidak boleh menggunakan LiveID untuk menyamar sebagai orang lain, menjalankan penipuan, memberikan maklumat identiti palsu, atau menggunakan platform ini untuk sebarang tujuan haram. Pelanggaran klausa ini akan mengakibatkan penamatan akaun segera tanpa bayaran balik dan boleh dilaporkan kepada pihak berkuasa yang berkaitan.`,
      },
      {
        heading: "8. Penamatan",
        body: `AWAS Premium Resources berhak menamatkan mana-mana akaun pada bila-bila masa tanpa notis awal jika kami mendapati Terma & Syarat ini telah dilanggar. Tiada bayaran balik akan dikeluarkan atas penamatan akibat pelanggaran.`,
      },
      {
        heading: "9. Had Liabiliti",
        body: `AWAS Premium Resources tidak bertanggungjawab atas sebarang kerugian atau kerosakan yang timbul daripada penggunaan LiveID anda, termasuk tetapi tidak terhad kepada kerugian kewangan, kerosakan reputasi, atau akses tanpa kebenaran ke akaun anda. Penggunaan LiveID adalah atas risiko anda sendiri.`,
      },
      {
        heading: "10. Undang-undang Pentadbiran",
        body: `Terma & Syarat ini dikawal oleh undang-undang Malaysia. Sebarang pertikaian yang timbul tertakluk kepada bidang kuasa eksklusif mahkamah Malaysia.`,
      },
      {
        heading: "11. Perubahan pada Terma",
        body: `AWAS Premium Resources berhak mengemas kini Terma & Syarat ini pada bila-bila masa. Penggunaan LiveID yang berterusan selepas perubahan bermaksud penerimaan terma yang dikemas kini.`,
      },
      {
        heading: "12. Hubungi Kami",
        body: `Untuk sebarang pertanyaan mengenai Terma & Syarat ini, sila hubungi kami di hello@awas.asia.`,
      },
    ],
  },
};

export default function TermsPage() {
  const locale = useLocale();
  const router = useRouter();
  const [lang, setLang] = useState("en");
  const content = CONTENT[lang];

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <Navbar showLogin />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem" }}>

        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", padding: 0, marginBottom: "1.5rem" }}
        >
          ← Back
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>{content.title}</h1>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 6 }}>{content.lastUpdated}</p>
          </div>
          <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <button onClick={() => setLang("en")} style={{ padding: "6px 16px", border: "none", background: lang === "en" ? "var(--trust-blue)" : "white", color: lang === "en" ? "white" : "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer" }}>EN</button>
            <button onClick={() => setLang("bm")} style={{ padding: "6px 16px", border: "none", background: lang === "bm" ? "var(--trust-blue)" : "white", color: lang === "bm" ? "white" : "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer" }}>BM</button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {content.sections.map((section, i) => (
            <div key={i}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>{section.heading}</h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.8, margin: 0 }}>{section.body}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "3rem", padding: "1rem 1.25rem", background: "var(--mist)", borderRadius: 10, border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, textAlign: "center" }}>
            © {new Date().getFullYear()} AWAS Premium Resources (202603141446) — liveid.asia
          </p>
        </div>

      </main>
    </div>
  );
}