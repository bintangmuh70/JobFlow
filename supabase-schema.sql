-- ==============================================================================
-- SKEMA DATABASE PRODUCTION JOBFLOW UNTUK SUPABASE (POSTGRESQL + AUTH + RLS)
-- Jalankan seluruh skrip ini sekali di menu SQL Editor Supabase Dashboard -> Run.
-- ==============================================================================

-- 0. Bersihkan tabel prototype lama (karena sebelumnya memakai ID TEXT & masih kosong)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.current_user_role();
DROP FUNCTION IF EXISTS public.current_user_school();
DROP FUNCTION IF EXISTS public.verify_registration_code(TEXT);
DROP TABLE IF EXISTS public.guidance_notes CASCADE;
DROP TABLE IF EXISTS public.interview_checklists CASCADE;
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.status_history CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.cvs CASCADE;
DROP TABLE IF EXISTS public.school_settings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. TABEL PROFIL PENGGUNA (Terhubung 1-to-1 ke auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'siswa' CHECK (role IN ('siswa', 'gurubk')),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  school TEXT NOT NULL DEFAULT 'SMK Negeri 53 Jakarta',
  major TEXT,
  student_status TEXT NOT NULL DEFAULT 'Kelas XII',
  nip TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1b. TABEL PENGATURAN KODE AKSES SEKOLAH (Eksklusif SMKN 53 Jakarta)
CREATE TABLE IF NOT EXISTS public.school_settings (
  school TEXT PRIMARY KEY,
  registration_code TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.school_settings (school, registration_code)
VALUES ('SMK Negeri 53 Jakarta', 'SMKN53-2026')
ON CONFLICT (school) DO NOTHING;

-- 2. TABEL PUSTAKA CV SISWA (Metadata file PDF di Supabase Storage bucket 'cvs')
CREATE TABLE public.cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size BIGINT NOT NULL CHECK (size > 0 AND size <= 5242880),
  storage_path TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABEL LAMARAN KERJA
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'LinkedIn',
  applied_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  salary BIGINT,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'applied'
    CHECK (status IN ('applied', 'screening', 'interview', 'offer', 'accepted', 'rejected')),
  cv_id UUID REFERENCES public.cvs(id) ON DELETE SET NULL,
  followed_up BOOLEAN NOT NULL DEFAULT FALSE,
  company_notes TEXT,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABEL RIWAYAT STATUS LAMARAN (Timeline Kanban)
CREATE TABLE public.status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  status TEXT NOT NULL
    CHECK (status IN ('applied', 'screening', 'interview', 'offer', 'accepted', 'rejected')),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABEL JADWAL SELEKSI (Tes, Wawancara, Tenggat)
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Tes', 'Wawancara', 'Tenggat')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  remind TEXT NOT NULL DEFAULT '1 hari sebelumnya'
    CHECK (remind IN ('1 jam sebelumnya', '1 hari sebelumnya', '2 hari sebelumnya')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABEL CHECKLIST PERSIAPAN WAWANCARA (Persisten per jadwal)
CREATE TABLE public.interview_checklists (
  schedule_id UUID PRIMARY KEY REFERENCES public.schedules(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  items BOOLEAN[] NOT NULL DEFAULT ARRAY[false, false, false, false, false],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TABEL CATATAN BIMBINGAN GURU BK -> SISWA
CREATE TABLE public.guidance_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guru_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guru_name TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX idx_profiles_role_school ON public.profiles(role, school);
CREATE INDEX idx_applications_student_id ON public.applications(student_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_status_history_app_id ON public.status_history(application_id);
CREATE INDEX idx_schedules_app_id ON public.schedules(application_id);
CREATE INDEX idx_schedules_at ON public.schedules(scheduled_at);
CREATE INDEX idx_cvs_student_id ON public.cvs(student_id);

-- ==============================================================================
-- TRIGGER AUTO-CREATE PROFILE SAAT USER DAFTAR LEWAT SUPABASE AUTH
-- Pendaftaran publik selalu diberi role 'siswa' demi keamanan.
-- Akun Guru BK dibuat/di-upgrade oleh admin melalui dashboard/service role.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name, email, school, major, student_status, phone)
  VALUES (
    NEW.id,
    'siswa',
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''), SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    'SMK Negeri 53 Jakarta',
    NULLIF(TRIM(NEW.raw_user_meta_data->>'major'), ''),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'student_status'), ''), 'Kelas XII'),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- HELPER FUNCTIONS UNTUK ROW LEVEL SECURITY (Anti Infinite Recursion)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_school()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school FROM public.profiles WHERE id = auth.uid();
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Aturan:
--   - Siswa hanya bisa baca/tulis data miliknya sendiri.
--   - Guru BK hanya bisa membaca profil & progres siswa di sekolah yang sama.
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guidance_notes ENABLE ROW LEVEL SECURITY;

-- Policies: profiles
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_select_gurubk_same_school"
  ON public.profiles FOR SELECT
  USING (
    public.current_user_role() = 'gurubk'
    AND role = 'siswa'
    AND LOWER(school) = LOWER(public.current_user_school())
  );

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = public.current_user_role());

-- Policies: cvs
CREATE POLICY "cvs_all_own"
  ON public.cvs FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Policies: applications
CREATE POLICY "applications_all_own"
  ON public.applications FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "applications_select_gurubk"
  ON public.applications FOR SELECT
  USING (
    public.current_user_role() = 'gurubk'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = applications.student_id
        AND p.role = 'siswa'
        AND LOWER(p.school) = LOWER(public.current_user_school())
    )
  );

