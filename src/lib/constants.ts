/**
 * Centralized Site Configuration & Business Constants
 * Eksklusif untuk Portal Karier & BKK SMK Negeri 53 Jakarta.
 */

const getBaseUrl = (): string => {
  const envUrl = (import.meta as unknown as { env?: { VITE_SITE_URL?: string } }).env?.VITE_SITE_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }
  return "https://jobflow.id";
};

export const SCHOOL_NAME = "SMK Negeri 53 Jakarta";
export const SCHOOL_SHORT_NAME = "SMKN 53 Jakarta";

/** Daftar 6 konsentrasi keahlian resmi SMK Negeri 53 Jakarta (Cengkareng, Jakarta Barat). */
export const SMKN53_MAJORS = [
  "Teknik Kendaraan Ringan (TKR)",
  "Teknik Sepeda Motor (TSM)",
  "Teknik Pengelasan (TP)",
  "Teknik Audio Video (TAV)",
  "Teknik Instalasi Tenaga Listrik (TITL)",
  "Teknik Komputer dan Jaringan (TKJ)",
  "Lainnya",
] as const;

export const STUDENT_STATUSES = ["Kelas XII", "Alumni"] as const;

export const SITE_CONFIG = {
  name: "JobFlow",
  legalName: "BKK SMK Negeri 53 Jakarta",
  schoolName: SCHOOL_NAME,
  schoolShortName: SCHOOL_SHORT_NAME,
  tagline: "Portal Karier & Pelacak Lamaran Kerja SMK Negeri 53 Jakarta",
  description:
    "Portal eksklusif siswa dan Guru BK SMK Negeri 53 Jakarta untuk melacak lamaran kerja, jadwal seleksi, dan pemantauan karier.",
  domain: getBaseUrl(),

  // Kontak & Operasional BKK SMKN 53 Jakarta
  contact: {
    whatsapp: "+62 812-0000-0000",
    whatsappClean: "6281200000000",
    whatsappUrl:
      "https://wa.me/6281200000000?text=Halo%20BKK%20SMKN%2053%20Jakarta,%20saya%20ingin%20bertanya%20seputar%20JobFlow",
    email: "bkk@smkn53jkt.sch.id",
    phone: "(021) 5439-5353",
    address: {
      street: "Jl. Flamboyan No. 53, Cengkareng Barat",
      city: "Jakarta Barat",
      province: "DKI Jakarta",
      country: "Indonesia",
      postalCode: "11730",
      full: "Jl. Flamboyan No. 53, Cengkareng Barat, Jakarta Barat",
    },
    workingHours: "Senin – Jumat, 07:30 – 15:30 WIB",
  },

  // Metadata SEO & Media Sosial
  seo: {
    defaultTitle: "JobFlow — Portal Karier SMK Negeri 53 Jakarta",
    titleTemplate: "%s | JobFlow SMKN 53 Jakarta",
    defaultDescription:
      "Portal eksklusif siswa dan Guru BK SMK Negeri 53 Jakarta untuk melacak lamaran kerja, jadwal tes & wawancara, serta pemantauan karier.",
    keywords: [
      "JobFlow",
      "SMK Negeri 53 Jakarta",
      "SMKN 53 Jakarta",
      "BKK SMKN 53",
      "lamaran kerja SMK",
      "guru BK",
      "pelacak lamaran kerja",
      "karier siswa",
    ],
    locale: "id_ID",
    type: "website",
    themeColor: "#4f46e5",
    ogImage: "/og-image.webp",
    faviconWebp: "/favicon.webp",
    faviconIco: "/favicon.ico",
    twitterCard: "summary_large_image" as const,
    twitterHandle: "@smkn53jakarta",
  },
} as const;

/**
 * Menghasilkan URL absolut lengkap untuk sitemap atau canonical URL.
 */
export function getAbsoluteUrl(path = "/"): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_CONFIG.domain}${cleanPath}`;
}

/**
 * Menghasilkan direct WhatsApp link dengan pesan kustom opsional.
 */
export function getWhatsAppLink(customMessage?: string): string {
  if (!customMessage) return SITE_CONFIG.contact.whatsappUrl;
  return `https://wa.me/${SITE_CONFIG.contact.whatsappClean}?text=${encodeURIComponent(customMessage)}`;
}

/**
 * Menghasilkan JSON-LD Structured Data (Schema.org) untuk SEO Google rich snippet.
 */
export function getSiteJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: `${SITE_CONFIG.name} — ${SITE_CONFIG.schoolShortName}`,
      url: SITE_CONFIG.domain,
      description: SITE_CONFIG.description,
      applicationCategory: "BusinessApplication",
      operatingSystem: "All",
      browserRequirements: "Requires modern JavaScript-enabled browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "IDR",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_CONFIG.legalName,
      legalName: SITE_CONFIG.legalName,
      url: SITE_CONFIG.domain,
      logo: getAbsoluteUrl(SITE_CONFIG.seo.ogImage),
      email: SITE_CONFIG.contact.email,
      telephone: SITE_CONFIG.contact.whatsapp,
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE_CONFIG.contact.address.street,
        addressLocality: SITE_CONFIG.contact.address.city,
        addressRegion: SITE_CONFIG.contact.address.province,
        postalCode: SITE_CONFIG.contact.address.postalCode,
        addressCountry: "ID",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: SITE_CONFIG.contact.whatsapp,
          contactType: "customer service",
          availableLanguage: ["Indonesian"],
          hoursAvailable: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "07:30",
            closes: "15:30",
          },
        },
      ],
    },
  ];
}
