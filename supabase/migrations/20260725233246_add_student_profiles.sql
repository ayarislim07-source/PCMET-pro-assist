/*
# PCMET Student Profiles for AI Recommendations
Stores student context (level, goals, country, education) so the AI
assistant can provide personalized course recommendations and learning paths.
*/

CREATE TABLE IF NOT EXISTS student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  current_language_level jsonb DEFAULT '{}'::jsonb,
  career_objective text DEFAULT '',
  target_country text DEFAULT '',
  previous_education text DEFAULT '',
  preferred_category text DEFAULT '',
  learning_path jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile_sp" ON student_profiles;
CREATE POLICY "select_own_profile_sp" ON student_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_profile_sp" ON student_profiles;
CREATE POLICY "insert_own_profile_sp" ON student_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_profile_sp" ON student_profiles;
CREATE POLICY "update_own_profile_sp" ON student_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_select_profiles_sp" ON student_profiles;
CREATE POLICY "admin_select_profiles_sp" ON student_profiles FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_student_profiles_user ON student_profiles(user_id);
