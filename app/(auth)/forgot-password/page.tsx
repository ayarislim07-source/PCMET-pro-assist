'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) { setError(error.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <Link href="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"><ArrowLeft className="h-4 w-4" /> Retour à la connexion</Link>
      {sent ? (
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30"><CheckCircle2 className="h-8 w-8 text-green-500" /></div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Email envoyé !</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Un lien de réinitialisation a été envoyé à {email}. Vérifiez votre boîte de réception.</p>
          <Link href="/login" className="mt-6 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">Retour à la connexion</Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mot de passe oublié</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Entrez votre email pour recevoir un lien de réinitialisation.</p>
          {error && <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30"><AlertCircle className="h-4 w-4" /> {error}</div>}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input label="Email" type="email" placeholder="vous@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required icon={<Mail className="h-4 w-4" />} />
            <Button type="submit" disabled={loading} className="w-full" size="lg">{loading ? 'Envoi...' : 'Envoyer le lien'}</Button>
          </form>
        </>
      )}
    </div>
  );
}
