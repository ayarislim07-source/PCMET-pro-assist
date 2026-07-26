import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export type UserRole = 'admin' | 'teacher' | 'student';

export type Profile = {
  id: string; full_name: string; email: string; phone: string;
  avatar_url: string; bio: string; role: UserRole; created_at: string;
};

export type CourseCategory = 'langues' | 'premiers_secours' | 'informatique' | 'formation_continue';

export type Course = {
  id: string; title: string; description: string; category: CourseCategory;
  level: string; teacher_id: string | null; teacher_name: string;
  duration_hours: number; price: number; capacity: number; enrolled: number;
  schedule: string; image_url: string;
  syllabus: { title: string; topics: string[] }[];
  is_published: boolean; created_at: string;
};

export type RegistrationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';

export type Registration = {
  id: string; user_id: string; course_id: string; status: RegistrationStatus;
  documents: string[]; notes: string; receipt_number: string;
  created_at: string; course?: Course;
};

export type Certificate = {
  id: string; user_id: string; course_id: string; user_name: string;
  course_title: string; certificate_number: string; issued_at: string;
  created_at: string; course?: Course;
};

export type KnowledgeBase = {
  id: string; question: string; answer: string; category: string;
  language: 'fr' | 'ar' | 'en'; keywords: string; is_approved: boolean;
  match_count?: number; embedding?: number[] | null; updated_at?: string; created_at: string;
};

export type UnansweredQuestion = {
  id: string; user_id: string | null; question: string; language: string;
  answer: string; status: 'pending' | 'answered' | 'ignored';
  created_at: string; answered_at: string | null;
};

export type LevelTest = {
  id: string; title: string; category: string; language: string;
  description: string; questions: { question: string; options: string[]; correct: number }[];
  created_at: string;
};

export type TestResult = {
  id: string; user_id: string; test_id: string; score: number; total: number;
  recommended_level: string; answers: number[]; created_at: string;
};

export type CVTemplate = 'europass' | 'modern' | 'ats';

export type CVData = {
  fullName?: string; email?: string; phone?: string; address?: string; summary?: string;
  experience?: { company: string; position: string; startDate: string; endDate: string; description: string }[];
  education?: { school: string; degree: string; startDate: string; endDate: string; description: string }[];
  skills?: string[];
  languages?: { language: string; level: string }[];
  certificates?: { title: string; issuer: string; date: string }[];
};

export type CV = {
  id: string; user_id: string; title: string; data: CVData;
  template: CVTemplate; created_at: string; updated_at: string;
};

export type Appointment = {
  id: string; user_id: string; teacher_id: string | null; teacher_name: string;
  topic: string; scheduled_at: string; duration_min: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string; created_at: string;
};

export type Payment = {
  id: string; user_id: string; course_id: string | null; amount: number;
  status: 'pending' | 'paid' | 'refunded' | 'failed';
  method: string; reference: string; created_at: string;
};

export type Notification = {
  id: string; user_id: string; title: string; message: string;
  type: 'info' | 'success' | 'warning' | 'error'; is_read: boolean;
  link: string; created_at: string;
};
