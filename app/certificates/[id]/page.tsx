import { supabase, Certificate } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { Award, GraduationCap, ShieldCheck } from 'lucide-react';

export default async function CertificateDetailPage({ params }: { params: { id: string } }) {
  const { data } = await supabase.from('certificates').select('*, course:*').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  const cert = data as unknown as Certificate;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`/certificates/verify?number=${cert.certificate_number}`)}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 dark:bg-slate-900">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-800">
        <div className="bg-gradient-to-br from-blue-600 to-sky-500 p-10 text-center text-white">
          <GraduationCap className="mx-auto h-16 w-16" />
          <p className="mt-4 text-sm font-medium uppercase tracking-widest text-blue-100">PCMET Horizon Qualité</p>
          <h1 className="mt-2 text-3xl font-extrabold">Certificat de Réussite</h1>
        </div>
        <div className="p-10">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">Ce certificat est décerné à</p>
          <p className="mt-2 text-center text-2xl font-extrabold text-slate-900 dark:text-white">{cert.user_name || '—'}</p>
          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">pour avoir réussi la formation</p>
          <p className="mt-2 text-center text-xl font-bold text-blue-600 dark:text-blue-400">{cert.course_title || cert.course?.title || '—'}</p>
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-700">
            <div>
              <p className="text-xs text-slate-400">Date de délivrance</p>
              <p className="font-semibold text-slate-900 dark:text-white">{formatDate(cert.issued_at)}</p>
              <p className="mt-2 text-xs text-slate-400">Numéro</p>
              <p className="font-mono font-semibold text-slate-900 dark:text-white">{cert.certificate_number}</p>
            </div>
            <div className="text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-2 dark:border-slate-700"><img src={qrUrl} alt="QR Code" width={80} height={80} /></div>
              <p className="mt-1 text-xs text-slate-400">Scannez pour vérifier</p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400"><ShieldCheck className="h-4 w-4" /> Certificat authentique vérifiable</div>
        </div>
      </div>
    </div>
  );
}
