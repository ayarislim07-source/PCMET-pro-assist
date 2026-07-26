'use client';

import { useEffect, useState } from 'react';
import { supabase, Notification, Profile } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { Bell, Send, Plus, X } from 'lucide-react';

export default function AdminNotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');

  const fetchData = async () => {
    const [{ data: notifData }, { data: studentsData }] = await Promise.all([
      supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('profiles').select('*').eq('role', 'student'),
    ]);
    setNotifs((notifData as Notification[]) || []);
    setStudents((studentsData as Profile[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const targets = studentId ? [studentId] : students.map(s => s.id);
    for (const uid of targets) { await supabase.from('notifications').insert({ user_id: uid, title, message, type, is_read: false }); }
    setShowForm(false); setTitle(''); setMessage(''); setStudentId(''); setType('info');
    fetchData();
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Envoyer des notifications aux étudiants</p></div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? <><X className="h-4 w-4" /> Annuler</> : <><Plus className="h-4 w-4" /> Envoyer</>}</Button>
      </div>
      {showForm && (
        <Card className="p-6 animate-slide-up">
          <form onSubmit={handleSend} className="space-y-4">
            <Select label="Destinataire" value={studentId} onChange={e => setStudentId(e.target.value)}><option value="">Tous les étudiants</option>{students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}</Select>
            <Input label="Titre" value={title} onChange={e => setTitle(e.target.value)} required />
            <Textarea label="Message" rows={3} value={message} onChange={e => setMessage(e.target.value)} required />
            <Select label="Type" value={type} onChange={e => setType(e.target.value)}><option value="info">Information</option><option value="success">Succès</option><option value="warning">Avertissement</option><option value="error">Erreur</option></Select>
            <Button type="submit"><Send className="h-4 w-4" /> Envoyer</Button>
          </form>
        </Card>
      )}
      <Card>
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700"><h2 className="font-bold text-slate-900 dark:text-white">Notifications récentes</h2></div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {notifs.map(n => (<div key={n.id} className="px-5 py-4"><p className="font-medium text-slate-900 dark:text-white">{n.title}</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{n.message}</p><p className="mt-1 text-xs text-slate-400">{formatDate(n.created_at)}</p></div>))}
        </div>
        {notifs.length === 0 && <div className="flex flex-col items-center p-12"><Bell className="h-10 w-10 text-slate-300" /><p className="mt-3 text-sm text-slate-500">Aucune notification.</p></div>}
      </Card>
    </div>
  );
}
