'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('student');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, email } } });
    if (error) {
      setError(error.message === 'User already registered' ? 'Un compte existe déjà avec cet email.' : error.message);
      setLoading(false);
      return;
    }
    if (data.user) { await supabase.from('profiles').update({ phone, role }).eq('id', data.user.id); }
    router.push('/verify-email');
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Créer un compte</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Rejoignez PCMET Votre Guide et démarrez votre parcours.</p>
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30"><AlertCircle className="h-4 w-4" /> {error}</div>
      )}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input label="Nom complet" placeholder="Jean Dupont" value={fullName} onChange={(e) => setFullName(e.target.value)} required icon={<User className="h-4 w-4" />} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Email" type="email" placeholder="vous@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required icon={<Mail className="h-4 w-4" />} />
          <Input label="Téléphone" type="tel" placeholder="+33 6 12 34 56 78" value={phone} onChange={(e) => setPhone(e.target.value)} icon={<Phone className="h-4 w-4" />} />
        </div>
        <Select label="Je suis" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Étudiant</option>
          <option value="teacher">Formateur</option>
        </Select>
        <Input label="Mot de passe" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required icon={<Lock className="h-4 w-4" />} />
        <p className="text-xs text-slate-500 dark:text-slate-400">Le mot de passe doit contenir au moins 6 caractères.</p>
        <Button type="submit" disabled={loading} className="w-full" size="lg">{loading ? 'Inscription...' : 'S\'inscrire'}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">Déjà un compte ? <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">Se connecter</Link></p>
    </div>
  );
}
