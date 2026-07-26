'use client';

import { useEffect, useState } from 'react';
import { supabase, Notification } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import { Bell, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const typeIcons: Record<string, typeof Bell> = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: AlertCircle };
const typeColors: Record<string, string> = {
  info: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400',
  success: 'text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400',
  warning: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400',
  error: 'text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400',
};

export default function NotificationsPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false })
      .then(({ data }) => { setNotifications((data as Notification[]) || []); setLoading(false); });
  }, [profile]);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    if (!profile) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', profile.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p></div>
        {unreadCount > 0 && <button onClick={markAllAsRead} className="text-sm font-semibold text-blue-600 dark:text-blue-400">Tout marquer comme lu</button>}
      </div>
      <div className="space-y-3">
        {notifications.length > 0 ? notifications.map((notif) => {
          const Icon = typeIcons[notif.type] || Bell;
          return (
            <Card key={notif.id} className={`p-4 ${!notif.is_read ? 'border-blue-200 dark:border-blue-800' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeColors[notif.type]}`}><Icon className="h-5 w-5" /></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between"><p className="font-semibold text-slate-900 dark:text-white">{notif.title}</p>{!notif.is_read && <span className="h-2 w-2 rounded-full bg-blue-600" />}</div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{notif.message}</p>
                  <p className="mt-2 text-xs text-slate-400">{formatDate(notif.created_at)}</p>
                </div>
                {!notif.is_read && <button onClick={() => markAsRead(notif.id)} className="text-xs font-medium text-blue-600 dark:text-blue-400">Marquer comme lu</button>}
              </div>
            </Card>
          );
        }) : (
          <Card className="flex flex-col items-center p-12 text-center"><Bell className="h-12 w-12 text-slate-300 dark:text-slate-600" /><p className="mt-3 text-slate-500 dark:text-slate-400">Aucune notification.</p></Card>
        )}
      </div>
    </div>
  );
}
