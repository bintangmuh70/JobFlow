import type { Screen } from "./store";

/**
 * Memetakan Screen aplikasi ke path URL asli yang rapi & bisa di-bookmark.
 */
export function screenToPath(s: Screen): string {
  switch (s.name) {
    case "login":
      return "/login";
    case "register":
      return "/register";
    case "home":
      return "/beranda";
    case "kanban":
      return "/lamaran";
    case "radar":
      return "/radar";
    case "dashboard":
      return "/dasbor";
    case "form":
      return s.editId ? `/lamaran/${encodeURIComponent(s.editId)}/edit` : "/lamaran/baru";
    case "detail":
      return `/lamaran/${encodeURIComponent(s.id)}`;
    case "gb-dashboard":
      return "/guru/dasbor";
    case "gb-students":
      return "/guru/siswa";
    case "gb-student":
      return `/guru/siswa/${encodeURIComponent(s.id)}`;
    case "gb-progress":
      return "/guru/progres";
    case "gb-stats":
      return "/guru/statistik";
    case "gb-profile":
      return "/guru/profil";
  }
}

/**
 * Memetakan pathname browser kembali menjadi Screen aplikasi.
 */
export function pathToScreen(pathname: string): Screen | null {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === "/" || clean === "/login") return { name: "login" };
  if (clean === "/register") return { name: "register" };
  if (clean === "/beranda") return { name: "home" };
  if (clean === "/lamaran" || clean === "/kanban") return { name: "kanban" };
  if (clean === "/radar") return { name: "radar" };
  if (clean === "/dasbor") return { name: "dashboard" };
  if (clean === "/lamaran/baru") return { name: "form" };

  const editMatch = clean.match(/^\/lamaran\/([^/]+)\/edit$/);
  if (editMatch?.[1]) return { name: "form", editId: decodeURIComponent(editMatch[1]) };

  const detailMatch = clean.match(/^\/lamaran\/([^/]+)$/);
  if (detailMatch?.[1]) return { name: "detail", id: decodeURIComponent(detailMatch[1]) };

  if (clean === "/guru" || clean === "/guru/dasbor") return { name: "gb-dashboard" };
  if (clean === "/guru/siswa") return { name: "gb-students" };
  const guruStudentMatch = clean.match(/^\/guru\/siswa\/([^/]+)$/);
  if (guruStudentMatch?.[1]) return { name: "gb-student", id: decodeURIComponent(guruStudentMatch[1]) };
  if (clean === "/guru/progres") return { name: "gb-progress" };
  if (clean === "/guru/statistik") return { name: "gb-stats" };
  if (clean === "/guru/profil") return { name: "gb-profile" };

  return null;
}
