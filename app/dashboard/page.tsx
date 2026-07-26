'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Registration, Certificate, Notification } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatDate, statusLabels, statusColors } from '@/lib/utils';
import { BookOpen, Award, Clock, TrendingUp, ArrowRight, Bell, Calendar, CreditCard, CheckCircle2, Compass } from 'lucide-react';

export default function DashboardHome() {
  const { profile } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [{ data: regs }, { data: certs }, { data: notifs }] = await Promise.all([
        supabase.from('registrations').select('*, course:*').eq('user_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('certificates').select('*, course:*').eq('user_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(5),
      ]);
      setRegistrations((regs as unknown as Registration[]) || []);
      setCertificates((certs as unknown as Certificate[]) || []);
      setNotifications((notifs as Notification[]) || []);
      setLoading(false);
    })();
  }, [profile]);

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;

  const activeCourses = registrations.filter(r => r.status === 'confirmed' || r.status === 'pending');
  const completedCourses = registrations.filter(r => r.status === 'completed');
  const stats = [
    { icon: BookOpen, label: 'Formations actives', value: activeCourses.length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { icon: Award, label: 'Certificats obtenus', value: certificates.length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { icon: CheckCircle2, label: 'Formations terminées', value: completedCourses.length, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
    { icon: TrendingUp, label: 'Progression moyenne', value: '75%', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bonjour, {profile?.full_name?.split(' ')[0] || 'Étudiant'} !</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Voici un aperçu de votre parcours de formation.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stat.label}</p></div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}><Icon className={`h-6 w-6 ${stat.color}`} /></div>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
            <h2 className="font-bold text-slate-900 dark:text-white">Mes formations</h2>
            <Link href="/dashboard/courses" className="text-sm font-semibold text-blue-600 dark:text-blue-400">Voir tout</Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {registrations.length > 0 ? registrations.slice(0, 4).map((reg) => (
              <div key={reg.id} className="flex items-center justify-between px-5 py-4">
                <div className="min-w-0 flex-1"><p className="truncate font-medium text-slate-900 dark:text-white">{reg.course?.title || 'Formation'}</p><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Inscrit le {formatDate(reg.created_at)}</p></div>
                <Badge className={statusColors[reg.status]}>{statusLabels[reg.status]}</Badge>
              </div>
            )) : (
              <div className="px-5 py-12 text-center"><BookOpen className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" /><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Aucune formation pour le moment.</p><Link href="/trainings" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">Découvrir les formations <ArrowRight className="h-4 w-4" /></Link></div>
            )}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700"><h2 className="font-bold text-slate-900 dark:text-white">Notifications</h2><Bell className="h-4 w-4 text-slate-400" /></div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {notifications.length > 0 ? notifications.map((notif) => (
              <div key={notif.id} className={`px-5 py-3 ${!notif.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}><p className="text-sm font-medium text-slate-900 dark:text-white">{notif.title}</p><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{notif.message}</p></div>
            )) : (
              <div className="px-5 py-12 text-center"><Bell className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" /><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Aucune notification.</p></div>
            )}
          </div>
        </Card>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: BookOpen, label: 'Explorer les formations', href: '/trainings', color: 'from-blue-500 to-sky-500' },
          { icon: Compass, label: 'Outils IA', href: '/dashboard/ai-tools', color: 'from-purple-500 to-pink-500' },
          { icon: Calendar, label: 'Prendre rendez-vous', href: '/dashboard/appointments', color: 'from-green-500 to-teal-500' },
          { icon: CreditCard, label: 'Mes paiements', href: '/dashboard/payments', color: 'from-amber-500 to-orange-500' },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${action.color} text-white`}><Icon className="h-5 w-5" /></div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{action.label}</span>
              <ArrowRight className="ml-auto h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
