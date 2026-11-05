import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { StoreProvider, useStore } from "@/jobflow/store";
import { Login, Register } from "@/jobflow/auth";
import { HomeScreen } from "@/jobflow/home";
import { KanbanScreen } from "@/jobflow/kanban";
import { FormScreen } from "@/jobflow/form";
import { DetailScreen } from "@/jobflow/detail";
import { RadarScreen, DashboardScreen } from "@/jobflow/insights";
import { BottomNav } from "@/jobflow/ui";
import {
  GuruShell,
  GuruDashboard,
  GuruStudents,
  GuruStudentDetail,
  GuruProgress,
  GuruStats,
  GuruProfile,
} from "@/jobflow/guru";
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
      {
        property: "og:image",
        content: getAbsoluteUrl(SITE_CONFIG.seo.ogImage),
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_CONFIG.seo.defaultTitle },
      { name: "twitter:description", content: SITE_CONFIG.description },
      {
        name: "twitter:image",
        content: getAbsoluteUrl(SITE_CONFIG.seo.ogImage),
      },
    ],
    links: [{ rel: "canonical", href: getAbsoluteUrl("/") }],
  }),
  component: Index,
});

function Screens() {
  const { screen } = useStore();
  if (screen.name === "login") return <Login initialEmail={screen.email} />;
  if (screen.name === "register") return <Register />;
  if (screen.name.startsWith("gb-")) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-[1440px] bg-background font-sans">
        <GuruShell>
          {screen.name === "gb-dashboard" && <GuruDashboard />}
          {screen.name === "gb-students" && <GuruStudents />}
          {screen.name === "gb-student" && (
            <GuruStudentDetail key={screen.id} id={screen.id} />
          )}
          {screen.name === "gb-progress" && <GuruProgress />}
          {screen.name === "gb-stats" && <GuruStats />}
          {screen.name === "gb-profile" && <GuruProfile />}
        </GuruShell>
      </div>
    );
  }
  const main = ["home", "kanban", "radar", "dashboard"].includes(screen.name);
  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl bg-background font-sans md:shadow-card">
      {screen.name === "home" && <HomeScreen />}
      {screen.name === "kanban" && <KanbanScreen />}
      {screen.name === "radar" && <RadarScreen />}
      {screen.name === "dashboard" && <DashboardScreen />}
      {screen.name === "form" && (
        <FormScreen key={screen.editId ?? "new"} editId={screen.editId} />
      )}
      {screen.name === "detail" && (
        <DetailScreen key={screen.id} id={screen.id} />
      )}
      {main && <BottomNav />}
    </div>
  );
}

function Index() {
  // Data dummy memakai waktu sekarang, jadi render di klien saja agar tidak mismatch saat hidrasi.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="min-h-screen bg-background font-sans">
      {mounted && (
        <StoreProvider>
          <Screens />
        </StoreProvider>
      )}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          style: { fontFamily: "Plus Jakarta Sans, sans-serif" },
        }}
      />
    </div>
  );
}
