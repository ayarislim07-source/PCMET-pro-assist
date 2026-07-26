'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : error.message);
      setLoading(false);
      return;
    }
    router.push('/dashboard');
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Connexion</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Connectez-vous à votre espace PCMET.</p>
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30"><AlertCircle className="h-4 w-4" /> {error}</div>
      )}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input label="Email" type="email" placeholder="vous@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required icon={<Mail className="h-4 w-4" />} />
        <Input label="Mot de passe" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required icon={<Lock className="h-4 w-4" />} />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><input type="checkbox" className="rounded border-slate-300" /> Se souvenir de moi</label>
          <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">Mot de passe oublié ?</Link>
        </div>
        <Button type="submit" disabled={loading} className="w-full" size="lg">{loading ? 'Connexion...' : 'Se connecter'}</Button>
      </form>
      <div className="mt-6 flex items-center gap-3"><div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" /><span className="text-xs text-slate-400">ou</span><div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" /></div>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">Pas encore de compte ? <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">S&apos;inscrire</Link></p>
    </div>
  );
}
