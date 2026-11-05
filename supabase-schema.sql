-- ==============================================================================
-- SKEMA DATABASE JOBFLOW UNTUK SUPABASE (POSTGRESQL)
-- Salin seluruh isi skrip ini ke menu SQL Editor di Supabase Dashboard, lalu klik Run.
-- ==============================================================================

-- 1. TABEL PROFIL PENGGUNA (Siswa & Guru BK)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('siswa', 'gurubk')),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  school TEXT NOT NULL,
  major TEXT,
  nip TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL LAMARAN KERJA
CREATE TABLE IF NOT EXISTS public.applications (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  source TEXT DEFAULT 'LinkedIn',
  applied_date TIMESTAMPTZ NOT NULL,
  salary BIGINT,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'screening', 'interview', 'offer', 'accepted', 'rejected')),
  followed_up BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL JADWAL (Tes, Wawancara, Tenggat)
CREATE TABLE IF NOT EXISTS public.schedules (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Tes', 'Wawancara', 'Tenggat')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  remind TEXT DEFAULT '1 hari sebelumnya',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INSERT DATA SEED AWAL (Akun Demo)
INSERT INTO public.profiles (id, role, name, email, school, major, phone)
VALUES 
  ('rahima', 'siswa', 'Rahima', 'rahima@email.com', 'SMK Negeri 1 Jakarta', 'Rekayasa Perangkat Lunak', '0812-0000-0000'),
  ('dimas', 'siswa', 'Dimas Pratama', 'dimas@email.com', 'SMK Negeri 1 Jakarta', 'Teknik Komputer dan Jaringan', '0812-1111-2222'),
  ('siti', 'siswa', 'Siti Nurhaliza', 'siti@email.com', 'SMK Negeri 1 Jakarta', 'Akuntansi dan Keuangan', '0812-3333-4444')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, name, email, school, nip, phone)
VALUES 
  ('gurubk', 'gurubk', 'Ibu Sri Wahyuni, S.Pd.', 'gurubk@jobflow.id', 'SMK Negeri 1 Jakarta', '19800512 200501 2 004', '0813-1111-2222')
ON CONFLICT (id) DO NOTHING;

