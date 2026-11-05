/**
 * Centralized Site Configuration & Business Constants
 * Digunakan di seluruh halaman dan komponen untuk konsistensi data bisnis, kontak, dan SEO teknikal.
 */

const getBaseUrl = (): string => {
  // Dukungan environment variable Vite/Nitro saat build atau deployment
  const envUrl = (
    import.meta as unknown as { env?: { VITE_SITE_URL?: string } }
  ).env?.VITE_SITE_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }
  return "https://jobflow.id";
};

export const SITE_CONFIG = {
  name: "JobFlow",
  legalName: "PT JobFlow Karir Nusantara",
  tagline: "Pengelola Lamaran Kerja Siswa SMK & Pantau Karier",
  description:
    "Lacak lamaran kerja siswa SMK dan pantau progres karier bersama Guru BK. Semua lamaran kerjamu, rapi dalam satu tempat.",
  domain: getBaseUrl(),

  // Kontak & Operasional Bisnis
  contact: {
    whatsapp: "+62 812-0000-0000",
    whatsappClean: "6281200000000",
    whatsappUrl:
      "https://wa.me/6281200000000?text=Halo%20JobFlow,%20saya%20ingin%20bertanya%20seputar%20aplikasi",
    email: "halo@jobflow.id",
    phone: "0812-0000-0000",
    address: {
      street: "Jl. Pendidikan Visi No. 10",
      city: "Jakarta",
      province: "DKI Jakarta",
      country: "Indonesia",
      postalCode: "12000",
      full: "Jakarta, Indonesia",
    },
    workingHours: "Senin – Jumat, 08:00 – 17:00 WIB",
  },

  // Metadata SEO & Media Sosial
  seo: {
    defaultTitle: "JobFlow — Pengelola Lamaran Kerja Siswa SMK",
    titleTemplate: "%s | JobFlow",
    defaultDescription:
      "Lacak lamaran kerja siswa SMK dan pantau progres karier bersama Guru BK. Semua lamaran kerjamu, rapi dalam satu tempat.",
    keywords: [
      "JobFlow",
      "lamaran kerja",
      "siswa SMK",
      "guru BK",
      "pelacak lamaran kerja",
      "kanban lamaran",
      "bursa kerja khusus",
      "karier siswa",
    ],
    locale: "id_ID",
    type: "website",
    themeColor: "#4f46e5",
    ogImage: "/og-image.webp",
    faviconWebp: "/favicon.webp",
    faviconIco: "/favicon.ico",
    twitterCard: "summary_large_image" as const,
    twitterHandle: "@Lovable",
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
      name: SITE_CONFIG.name,
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
      name: SITE_CONFIG.name,
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
            opens: "08:00",
            closes: "17:00",
          },
        },
      ],
    },
  ];
}
