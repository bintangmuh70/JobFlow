import { createFileRoute } from "@tanstack/react-router";
import { JobFlowApp } from "@/jobflow/app";
import { SITE_CONFIG, getAbsoluteUrl } from "@/lib/constants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: SITE_CONFIG.seo.defaultTitle },
      { name: "description", content: SITE_CONFIG.description },
      { property: "og:site_name", content: SITE_CONFIG.name },
      { property: "og:title", content: SITE_CONFIG.seo.defaultTitle },
      { property: "og:description", content: SITE_CONFIG.description },
      { property: "og:url", content: getAbsoluteUrl("/") },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: SITE_CONFIG.seo.locale },
      { property: "og:image", content: getAbsoluteUrl(SITE_CONFIG.seo.ogImage) },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_CONFIG.seo.defaultTitle },
      { name: "twitter:description", content: SITE_CONFIG.description },
      { name: "twitter:image", content: getAbsoluteUrl(SITE_CONFIG.seo.ogImage) },
    ],
    links: [{ rel: "canonical", href: getAbsoluteUrl("/") }],
  }),
  component: JobFlowApp,
});