-- Policies: status_history
CREATE POLICY "status_history_all_own"
  ON public.status_history FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = status_history.application_id AND a.student_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = status_history.application_id AND a.student_id = auth.uid()
    )
  );

CREATE POLICY "status_history_select_gurubk"
  ON public.status_history FOR SELECT
  USING (
    public.current_user_role() = 'gurubk'
    AND EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.profiles p ON p.id = a.student_id
      WHERE a.id = status_history.application_id
        AND p.role = 'siswa'
        AND LOWER(p.school) = LOWER(public.current_user_school())
    )
  );

-- Policies: schedules
CREATE POLICY "schedules_all_own"
  ON public.schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = schedules.application_id AND a.student_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = schedules.application_id AND a.student_id = auth.uid()
    )
  );

CREATE POLICY "schedules_select_gurubk"
  ON public.schedules FOR SELECT
  USING (
    public.current_user_role() = 'gurubk'
    AND EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.profiles p ON p.id = a.student_id
      WHERE a.id = schedules.application_id
        AND p.role = 'siswa'
        AND LOWER(p.school) = LOWER(public.current_user_school())
    )
  );

-- Policies: interview_checklists
CREATE POLICY "checklists_all_own"
  ON public.interview_checklists FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Policies: guidance_notes
CREATE POLICY "guidance_notes_select_student"
  ON public.guidance_notes FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "guidance_notes_all_gurubk"
  ON public.guidance_notes FOR ALL
  USING (
    public.current_user_role() = 'gurubk'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = guidance_notes.student_id
        AND p.role = 'siswa'
        AND LOWER(p.school) = LOWER(public.current_user_school())
    )
  )
  WITH CHECK (
    public.current_user_role() = 'gurubk'
    AND guru_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = guidance_notes.student_id
        AND p.role = 'siswa'
        AND LOWER(p.school) = LOWER(public.current_user_school())
    )
  );

-- ==============================================================================
-- SUPABASE STORAGE: BUCKET PRIVATE 'cvs' (PDF maks 5 MB)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('cvs', 'cvs', FALSE, 5242880, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
SET public = FALSE,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['application/pdf'];

DROP POLICY IF EXISTS "cvs_storage_select_own" ON storage.objects;
DROP POLICY IF EXISTS "cvs_storage_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "cvs_storage_delete_own" ON storage.objects;

CREATE POLICY "cvs_storage_select_own"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "cvs_storage_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "cvs_storage_delete_own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ==============================================================================
-- RLS & RPC KODE AKSES PENDAFTARAN SMKN 53 JAKARTA
-- ==============================================================================
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "school_settings_gurubk_select"
  ON public.school_settings FOR SELECT
  USING (
    public.current_user_role() = 'gurubk'
    AND LOWER(school) = LOWER(public.current_user_school())
  );

CREATE POLICY "school_settings_gurubk_update"
  ON public.school_settings FOR UPDATE
  USING (
    public.current_user_role() = 'gurubk'
    AND LOWER(school) = LOWER(public.current_user_school())
  )
  WITH CHECK (
    public.current_user_role() = 'gurubk'
    AND LOWER(school) = LOWER(public.current_user_school())
  );

CREATE OR REPLACE FUNCTION public.verify_registration_code(input_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.school_settings
    WHERE LOWER(school) = LOWER('SMK Negeri 53 Jakarta')
      AND UPPER(TRIM(registration_code)) = UPPER(TRIM(input_code))
  );
$$;

GRANT EXECUTE ON FUNCTION public.verify_registration_code(TEXT) TO anon, authenticated;
