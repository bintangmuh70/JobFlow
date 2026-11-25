import { createFileRoute } from "@tanstack/react-router";
import { JobFlowApp } from "@/jobflow/app";
import { SITE_CONFIG } from "@/lib/constants";

/**
 * Catch-all route agar URL halaman (/beranda, /kanban, /lamaran/:id, /guru/*)
 * tetap terbuka mulus saat direfresh (F5) atau diakses langsung.
 */
export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: SITE_CONFIG.seo.defaultTitle },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: JobFlowApp,
});
