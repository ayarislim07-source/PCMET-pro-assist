'use client';

import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function VerifyEmailPage() {
  return (
    <div className="animate-fade-in flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30"><Mail className="h-8 w-8 text-green-500" /></div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Vérifiez votre email</h1>
      <p className="mt-3 max-w-sm text-sm text-slate-600 dark:text-slate-400">Nous avons envoyé un email de confirmation. Cliquez sur le lien dans l&apos;email pour activer votre compte.</p>
      <div className="mt-6 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-400"><CheckCircle2 className="h-4 w-4" /> L&apos;email de confirmation a été envoyé.</div>
      <div className="mt-8"><Link href="/login"><Button variant="outline" size="lg"><ArrowLeft className="h-4 w-4" /> Aller à la connexion</Button></Link></div>
      <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">Vous n&apos;avez pas reçu d&apos;email ? Vérifiez vos spams ou <Link href="/signup" className="font-semibold text-blue-600 dark:text-blue-400">réessayez</Link>.</p>
    </div>
  );
}
