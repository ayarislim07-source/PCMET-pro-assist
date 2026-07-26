'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase, Certificate } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { ShieldCheck, Search, Award, XCircle } from 'lucide-react';

function VerifyForm() {
  const params = useSearchParams();
  const [number, setNumber] = useState(params.get('number') || '');
  const [result, setResult] = useState<Certificate | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    const { data } = await supabase.from('certificates').select('*, course:*').eq('certificate_number', number).maybeSingle();
    setResult(data as Certificate | null);
    setLoading(false);
  };

  return (
    <div className="dark:bg-slate-950">
      <section className="bg-gradient-to-b from-sky-50 to-white py-16 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Vérification de certificat</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Entrez le numéro du certificat pour vérifier son authenticité.</p>
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-lg px-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input placeholder="CERT-XXXX-XXXX" value={number} onChange={e => setNumber(e.target.value)} required icon={<Search className="h-4 w-4" />} />
            <Button type="submit" disabled={loading}>{loading ? 'Recherche...' : 'Vérifier'}</Button>
          </form>
          {searched && !loading && (
            <div className="mt-8 animate-slide-up">
              {result ? (
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-br from-blue-600 to-sky-500 p-8 text-center text-white">
                    <Award className="mx-auto h-12 w-12" />
                    <h2 className="mt-3 text-xl font-bold">Certificat vérifié</h2>
                    <p className="mt-1 text-sm text-blue-100">Ce certificat est authentique</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-700"><span className="text-sm text-slate-500 dark:text-slate-400">Bénéficiaire</span><span className="font-semibold text-slate-900 dark:text-white">{result.user_name || '—'}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-700"><span className="text-sm text-slate-500 dark:text-slate-400">Formation</span><span className="font-semibold text-slate-900 dark:text-white">{result.course_title || result.course?.title || '—'}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-700"><span className="text-sm text-slate-500 dark:text-slate-400">Numéro</span><span className="font-mono font-semibold text-slate-900 dark:text-white">{result.certificate_number}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-slate-500 dark:text-slate-400">Date de délivrance</span><span className="font-semibold text-slate-900 dark:text-white">{formatDate(result.issued_at)}</span></div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="flex flex-col items-center p-12 text-center"><XCircle className="h-12 w-12 text-red-400" /><h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">Certificat introuvable</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Aucun certificat ne correspond à ce numéro.</p></Card>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>}>
      <VerifyForm />
    </Suspense>
  );
}
