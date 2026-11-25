import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SITE_CONFIG, getAbsoluteUrl, getSiteJsonLd } from "@/lib/constants";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Halaman tidak ditemukan
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Halaman gagal dimuat
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Terjadi kendala saat memuat halaman ini. Silakan coba lagi atau kembali ke halaman utama.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Coba lagi
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Ke halaman utama
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: SITE_CONFIG.seo.defaultTitle },
        { name: "description", content: SITE_CONFIG.seo.defaultDescription },
        { name: "keywords", content: SITE_CONFIG.seo.keywords.join(", ") },
        { name: "theme-color", content: SITE_CONFIG.seo.themeColor },
        // OpenGraph
        { property: "og:site_name", content: SITE_CONFIG.name },
        { property: "og:title", content: SITE_CONFIG.seo.defaultTitle },
        {
          property: "og:description",
          content: SITE_CONFIG.seo.defaultDescription,
        },
        { property: "og:url", content: getAbsoluteUrl("/") },
        { property: "og:type", content: SITE_CONFIG.seo.type },
        { property: "og:locale", content: SITE_CONFIG.seo.locale },
        {
          property: "og:image",
          content: getAbsoluteUrl(SITE_CONFIG.seo.ogImage),
        },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:type", content: "image/webp" },
        { property: "og:image:alt", content: SITE_CONFIG.seo.defaultTitle },
        // Twitter
        { name: "twitter:card", content: SITE_CONFIG.seo.twitterCard },
        { name: "twitter:site", content: SITE_CONFIG.seo.twitterHandle },
        { name: "twitter:title", content: SITE_CONFIG.seo.defaultTitle },
        {
          name: "twitter:description",
          content: SITE_CONFIG.seo.defaultDescription,
        },
        {
          name: "twitter:image",
          content: getAbsoluteUrl(SITE_CONFIG.seo.ogImage),
        },
      ],
      links: [
        { rel: "canonical", href: getAbsoluteUrl("/") },
        {
          rel: "stylesheet",
          href: appCss,
        },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
        },
        { rel: "icon", href: SITE_CONFIG.seo.faviconWebp, type: "image/webp" },
        { rel: "icon", href: SITE_CONFIG.seo.faviconIco, type: "image/x-icon" },
        { rel: "apple-touch-icon", href: SITE_CONFIG.seo.faviconWebp },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(getSiteJsonLd()),
        },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
