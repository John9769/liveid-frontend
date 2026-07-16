"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Navbar from "../../../components/Navbar";

const CONTENT = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: 15 July 2026",
    sections: [
      {
        heading: "1. Data Controller",
        body: `AWAS Premium Resources (SSM Registration: 202603141446) is the data controller responsible for your personal data collected through LiveID (liveid.asia). For any data-related enquiries, contact us at hello@awas.asia.`,
      },
      {
        heading: "2. Data We Collect",
        body: `We collect the following personal data when you register for LiveID:\n\n• Full name (optional, for display purposes)\n• Phone number\n• Email address\n• Selfie photograph (facial image) — collected at registration as your permanent profile photo\n• Social media links — provided voluntarily by you\n• Verification page visit logs — IP address, browser user agent, referrer URL, and timestamp of visits to your verification page`,
      },
      {
        heading: "3. Why We Collect Your Data",
        body: `Your personal data is collected solely for the purpose of:\n\n• Verifying that you are a real human being\n• Creating and maintaining your unique LiveID handle\n• Displaying your verified identity on your public verification page\n• Processing your payment\n• Sending you renewal reminders and service communications\n• Detecting and preventing fraud and duplicate registrations`,
      },
      {
        heading: "4. Legal Basis — Explicit Consent",
        body: `Under the Personal Data Protection Act 2010 (PDPA) Malaysia and its 2024 Amendment, your selfie photograph constitutes sensitive personal data (biometric data). We collect and process this data based on your explicit consent given at the time of registration. You may withdraw your consent at any time by deleting your account.`,
      },
      {
        heading: "5. Third Party Data Processors",
        body: `Your data may be processed by the following third-party service providers on our behalf:\n\n• Cloudinary (Cloudinary Ltd) — secure cloud storage for your selfie photograph\n• Neon (Neon Inc) — database hosting for your account data\n• ToyyibPay — payment processing\n• Resend — email delivery service\n\nAll third-party processors are contractually obligated to protect your data and may not use it for any purpose other than providing services to LiveID.`,
      },
      {
        heading: "6. Data Retention",
        body: `We retain your personal data for as long as your account is active, plus one (1) year after account expiry or deletion. Upon account deletion:\n\n• Your selfie photograph is permanently deleted from Cloudinary\n• Your personal data is permanently deleted from our database\n• Your handle is retired permanently and cannot be re-registered\n\nVerification page visit logs are retained for a maximum of 12 months.`,
      },
      {
        heading: "7. Your Rights Under PDPA",
        body: `Under the PDPA Malaysia, you have the following rights:\n\n• Right to access — you may request a copy of your personal data held by us\n• Right to correct — you may correct any inaccurate or incomplete data\n• Right to withdraw consent — you may withdraw your consent and delete your account at any time via your dashboard\n• Right to data portability — you may request your data in a structured format\n\nTo exercise any of these rights, contact us at hello@awas.asia. We will respond within 21 days as required by law.`,
      },
      {
        heading: "8. Data Breach Notification",
        body: `In the event of a personal data breach that is likely to cause significant harm to you, we will notify the Personal Data Protection Commissioner within 72 hours of becoming aware of the breach, as required under the PDPA 2024 Amendment. We will also notify affected users as soon as practicable.`,
      },
      {
        heading: "9. Your Selfie Photograph & Verification Views",
        body: `Your selfie photograph is used solely as your LiveID profile photo displayed on your public verification page. It is stored securely on Cloudinary. We do not use your photograph for facial recognition, biometric matching, or any purpose beyond identity display. Your photograph cannot be changed after registration and will be permanently deleted upon account deletion.`,
      },
      {
        heading: "9a. Verified Photo Access & Verification Views",
        body: `Your verified selfie is shown only to logged-in LiveID members. Anonymous visitors to your verification page see your handle, verified status, social links and security seal, but not your photograph.\n\nWhen a logged-in LiveID member views another member's verification page, we record the viewing member's ID, the handle viewed, the time, and the IP address. We use this solely for fraud prevention and abuse investigation. We do not disclose this to the member being viewed.`,
      },
      {
        heading: "10. Cookies & Tracking",
        body: `LiveID uses a first-party cookie (liveid_ref) to track referral codes for up to 30 days. This cookie is used solely to attribute registrations to the correct referral partner. We do not use third-party tracking cookies or advertising trackers.`,
      },
      {
        heading: "11. Changes to This Policy",
        body: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email. Continued use of LiveID after changes constitutes acceptance of the updated policy.`,
      },
      {
        heading: "12. Contact",
        body: `For any privacy-related enquiries, data access requests, or to exercise your PDPA rights, contact our Data Protection Officer at:\n\nhello@awas.asia\nAWAS Premium Resources (202603141446)\nNegeri Sembilan, Malaysia`,
      },
    ],
  },
  bm: {
    title: "Dasar Privasi",
    lastUpdated: "Tarikh kemaskini: 15 Julai 2026",
    sections: [
      {
        heading: "1. Pengawal Data",
        body: `AWAS Premium Resources (Pendaftaran SSM: 202603141446) adalah pengawal data yang bertanggungjawab terhadap data peribadi anda yang dikumpul melalui LiveID (liveid.asia). Untuk sebarang pertanyaan berkaitan data, hubungi kami di hello@awas.asia.`,
      },
      {
        heading: "2. Data Yang Kami Kumpul",
        body: `Kami mengumpul data peribadi berikut semasa anda mendaftar untuk LiveID:\n\n• Nama penuh (pilihan, untuk tujuan paparan)\n• Nombor telefon\n• Alamat e-mel\n• Foto selfie (imej muka) — dikumpul semasa pendaftaran sebagai foto profil kekal anda\n• Pautan media sosial — diberikan secara sukarela oleh anda\n• Log lawatan halaman pengesahan — alamat IP, ejen pelayar, URL perujuk, dan masa lawatan ke halaman pengesahan anda`,
      },
      {
        heading: "3. Mengapa Kami Mengumpul Data Anda",
        body: `Data peribadi anda dikumpul semata-mata untuk tujuan:\n\n• Mengesahkan bahawa anda adalah manusia sebenar\n• Mencipta dan mengekalkan nama tanganan LiveID unik anda\n• Memaparkan identiti tersahkan anda pada halaman pengesahan awam anda\n• Memproses pembayaran anda\n• Menghantar peringatan pembaharuan dan komunikasi perkhidmatan\n• Mengesan dan mencegah penipuan dan pendaftaran berganda`,
      },
      {
        heading: "4. Asas Undang-undang — Persetujuan Eksplisit",
        body: `Di bawah Akta Perlindungan Data Peribadi 2010 (PDPA) Malaysia dan Pindaannya 2024, foto selfie anda merupakan data peribadi sensitif (data biometrik). Kami mengumpul dan memproses data ini berdasarkan persetujuan eksplisit anda yang diberikan semasa pendaftaran. Anda boleh menarik balik persetujuan anda pada bila-bila masa dengan memadamkan akaun anda.`,
      },
      {
        heading: "5. Pemproses Data Pihak Ketiga",
        body: `Data anda mungkin diproses oleh pembekal perkhidmatan pihak ketiga berikut bagi pihak kami:\n\n• Cloudinary (Cloudinary Ltd) — storan awan selamat untuk foto selfie anda\n• Neon (Neon Inc) — pengehosan pangkalan data untuk data akaun anda\n• ToyyibPay — pemprosesan pembayaran\n• Resend — perkhidmatan penghantaran e-mel\n\nSemua pemproses pihak ketiga diwajibkan secara kontrak untuk melindungi data anda dan tidak boleh menggunakannya untuk tujuan lain selain menyediakan perkhidmatan kepada LiveID.`,
      },
      {
        heading: "6. Pengekalan Data",
        body: `Kami menyimpan data peribadi anda selagi akaun anda aktif, ditambah satu (1) tahun selepas tamat tempoh atau pemadaman akaun. Selepas pemadaman akaun:\n\n• Foto selfie anda dipadam secara kekal dari Cloudinary\n• Data peribadi anda dipadam secara kekal dari pangkalan data kami\n• Nama tanganan anda bersara secara kekal dan tidak boleh didaftarkan semula\n\nLog lawatan halaman pengesahan disimpan maksimum 12 bulan.`,
      },
      {
        heading: "7. Hak Anda Di Bawah PDPA",
        body: `Di bawah PDPA Malaysia, anda mempunyai hak-hak berikut:\n\n• Hak untuk mengakses — anda boleh meminta salinan data peribadi anda yang kami pegang\n• Hak untuk membetulkan — anda boleh membetulkan sebarang data yang tidak tepat atau tidak lengkap\n• Hak untuk menarik balik persetujuan — anda boleh menarik balik persetujuan dan memadamkan akaun anda pada bila-bila masa melalui papan pemuka anda\n• Hak kepada kemudahalihan data — anda boleh meminta data anda dalam format berstruktur\n\nUntuk menggunakan mana-mana hak ini, hubungi kami di hello@awas.asia. Kami akan bertindak balas dalam masa 21 hari seperti yang dikehendaki undang-undang.`,
      },
      {
        heading: "8. Pemberitahuan Pelanggaran Data",
        body: `Sekiranya berlaku pelanggaran data peribadi yang berkemungkinan menyebabkan kemudaratan besar kepada anda, kami akan memberitahu Pesuruhjaya Perlindungan Data Peribadi dalam masa 72 jam selepas menyedari pelanggaran tersebut, seperti yang dikehendaki di bawah Pindaan PDPA 2024. Kami juga akan memberitahu pengguna yang terjejas secepat mungkin.`,
      },
      {
        heading: "9. Foto Selfie Anda & Rekod Semakan",
        body: `Foto selfie anda digunakan semata-mata sebagai foto profil LiveID anda yang dipaparkan pada halaman pengesahan awam anda. Ia disimpan dengan selamat di Cloudinary. Kami tidak menggunakan foto anda untuk pengecaman muka, pemadanan biometrik, atau sebarang tujuan selain paparan identiti. Foto anda tidak boleh ditukar selepas pendaftaran dan akan dipadam secara kekal selepas pemadaman akaun.`,
      },
      {
        heading: "9a. Akses Foto Sah & Rekod Semakan",
        body: `Foto selfie sah anda hanya dipaparkan kepada ahli LiveID yang telah log masuk. Pelawat tanpa akaun hanya melihat handle, status pengesahan, pautan media sosial dan meterai keselamatan anda — tetapi bukan foto anda.\n\nApabila seorang ahli LiveID yang telah log masuk melihat halaman pengesahan ahli lain, kami merekod ID ahli yang melihat, handle yang dilihat, masa, dan alamat IP. Rekod ini digunakan semata-mata untuk pencegahan penipuan dan siasatan penyalahgunaan. Kami tidak mendedahkannya kepada ahli yang dilihat.`,
      },
      {
        heading: "10. Kuki & Penjejakan",
        body: `LiveID menggunakan kuki pihak pertama (liveid_ref) untuk menjejak kod rujukan sehingga 30 hari. Kuki ini digunakan semata-mata untuk mengaitkan pendaftaran dengan rakan rujukan yang betul. Kami tidak menggunakan kuki penjejakan pihak ketiga atau penjejak pengiklanan.`,
      },
      {
        heading: "11. Perubahan pada Dasar Ini",
        body: `Kami mungkin mengemas kini Dasar Privasi ini dari semasa ke semasa. Kami akan memberitahu anda tentang perubahan ketara melalui e-mel. Penggunaan LiveID yang berterusan selepas perubahan bermaksud penerimaan dasar yang dikemas kini.`,
      },
      {
        heading: "12. Hubungi Kami",
        body: `Untuk sebarang pertanyaan berkaitan privasi, permintaan akses data, atau untuk menggunakan hak PDPA anda, hubungi Pegawai Perlindungan Data kami di:\n\nhello@awas.asia\nAWAS Premium Resources (202603141446)\nNegeri Sembilan, Malaysia`,
      },
    ],
  },
};

export default function PrivacyPage() {
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
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.8, margin: 0, whiteSpace: "pre-line" }}>{section.body}</p>
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