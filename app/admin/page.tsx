'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { formatPrice, formatDate } from '@/lib/utils';
import { Users, BookOpen, Award, CreditCard, TrendingUp, ClipboardList, Brain, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, courses: 0, registrations: 0, certificates: 0, revenue: 0, pendingQuestions: 0 });
  const [recentRegs, setRecentRegs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [students, courses, registrations, certificates, payments, questions, recent] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('registrations').select('*', { count: 'exact', head: true }),
        supabase.from('certificates').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('amount').eq('status', 'paid'),
        supabase.from('unanswered_questions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('registrations').select('*, course:*').order('created_at', { ascending: false }).limit(5),
      ]);
      const revenue = (payments.data || []).reduce((sum: number, p: any) => sum + p.amount, 0);
      setStats({ students: students.count || 0, courses: courses.count || 0, registrations: registrations.count || 0, certificates: certificates.count || 0, revenue, pendingQuestions: questions.count || 0 });
      setRecentRegs(recent.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;

  const cards = [
    { icon: Users, label: 'Étudiants', value: stats.students, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { icon: BookOpen, label: 'Formations', value: stats.courses, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
    { icon: ClipboardList, label: 'Inscriptions', value: stats.registrations, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { icon: Award, label: 'Certificats', value: stats.certificates, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
    { icon: DollarSign, label: 'Revenus', value: formatPrice(stats.revenue), color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
    { icon: Brain, label: 'Questions en attente', value: stats.pendingQuestions, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tableau de bord</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Vue d&apos;ensemble de la plateforme.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-2xl font-extrabold text-slate-900 dark:text-white">{card.value}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{card.label}</p></div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}><Icon className={`h-6 w-6 ${card.color}`} /></div>
              </div>
            </Card>
          );
        })}
      </div>
      <Card>
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700"><h2 className="font-bold text-slate-900 dark:text-white">Inscriptions récentes</h2></div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {recentRegs.length > 0 ? recentRegs.map((reg: any) => (
            <div key={reg.id} className="flex items-center justify-between px-5 py-4">
              <div><p className="font-medium text-slate-900 dark:text-white">{reg.course?.title || 'Formation'}</p><p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(reg.created_at)}</p></div>
              <span className="text-sm text-slate-500 dark:text-slate-400 capitalize">{reg.status}</span>
            </div>
          )) : <p className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">Aucune inscription récente.</p>}
        </div>
      </Card>
    </div>
  );
}
