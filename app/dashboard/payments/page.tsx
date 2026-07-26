'use client';

import { useEffect, useState } from 'react';
import { supabase, Payment } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
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

export default function PaymentsPage() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase.from('payments').select('*').eq('user_id', profile.id).order('created_at', { ascending: false })
      .then(({ data }) => { setPayments((data as Payment[]) || []); setLoading(false); });
  }, [profile]);

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Paiements</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Historique de vos transactions.</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-sm text-slate-500 dark:text-slate-400">Total payé</p><p className="mt-1 text-2xl font-extrabold text-green-600 dark:text-green-400">{formatPrice(totalPaid)}</p></Card>
        <Card className="p-5"><p className="text-sm text-slate-500 dark:text-slate-400">Transactions</p><p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{payments.length}</p></Card>
        <Card className="p-5"><p className="text-sm text-slate-500 dark:text-slate-400">En attente</p><p className="mt-1 text-2xl font-extrabold text-amber-600 dark:text-amber-400">{payments.filter(p => p.status === 'pending').length}</p></Card>
      </div>
      <Card>
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700"><h2 className="font-bold text-slate-900 dark:text-white">Historique des paiements</h2></div>
        {payments.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"><CreditCard className="h-5 w-5" /></div>
                  <div><p className="font-medium text-slate-900 dark:text-white">{formatPrice(payment.amount)}</p><p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(payment.created_at)} • {payment.method}</p></div>
                </div>
                <Badge className={paymentColors[payment.status]}>{paymentStatusLabels[payment.status]}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center"><CreditCard className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" /><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Aucun paiement pour le moment.</p></div>
        )}
      </Card>
    </div>
  );
}
