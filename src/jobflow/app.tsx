import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { StoreProvider, useStore } from "@/jobflow/store";
import { Login, Register, RecoveryModal } from "@/jobflow/auth";
import { HomeScreen } from "@/jobflow/home";
import { KanbanScreen } from "@/jobflow/kanban";
import { FormScreen } from "@/jobflow/form";
import { DetailScreen } from "@/jobflow/detail";
import { RadarScreen, DashboardScreen } from "@/jobflow/insights";
import { StudentShell } from "@/jobflow/ui";
import { SITE_CONFIG } from "@/lib/constants";

const GuruPortal = lazy(() => import("@/jobflow/guru"));

function LoadingView({ label }: { label?: string | undefined }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary/25 border-t-primary" />
        <p className="text-sm font-semibold text-muted-foreground">{label ?? `Memuat ${SITE_CONFIG.name}…`}</p>
      </div>
    </div>
  );
}

function Screens() {
  const { screen, loading } = useStore();
  if (loading) return <LoadingView />;
  if (screen.name === "login") return <Login initialEmail={screen.email} />;
  if (screen.name === "register") return <Register />;
  if (screen.name.startsWith("gb-")) {
    return (
      <Suspense fallback={<LoadingView label="Memuat Portal Guru BK…" />}>
        <GuruPortal />
      </Suspense>
    );
  }
  return (
    <StudentShell>
      {screen.name === "home" && <HomeScreen />}
      {screen.name === "kanban" && <KanbanScreen />}
      {screen.name === "radar" && <RadarScreen />}
      {screen.name === "dashboard" && <DashboardScreen />}
      {screen.name === "form" && <FormScreen key={screen.editId ?? "new"} editId={screen.editId} />}
      {screen.name === "detail" && <DetailScreen key={screen.id} id={screen.id} />}
    </StudentShell>
  );
}

export function JobFlowApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="min-h-screen bg-background font-sans">
      {mounted && (
        <StoreProvider>
          <Screens />
          <RecoveryModal />
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
