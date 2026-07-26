/*
# PCMET Votre Guide — Add missing columns to existing tables

The initial schema migration created core tables but was missing some columns
needed for the full platform (teacher_id, teacher_name, enrolled, schedule on courses;
documents, receipt_number on registrations; user_name, course_title on certificates;
language on level_tests; recommended_level on test_results).

This migration adds those columns safely using DO $$ blocks for idempotency.
*/

-- COURSES: add teacher_id, teacher_name, enrolled, schedule
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'teacher_id') THEN
    ALTER TABLE courses ADD COLUMN teacher_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'teacher_name') THEN
    ALTER TABLE courses ADD COLUMN teacher_name text DEFAULT '';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'enrolled') THEN
    ALTER TABLE courses ADD COLUMN enrolled int DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'schedule') THEN
    ALTER TABLE courses ADD COLUMN schedule text DEFAULT '';
  END IF;
END $$;

-- REGISTRATIONS: add documents, receipt_number
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'documents') THEN
    ALTER TABLE registrations ADD COLUMN documents jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'receipt_number') THEN
    ALTER TABLE registrations ADD COLUMN receipt_number text DEFAULT '';
  END IF;
END $$;

-- CERTIFICATES: add user_name, course_title
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'user_name') THEN
    ALTER TABLE certificates ADD COLUMN user_name text DEFAULT '';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'course_title') THEN
    ALTER TABLE certificates ADD COLUMN course_title text DEFAULT '';
  END IF;
END $$;

-- LEVEL_TESTS: add language column (old schema used 'category')
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'level_tests' AND column_name = 'language') THEN
    ALTER TABLE level_tests ADD COLUMN language text CHECK (language IN ('allemand','francais','anglais','italien'));
  END IF;
END $$;

-- TEST_RESULTS: add recommended_level
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_results' AND column_name = 'recommended_level') THEN
    ALTER TABLE test_results ADD COLUMN recommended_level text DEFAULT '';
  END IF;
END $$;

-- PROFILES: add email, bio
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE profiles ADD COLUMN email text DEFAULT '';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
    ALTER TABLE profiles ADD COLUMN bio text DEFAULT '';
  END IF;
END $$;

-- Create new tables that don't exist yet
CREATE TABLE IF NOT EXISTS knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  language text DEFAULT 'fr' CHECK (language IN ('fr','ar','en')),
  keywords text DEFAULT '',
  is_approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS unanswered_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  question text NOT NULL,
  language text DEFAULT 'fr',
  answer text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending','answered','ignored')),
  created_at timestamptz DEFAULT now(),
  answered_at timestamptz
);
ALTER TABLE unanswered_questions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  teacher_name text DEFAULT '',
  topic text DEFAULT '',
  scheduled_at timestamptz NOT NULL,
  duration_min int DEFAULT 30,
  status text DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending','paid','refunded','failed')),
  method text DEFAULT 'card',
  reference text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text DEFAULT '',
  type text DEFAULT 'info' CHECK (type IN ('info','success','warning','error')),
  is_read boolean DEFAULT false,
  link text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============ POLICIES ============

