# JobFlow — Pengelola Lamaran Kerja Siswa & Pantau Karier

Aplikasi manajemen dan pelacak lamaran kerja modern yang dirancang untuk membantu siswa (khususnya SMK) merapikan proses rekrutmen, memantau tenggat seleksi, serta memudahkan Guru Bimbingan Konseling (BK) memantau progres karier siswa dalam satu tempat.

---

## 🚀 Fitur Utama

- **Papan Kanban Lamaran:** Alur seleksi 6 tahap (*Applied, Screening, Interview, Offering, Diterima, Ditolak*) dengan fitur pencarian, filter status, dan drag-and-drop yang intuitif.
- **Radar Tenggat & Jadwal:** Deteksi otomatis jadwal tes dan wawancara mendatang dengan visualisasi tenggat mendesak (< 24 jam) dan terlewat.
- **Persiapan Wawancara:** Checklist persiapan mandiri, profil singkat perusahaan mitra, dan draf surel follow-up otomatis setelah 7 hari kerja tanpa kabar.
- **Dasbor Analitik & Funnel Konversi:** Grafik funnel tahapan seleksi, persentase konversi wawancara hingga penawaran kerja (*offering*).
- **Portal Guru BK:** Pemantauan kolektif progres siswa binaan, statistik penempatan sekolah, serta direktori data lamaran per siswa.
- **Technical SEO & Social Sharing Siap Pakai:** Dilengkapi metadata OpenGraph lengkap, tag Canonical, Schema.org JSON-LD (`WebApplication` & `Organization`), `sitemap.xml`, dan `robots.txt`.
- **Aset Gambar Teroptimasi:** Banner OpenGraph dan favicon menggunakan format modern WebP berkualitas tinggi (~85%) untuk pemuatan cepat di semua jaringan.
- **Akun Demo Terintegrasi:** Akses instan dengan satu klik untuk peran Siswa dan Guru BK tanpa perlu konfigurasi basis data eksternal.

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

- **Framework:** [TanStack Start](https://tanstack.com/start) (Fullstack React Framework dengan SSR & Nitro engine)
- **Routing:** [TanStack Router](https://tanstack.com/router) (Type-safe file-based routing)
- **UI & Komponen:** [React 19](https://react.dev/), [Radix UI Primitives](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) (Icons), [Sonner](https://sonner.emilkowal.ski/) (Toast)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** In-memory client stack store (React Context)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
- **Testing:** [Vitest](https://vitest.dev/) & React Testing Library
- **Bundler:** [Vite](https://vite.dev/) & Rolldown

---

## 📁 Struktur Direktori Proyek

```text
FlowJob/
├── public/                 # Aset statis publik
│   ├── favicon.ico         # Fallback favicon untuk peramban lawas
│   ├── favicon.webp        # Favicon modern WebP terkompresi
│   ├── og-image.webp       # Banner OpenGraph 1200x630 untuk share WhatsApp/medsos
│   ├── robots.txt          # Direktif perayap mesin pencari & sitemap link
│   └── sitemap.xml         # Peta situs resmi dengan domain produksi
├── src/
│   ├── components/ui/      # Komponen antarmuka dasar (button, dialog, card, dll.)
│   ├── hooks/              # Custom React hooks (e.g. use-mobile)
│   ├── jobflow/            # Modul fungsional inti JobFlow
│   │   ├── auth.tsx        # Halaman Masuk & Pendaftaran
│   │   ├── data.ts         # Definisi tipe, seed data dummy, & helper kalkulasi
│   │   ├── detail.tsx      # Rincian lamaran, unggah CV, & tambah jadwal
│   │   ├── form.tsx        # Formulir tambah dan edit lamaran
│   │   ├── guru.tsx        # Portal Guru BK (Dasbor, Siswa, Progres, Statistik)
│   │   ├── home.tsx        # Beranda siswa & tindakan harian
│   │   ├── insights.tsx    # Radar tenggat & dasbor funnel
│   │   ├── kanban.tsx      # Papan Kanban drag-and-drop
│   │   ├── store.tsx       # Penyimpanan state in-memory & navigasi layar
│   │   └── ui.tsx          # Elemen UI umum (Header, BottomNav, Card, Modal)
│   ├── lib/
│   │   ├── constants.ts    # Konfigurasi situs terpusat, kontak, & data SEO
│   │   └── utils.ts        # Helper utilitas classnames (cn)
│   ├── routes/             # File-based routing TanStack Start
│   │   ├── __root.tsx      # Root layout, metadata head, & skrip global
│   │   └── index.tsx       # Entry point utama aplikasi
│   ├── test/               # Berkas pengujian otomatis (Vitest)
│   │   ├── app-routing.test.tsx
│   │   └── seo.test.tsx
│   ├── router.tsx          # Inisialisasi router
│   ├── server.ts           # Server entry point
│   ├── start.ts            # Konfigurasi TanStack Start
│   └── styles.css          # Konfigurasi Tailwind CSS v4 & tema
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 💻 Memulai Pengembangan Lokal (Getting Started)

### Prasyarat
- Node.js versi `18.x` atau yang lebih baru (disarankan `20.x` LTS atau `22.x`)
- npm, pnpm, atau bun

### Instalasi & Menjalankan Aplikasi

1. **Pasang dependensi:**
   ```bash
   npm install
   ```

2. **Jalankan development server:**
   ```bash
   npm run dev
   ```

3. Buka peramban di `http://localhost:3000` (atau port yang ditampilkan di terminal).

---

## 📜 Perintah yang Tersedia (Scripts)

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembangan dengan hot module replacement (HMR). |
| `npm run build` | Melakukan kompilasi bundle produksi (Client, SSR, dan Nitro build). |
| `npm run preview` | Menjalankan pratinjau lokal dari bundle hasil build produksi. |
| `npm test` | Menjalankan seluruh pengujian unit & integrasi menggunakan Vitest. |
| `npm run lint` | Menjalankan pemeriksaan kode menggunakan ESLint. |
| `npm run format` | Memformat seluruh kode menggunakan Prettier. |

---

## ⚙️ Konfigurasi Lingkungan (Environment Variables)

Secara bawaan aplikasi sudah siap berjalan langsung. Jika ingin mengubah URL produksi untuk sitemap atau OpenGraph metadata, buat file `.env` di direktori utama:

```env
VITE_SITE_URL=https://jobflow.id
```

Konfigurasi kontak bisnis, nama situs, nomor WhatsApp, dan jam kerja dapat diubah secara terpusat pada file [`src/lib/constants.ts`](src/lib/constants.ts).

---

## 🔑 Akun Demo untuk Pengujian

Aplikasi menyediakan dua akun demo yang dapat langsung digunakan pada layar Masuk:
- **Akun Siswa:** `rahima@email.com` / `rahima123`
- **Akun Guru BK:** `gurubk@jobflow.id` / `gurubk123`
