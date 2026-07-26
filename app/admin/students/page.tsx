'use client';

import { useEffect, useState } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { Search, Users } from 'lucide-react';

export default function AdminStudentsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setProfiles((data as Profile[]) || []);
      setFiltered((data as Profile[]) || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setFiltered(profiles.filter(p => p.full_name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase())));
  }, [search, profiles]);

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Étudiants</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{profiles.length} utilisateurs inscrits</p></div>
      <Input placeholder="Rechercher par nom ou email..." value={search} onChange={e => setSearch(e.target.value)} icon={<Search className="h-4 w-4" />} />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 dark:border-slate-700">
              <tr className="text-left text-xs font-semibold uppercase text-slate-400">
                <th className="px-5 py-3">Nom</th><th className="px-5 py-3">Email</th><th className="px-5 py-3 hidden sm:table-cell">Téléphone</th><th className="px-5 py-3">Rôle</th><th className="px-5 py-3 hidden sm:table-cell">Inscrit le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">{p.full_name.charAt(0).toUpperCase()}</div>
                      <span className="font-medium text-slate-900 dark:text-white">{p.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">{p.email}</td>
                  <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">{p.phone || '—'}</td>
                  <td className="px-5 py-3"><Badge className={p.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : p.role === 'teacher' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}>{p.role === 'admin' ? 'Admin' : p.role === 'teacher' ? 'Formateur' : 'Étudiant'}</Badge></td>
                  <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="flex flex-col items-center p-12"><Users className="h-10 w-10 text-slate-300" /><p className="mt-3 text-sm text-slate-500">Aucun utilisateur trouvé.</p></div>}
      </Card>
    </div>
  );
}