-- PROFILES
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "admin_select_all_profiles" ON profiles;
CREATE POLICY "admin_select_all_profiles" ON profiles FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- COURSES
DROP POLICY IF EXISTS "anon_select_courses" ON courses;
CREATE POLICY "anon_select_courses" ON courses FOR SELECT TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "admin_select_all_courses" ON courses;
CREATE POLICY "admin_select_all_courses" ON courses FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "teacher_select_courses" ON courses;
CREATE POLICY "teacher_select_courses" ON courses FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'teacher'));
DROP POLICY IF EXISTS "admin_insert_courses" ON courses;
CREATE POLICY "admin_insert_courses" ON courses FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "admin_update_courses" ON courses;
CREATE POLICY "admin_update_courses" ON courses FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "teacher_update_courses" ON courses;
CREATE POLICY "teacher_update_courses" ON courses FOR UPDATE TO authenticated USING (teacher_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')) WITH CHECK (teacher_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "admin_delete_courses" ON courses;
CREATE POLICY "admin_delete_courses" ON courses FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- REGISTRATIONS
DROP POLICY IF EXISTS "select_own_registrations" ON registrations;
CREATE POLICY "select_own_registrations" ON registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_select_registrations" ON registrations;
CREATE POLICY "admin_select_registrations" ON registrations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "insert_own_registrations" ON registrations;
CREATE POLICY "insert_own_registrations" ON registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_registrations" ON registrations;
CREATE POLICY "update_own_registrations" ON registrations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_update_registrations" ON registrations;
CREATE POLICY "admin_update_registrations" ON registrations FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "delete_own_registrations" ON registrations;
CREATE POLICY "delete_own_registrations" ON registrations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CERTIFICATES
DROP POLICY IF EXISTS "select_own_certificates" ON certificates;
CREATE POLICY "select_own_certificates" ON certificates FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_select_certificates" ON certificates;
CREATE POLICY "admin_select_certificates" ON certificates FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "admin_insert_certificates" ON certificates;
CREATE POLICY "admin_insert_certificates" ON certificates FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "admin_update_certificates" ON certificates;
CREATE POLICY "admin_update_certificates" ON certificates FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "admin_delete_certificates" ON certificates;
CREATE POLICY "admin_delete_certificates" ON certificates FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "public_verify_certificates" ON certificates;
CREATE POLICY "public_verify_certificates" ON certificates FOR SELECT TO anon, authenticated USING (true);

-- KNOWLEDGE BASE
DROP POLICY IF EXISTS "anon_select_kb" ON knowledge_base;
CREATE POLICY "anon_select_kb" ON knowledge_base FOR SELECT TO anon, authenticated USING (is_approved = true);
DROP POLICY IF EXISTS "admin_all_kb" ON knowledge_base;
CREATE POLICY "admin_all_kb" ON knowledge_base FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "admin_insert_kb" ON knowledge_base;
CREATE POLICY "admin_insert_kb" ON knowledge_base FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "admin_update_kb" ON knowledge_base;
CREATE POLICY "admin_update_kb" ON knowledge_base FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "admin_delete_kb" ON knowledge_base;
CREATE POLICY "admin_delete_kb" ON knowledge_base FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- UNANSWERED QUESTIONS
DROP POLICY IF EXISTS "select_own_unanswered" ON unanswered_questions;
CREATE POLICY "select_own_unanswered" ON unanswered_questions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_select_unanswered" ON unanswered_questions;
CREATE POLICY "admin_select_unanswered" ON unanswered_questions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "insert_own_unanswered" ON unanswered_questions;
CREATE POLICY "insert_own_unanswered" ON unanswered_questions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "anon_insert_unanswered" ON unanswered_questions;
CREATE POLICY "anon_insert_unanswered" ON unanswered_questions FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_unanswered" ON unanswered_questions;
CREATE POLICY "admin_update_unanswered" ON unanswered_questions FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- LEVEL TESTS
DROP POLICY IF EXISTS "anon_select_tests" ON level_tests;
CREATE POLICY "anon_select_tests" ON level_tests FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_tests" ON level_tests;
CREATE POLICY "admin_insert_tests" ON level_tests FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "admin_update_tests" ON level_tests;
CREATE POLICY "admin_update_tests" ON level_tests FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "admin_delete_tests" ON level_tests;
CREATE POLICY "admin_delete_tests" ON level_tests FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- TEST RESULTS
DROP POLICY IF EXISTS "select_own_results" ON test_results;
CREATE POLICY "select_own_results" ON test_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_select_results" ON test_results;
CREATE POLICY "admin_select_results" ON test_results FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "insert_own_results" ON test_results;
CREATE POLICY "insert_own_results" ON test_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_results" ON test_results;
CREATE POLICY "delete_own_results" ON test_results FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CVS
DROP POLICY IF EXISTS "select_own_cvs" ON cvs;
CREATE POLICY "select_own_cvs" ON cvs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_cvs" ON cvs;
CREATE POLICY "insert_own_cvs" ON cvs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_cvs" ON cvs;
CREATE POLICY "update_own_cvs" ON cvs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_cvs" ON cvs;
CREATE POLICY "delete_own_cvs" ON cvs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- APPOINTMENTS
DROP POLICY IF EXISTS "select_own_appointments" ON appointments;
CREATE POLICY "select_own_appointments" ON appointments FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = teacher_id);
DROP POLICY IF EXISTS "admin_select_appointments" ON appointments;
CREATE POLICY "admin_select_appointments" ON appointments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "teacher_select_appointments" ON appointments;
CREATE POLICY "teacher_select_appointments" ON appointments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'teacher'));
DROP POLICY IF EXISTS "insert_own_appointments" ON appointments;
CREATE POLICY "insert_own_appointments" ON appointments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_appointments" ON appointments;
CREATE POLICY "update_own_appointments" ON appointments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_update_appointments" ON appointments;
CREATE POLICY "admin_update_appointments" ON appointments FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "teacher_update_appointments" ON appointments;
CREATE POLICY "teacher_update_appointments" ON appointments FOR UPDATE TO authenticated USING (teacher_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')) WITH CHECK (teacher_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "delete_own_appointments" ON appointments;
CREATE POLICY "delete_own_appointments" ON appointments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PAYMENTS
DROP POLICY IF EXISTS "select_own_payments" ON payments;
CREATE POLICY "select_own_payments" ON payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_select_payments" ON payments;
CREATE POLICY "admin_select_payments" ON payments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "admin_insert_payments" ON payments;
CREATE POLICY "admin_insert_payments" ON payments FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin') OR auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_update_payments" ON payments;
CREATE POLICY "admin_update_payments" ON payments FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- NOTIFICATIONS
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_insert_notifications" ON notifications;
CREATE POLICY "admin_insert_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_course ON registrations(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_cvs_user ON cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
