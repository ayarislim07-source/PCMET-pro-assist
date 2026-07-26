'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Registration, Certificate } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatDate, statusLabels, statusColors } from '@/lib/utils';
import { BookOpen, Award, ArrowRight, Clock } from 'lucide-react';

export default function MyCoursesPage() {
  const { profile } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [{ data: regs }, { data: certs }] = await Promise.all([
        supabase.from('registrations').select('*, course:*').eq('user_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('certificates').select('*, course:*').eq('user_id', profile.id).order('created_at', { ascending: false }),
      ]);
      setRegistrations((regs as unknown as Registration[]) || []);
      setCertificates((certs as unknown as Certificate[]) || []);
      setLoading(false);
    })();
  }, [profile]);

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mes formations</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Suivez vos inscriptions et certificats.</p></div>
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Inscriptions</h2>
        {registrations.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {registrations.map((reg) => (
              <Card key={reg.id} hover className="p-5">
                <div className="flex items-center justify-between">
                  <Badge className={statusColors[reg.status]}>{statusLabels[reg.status]}</Badge>
                  {reg.course && <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatPrice(reg.course.price)}</span>}
                </div>
                <h3 className="mt-3 font-bold text-slate-900 dark:text-white">{reg.course?.title || 'Formation'}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Inscrit le {formatDate(reg.created_at)}</p>
                {reg.course && <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><Clock className="h-4 w-4" /> {reg.course.duration_hours}h{reg.course.schedule && <span>• {reg.course.schedule}</span>}</div>}
                <Link href={`/courses/${reg.course_id}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">Voir détails <ArrowRight className="h-4 w-4" /></Link>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center p-12 text-center"><BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600" /><p className="mt-3 text-slate-500 dark:text-slate-400">Aucune inscription pour le moment.</p><Link href="/trainings" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">Découvrir les formations <ArrowRight className="h-4 w-4" /></Link></Card>
        )}
      </div>
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Mes certificats</h2>
        {certificates.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <Card key={cert.id} hover className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"><Award className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1"><h3 className="truncate font-bold text-slate-900 dark:text-white">{cert.course_title || cert.course?.title}</h3><p className="text-xs text-slate-500 dark:text-slate-400">N° {cert.certificate_number}</p></div>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Délivré le {formatDate(cert.issued_at)}</p>
                <div className="mt-4 flex gap-2">
                  <Link href={`/certificates/verify?number=${cert.certificate_number}`} className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-blue-700">Vérifier</Link>
                  <Link href={`/certificates/${cert.id}`} className="flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"><Award className="h-4 w-4" /></Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center p-12 text-center"><Award className="h-12 w-12 text-slate-300 dark:text-slate-600" /><p className="mt-3 text-slate-500 dark:text-slate-400">Aucun certificat obtenu pour le moment.</p></Card>
        )}
      </div>
    </div>
  );
}
