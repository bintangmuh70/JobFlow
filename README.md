# JobFlow — Pengelola Lamaran Kerja Siswa & Pemantauan Karier Guru BK

Aplikasi web full-stack untuk membantu siswa SMK mencatat, mengelola, dan memantau progres lamaran kerja, sekaligus memudahkan Guru Bimbingan Konseling (BK) memantau perkembangan karier dan penempatan kerja siswa binaan secara real-time.

---

## Fitur Utama

### Portal Siswa
* **Autentikasi & Profil Persisten (Supabase Auth):** Daftar akun siswa, masuk dengan verifikasi peran, pemulihan kata sandi (*Lupa kata sandi*), sesi persisten saat halaman di-refresh, dan edit profil siswa.
* **Papan Kanban 6 Tahap:** *Applied, Screening, Interview, Offering, Diterima, Ditolak* dengan drag-and-drop, pencarian, filter multi-kriteria, dan pencatatan riwayat status otomatis (`status_history`).
* **Beranda & Tindakan Harian:** Pengingat follow-up otomatis (≥ 7 hari kerja) dengan draf surel siap salin, kartu persiapan wawancara (≤ 48 jam) dengan checklist persisten di database, serta **Catatan Bimbingan dari Guru BK**.
* **Radar Tenggat & Integrasi Kalender:** Countdown real-time jadwal tes/wawancara, notifikasi browser, serta tombol **Google Calendar** dan **Unduh `.ics`**.
* **Lampiran CV Privat (Supabase Storage):** Upload berkas PDF asli (maks. 5 MB) ke bucket privat `cvs`, pilih ulang dari pustaka CV, serta pratinjau & unduh aman via *Signed URL*.
* **Dasbor Funnel Konversi:** Ringkasan rasio konversi dari lamaran hingga penawaran kerja (*offering*) dan diterima.

### Portal Guru BK
* **Dasbor Monitoring & Grafik:** Statistik siswa binaan real-time dengan grafik interaktif (`recharts`) dan tombol **Export Rekap CSV**.
* **Direktori Data Siswa:** Pencarian nama/email, filter berdasarkan **Jurusan** dan **Tahap Karier Terjauh**, serta export CSV.
* **Detail Siswa & Catatan Bimbingan:** Melihat riwayat lamaran siswa dan mengirim catatan bimbingan yang langsung tampil di beranda siswa.
* **Progres & Statistik Penempatan:** Filter interaktif per tahapan lamaran, perbandingan penempatan per jurusan, serta export laporan penempatan sekolah (CSV).
* **Keamanan Row Level Security (RLS):** Siswa hanya dapat mengakses data miliknya sendiri; Guru BK hanya dapat memantau siswa pada sekolah yang sama.

---

## Tech Stack

* **Framework:** TanStack Start (React 19 + TanStack Router + Nitro SSR)
* **Backend & Database:** Supabase (PostgreSQL + Auth + Private Storage + RLS)
* **Styling & UI:** Tailwind CSS v4, Lucide React, Recharts, Sonner
* **Bahasa & Testing:** TypeScript 5.8, Vitest, ESLint, Prettier

---

## Struktur Direktori

```text
FlowJob/
├── public/                        # Aset statis, favicon.webp, og-image.webp, robots.txt, sitemap.xml
├── src/
│   ├── jobflow/
│   │   ├── api.ts                 # Layer API Supabase (Auth, CRUD, Storage, Notes)
│   │   ├── app.tsx                # Root aplikasi & code-splitting Portal Guru BK
│   │   ├── auth.tsx               # Halaman Masuk, Daftar, & Pemulihan Kata Sandi
│   │   ├── auth.server.ts         # Server Function health/backend status
│   │   ├── calendar.ts            # Generator Google Calendar, berkas .ics, & Export CSV
│   │   ├── data.ts                # Tipe data, kalkulasi statistik, filter, & formatter
│   │   ├── detail.tsx             # Detail lamaran, jadwal, & upload/pratinjau CV PDF asli
│   │   ├── form.tsx               # Formulir tambah/edit lamaran & catatan perusahaan
│   │   ├── guru.tsx               # Portal Guru BK (lazy-loaded)
│   │   ├── home.tsx               # Beranda siswa, checklist persisten, & catatan Guru BK
│   │   ├── insights.tsx           # Radar tenggat & dasbor funnel siswa
│   │   ├── kanban.tsx             # Papan Kanban drag-and-drop
│   │   ├── store.tsx              # State management tersinkron dengan Supabase & URL browser
│   │   ├── ui.tsx                 # Komponen UI inti
│   │   └── url.ts                 # Pemetaan URL asli (/beranda, /kanban, /lamaran/:id, /guru/*)
│   ├── lib/
│   │   ├── constants.ts           # Konfigurasi situs & SEO terpusat (SITE_CONFIG)
│   │   ├── supabase.ts            # Inisialisasi client Supabase
│   │   └── utils.ts               # Utility classnames
│   ├── routes/                    # File-based routing (__root.tsx, index.tsx, $.tsx)
│   ├── test/                      # Unit & integration tests (Vitest)
│   └── server.ts                  # Entry server Nitro + endpoint /api/health
├── supabase-schema.sql            # Skema lengkap database + trigger + RLS + bucket storage + kode akses SMKN 53
└── .env.example                   # Contoh variabel lingkungan
```

---

## Cara Setup & Menjalankan Lokal

### 1. Pasang Dependensi
```bash
npm install
```

### 2. Konfigurasi Environment (`.env`)
Salin `.env.example` menjadi `.env`, lalu isi kredensial Supabase proyekmu:
```env
VITE_SITE_URL=https://jobflow.id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

### 3. Inisialisasi Database Supabase
Buka **SQL Editor** di Supabase Dashboard, salin seluruh isi [`supabase-schema.sql`](supabase-schema.sql), lalu klik **Run**.

Untuk menjadikan salah satu akun terdaftar sebagai **Guru BK**:
```sql
UPDATE public.profiles
SET role = 'gurubk', nip = '19800512 200501 2 004'
WHERE email = 'guru@sekolah.sch.id';
```

### 4. Jalankan Aplikasi
```bash
npm run dev
```

---

## Perintah Tersedia

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan development server lokal |
| `npm run build` | Build produksi (Client, SSR, dan Nitro) |
| `npm run preview` | Pratinjau lokal hasil build produksi |
| `npm test` | Menjalankan seluruh pengujian Vitest |
| `npm run lint` | Pemeriksaan ESLint |
| `npm run format` | Format kode menggunakan Prettier |
