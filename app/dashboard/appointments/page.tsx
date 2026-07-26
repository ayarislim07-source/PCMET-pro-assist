'use client';

import { useEffect, useState } from 'react';
import { supabase, Appointment, Profile } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { formatDateTime, appointmentStatusLabels, statusColors } from '@/lib/utils';
import { Calendar, Plus, X } from 'lucide-react';

export default function AppointmentsPage() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [teacherId, setTeacherId] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [{ data: appts }, { data: teachersData }] = await Promise.all([
        supabase.from('appointments').select('*').eq('user_id', profile.id).order('scheduled_at', { ascending: true }),
        supabase.from('profiles').select('*').eq('role', 'teacher'),
      ]);
      setAppointments((appts as Appointment[]) || []);
      setTeachers((teachersData as Profile[]) || []);
      setLoading(false);
    })();
  }, [profile]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const teacher = teachers.find(t => t.id === teacherId);
    await supabase.from('appointments').insert({ user_id: profile.id, teacher_id: teacherId || null, teacher_name: teacher?.full_name || '', topic, scheduled_at: new Date(`${date}T${time}`).toISOString(), notes });
    setShowForm(false);
    setTopic(''); setDate(''); setTime(''); setNotes(''); setTeacherId('');
    const { data } = await supabase.from('appointments').select('*').eq('user_id', profile.id).order('scheduled_at', { ascending: true });
    setAppointments((data as Appointment[]) || []);
  };

  const handleCancel = async (id: string) => {
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Rendez-vous</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Réservez un créneau avec un conseiller ou formateur.</p></div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? <><X className="h-4 w-4" /> Annuler</> : <><Plus className="h-4 w-4" /> Réserver</>}</Button>
      </div>
      {showForm && (
        <Card className="p-6 animate-slide-up">
          <form onSubmit={handleBook} className="space-y-4">
            <Select label="Formateur / Conseiller" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required>
              <option value="">Sélectionner...</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              <option value="">Conseiller général</option>
            </Select>
            <Input label="Sujet" placeholder="Orientation, formation, etc." value={topic} onChange={(e) => setTopic(e.target.value)} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              <Input label="Heure" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
            <Textarea label="Notes (optionnel)" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button type="submit" className="w-full">Confirmer le rendez-vous</Button>
          </form>
        </Card>
      )}
      <div className="grid gap-4">
        {appointments.length > 0 ? appointments.map((apt) => (
          <Card key={apt.id} className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"><Calendar className="h-6 w-6" /></div>
              <div><p className="font-bold text-slate-900 dark:text-white">{apt.topic}</p><p className="text-sm text-slate-500 dark:text-slate-400">{apt.teacher_name && `Avec ${apt.teacher_name} • `}{formatDateTime(apt.scheduled_at)} • {apt.duration_min}min</p></div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={statusColors[apt.status] || 'bg-slate-100 text-slate-600'}>{appointmentStatusLabels[apt.status]}</Badge>
              {apt.status === 'pending' && <Button variant="ghost" size="sm" onClick={() => handleCancel(apt.id)}>Annuler</Button>}
            </div>
          </Card>
        )) : (
          <Card className="flex flex-col items-center p-12 text-center"><Calendar className="h-12 w-12 text-slate-300 dark:text-slate-600" /><p className="mt-3 text-slate-500 dark:text-slate-400">Aucun rendez-vous programmé.</p></Card>
        )}
      </div>
    </div>
  );
}
