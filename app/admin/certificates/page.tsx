'use client';

import { useEffect, useState } from 'react';
import { supabase, Certificate, Course, Profile } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { formatDate, generateCertificateNumber } from '@/lib/utils';
import { Award, Plus, X } from 'lucide-react';

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [{ data: certData }, { data: studentsData }, { data: coursesData }] = await Promise.all([
      supabase.from('certificates').select('*, course:*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('role', 'student'),
      supabase.from('courses').select('*'),
    ]);
    setCerts((certData as unknown as Certificate[]) || []);
    setStudents((studentsData as Profile[]) || []);
    setCourses((coursesData as Course[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === studentId);
    const course = courses.find(c => c.id === courseId);
    const certNum = generateCertificateNumber();
    await supabase.from('certificates').insert({ user_id: studentId, course_id: courseId, user_name: student?.full_name || '', course_title: course?.title || '', certificate_number: certNum });
    setShowForm(false); setStudentId(''); setCourseId('');
    fetchData();
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Certificats</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{certs.length} certificats délivrés</p></div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? <><X className="h-4 w-4" /> Annuler</> : <><Plus className="h-4 w-4" /> Délivrer</>}</Button>
      </div>
      {showForm && (
        <Card className="p-6 animate-slide-up">
          <form onSubmit={handleCreate} className="space-y-4">
            <Select label="Étudiant" value={studentId} onChange={e => setStudentId(e.target.value)} required><option value="">Sélectionner...</option>{students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}</Select>
            <Select label="Formation" value={courseId} onChange={e => setCourseId(e.target.value)} required><option value="">Sélectionner...</option>{courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</Select>
            <Button type="submit">Délivrer le certificat</Button>
          </form>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certs.map(c => (
          <Card key={c.id} className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"><Award className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1"><h3 className="truncate font-bold text-slate-900 dark:text-white">{c.user_name}</h3><p className="truncate text-xs text-slate-500 dark:text-slate-400">{c.course_title}</p></div>
            </div>
            <p className="mt-3 font-mono text-xs text-slate-400">{c.certificate_number}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Délivré le {formatDate(c.issued_at)}</p>
          </Card>
        ))}
      </div>
      {certs.length === 0 && <Card className="flex flex-col items-center p-12"><Award className="h-10 w-10 text-slate-300" /><p className="mt-3 text-sm text-slate-500">Aucun certificat délivré.</p></Card>}
    </div>
  );
}
