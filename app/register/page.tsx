'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase, Course } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { formatPrice, generateReceiptNumber } from '@/lib/utils';
import { Upload, CheckCircle2, FileText, ArrowRight, User, Mail, Phone } from 'lucide-react';

function RegisterForm() {
  const params = useSearchParams();
  const courseId = params.get('course');
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [motivation, setMotivation] = useState('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('courses').select('*').eq('is_published', true).then(({ data }) => {
      setCourses((data as Course[]) || []);
      if (courseId) setSelectedCourse(courseId);
      setLoading(false);
    });
  }, [courseId]);

  useEffect(() => {
    if (profile) { setFullName(profile.full_name); setEmail(profile.email); setPhone(profile.phone); }
  }, [profile]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).map(f => f.name);
    setDocuments(prev => [...prev, ...files]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const receipt = generateReceiptNumber();
    setReceiptNumber(receipt);
    await supabase.from('registrations').insert({ user_id: profile.id, course_id: selectedCourse, status: 'pending', documents, notes: motivation, receipt_number: receipt });
    setSubmitted(true);
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-12 animate-fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30"><CheckCircle2 className="h-10 w-10 text-green-500" /></div>
        <h1 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">Inscription envoyée !</h1>
        <p className="mt-2 text-center text-slate-600 dark:text-slate-400">Votre demande a été enregistrée. Vous recevrez une confirmation par email.</p>
        <Card className="mt-8 w-full p-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-700"><FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" /><div><p className="text-sm text-slate-500 dark:text-slate-400">Numéro de reçu</p><p className="font-mono font-bold text-slate-900 dark:text-white">{receiptNumber}</p></div></div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Conservez ce numéro pour suivre votre candidature dans votre espace étudiant.</p>
          <Button className="mt-6 w-full" onClick={() => window.location.href = '/dashboard'}>Suivre ma candidature <ArrowRight className="h-4 w-4" /></Button>
        </Card>
      </div>
    );
  }

  const selectedCourseData = courses.find(c => c.id === selectedCourse);

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inscription en ligne</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Remplissez le formulaire pour vous inscrire à une formation.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <Card className="p-6">
          <h2 className="mb-4 font-bold text-slate-900 dark:text-white">Formation souhaitée</h2>
          <Select label="Choisir une formation" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required>
            <option value="">Sélectionner...</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title} — {formatPrice(c.price)}</option>)}
          </Select>
          {selectedCourseData && (
            <div className="mt-4 rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30">
              <p className="font-semibold text-slate-900 dark:text-white">{selectedCourseData.title}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{selectedCourseData.description}</p>
              <div className="mt-2 flex gap-4 text-xs text-slate-500 dark:text-slate-400"><span>{selectedCourseData.duration_hours}h</span><span>{formatPrice(selectedCourseData.price)}</span>{selectedCourseData.schedule && <span>{selectedCourseData.schedule}</span>}</div>
            </div>
          )}
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 font-bold text-slate-900 dark:text-white">Informations personnelles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nom complet" value={fullName} onChange={e => setFullName(e.target.value)} required icon={<User className="h-4 w-4" />} />
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required icon={<Mail className="h-4 w-4" />} />
            <Input label="Téléphone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} icon={<Phone className="h-4 w-4" />} />
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 font-bold text-slate-900 dark:text-white">Lettre de motivation</h2>
          <Textarea label="Pourquoi souhaitez-vous suivre cette formation ?" rows={4} value={motivation} onChange={e => setMotivation(e.target.value)} />
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 font-bold text-slate-900 dark:text-white">Documents requis</h2>
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Téléchargez votre pièce d&apos;identité et justificatif de domicile.</p>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-8 text-center transition-all hover:border-blue-300 dark:border-slate-700">
            <Upload className="h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Cliquez pour téléverser vos documents</p>
            <input type="file" multiple className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.png" />
          </label>
          {documents.length > 0 && (
            <div className="mt-3 space-y-2">
              {documents.map((doc, i) => (<div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-700"><FileText className="h-4 w-4 text-blue-600" /> {doc}</div>))}
            </div>
          )}
        </Card>
        <Button type="submit" size="lg" className="w-full">Soumettre l&apos;inscription</Button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
