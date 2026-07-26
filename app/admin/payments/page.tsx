'use client';

import { useEffect, useState } from 'react';
import { supabase, Payment } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatDate, paymentStatusLabels } from '@/lib/utils';
import { CreditCard } from 'lucide-react';

const paymentColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  refunded: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('payments').select('*, course:*').order('created_at', { ascending: false }).then(({ data }) => {
      setPayments((data as unknown as Payment[]) || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Paiements</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Revenus totaux : {formatPrice(totalRevenue)}</p></div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 dark:border-slate-700">
              <tr className="text-left text-xs font-semibold uppercase text-slate-400">
                <th className="px-5 py-3">Montant</th><th className="px-5 py-3 hidden sm:table-cell">Méthode</th><th className="px-5 py-3 hidden sm:table-cell">Date</th><th className="px-5 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{formatPrice(p.amount)}</td>
                  <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">{p.method}</td>
                  <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">{formatDate(p.created_at)}</td>
                  <td className="px-5 py-3"><Badge className={paymentColors[p.status]}>{paymentStatusLabels[p.status]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payments.length === 0 && <div className="flex flex-col items-center p-12"><CreditCard className="h-10 w-10 text-slate-300" /><p className="mt-3 text-sm text-slate-500">Aucun paiement.</p></div>}
      </Card>
    </div>
  );
}
