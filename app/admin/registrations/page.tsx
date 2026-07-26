'use client';

import { useEffect, useState } from 'react';
import { supabase, Registration } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate, statusLabels, statusColors } from '@/lib/utils';
import { ClipboardList } from 'lucide-react';

export default function AdminRegistrationsPage() {
  const [regs, setRegs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data } = await supabase.from('registrations').select('*, course:*').order('created_at', { ascending: false });
    setRegs((data as unknown as Registration[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: Registration['status']) => {
    await supabase.from('registrations').update({ status }).eq('id', id);
    setRegs(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inscriptions</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{regs.length} inscriptions</p></div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 dark:border-slate-700">
              <tr className="text-left text-xs font-semibold uppercase text-slate-400">
                <th className="px-5 py-3">Formation</th><th className="px-5 py-3 hidden sm:table-cell">Date</th><th className="px-5 py-3">Statut</th><th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {regs.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-5 py-3"><p className="font-medium text-slate-900 dark:text-white">{r.course?.title || '—'}</p>{r.receipt_number && <p className="text-xs text-slate-400">{r.receipt_number}</p>}</td>
                  <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">{formatDate(r.created_at)}</td>
                  <td className="px-5 py-3"><Badge className={statusColors[r.status]}>{statusLabels[r.status]}</Badge></td>
                  <td className="px-5 py-3">
                    <select value={r.status} onChange={e => updateStatus(r.id, e.target.value as Registration['status'])} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
                      <option value="pending">En attente</option><option value="confirmed">Confirmée</option><option value="completed">Terminée</option><option value="rejected">Rejetée</option><option value="cancelled">Annulée</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {regs.length === 0 && <div className="flex flex-col items-center p-12"><ClipboardList className="h-10 w-10 text-slate-300" /><p className="mt-3 text-sm text-slate-500">Aucune inscription.</p></div>}
      </Card>
    </div>
  );
}
