'use client';

import { useEffect, useState } from 'react';
import { supabase, Course } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { categoryLabels, formatPrice } from '@/lib/utils';
import { Plus, Edit, Trash2, X, BookOpen } from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'langues', level: 'Débutant', duration_hours: 0, price: 0, capacity: 20, schedule: '', teacher_name: '' });

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    setCourses((data as Course[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) { await supabase.from('courses').update(form).eq('id', editing.id); }
    else { await supabase.from('courses').insert({ ...form, is_published: true }); }
    setShowForm(false); setEditing(null);
    setForm({ title: '', description: '', category: 'langues', level: 'Débutant', duration_hours: 0, price: 0, capacity: 20, schedule: '', teacher_name: '' });
    fetchCourses();
  };

  const handleEdit = (c: Course) => {
    setEditing(c);
    setForm({ title: c.title, description: c.description, category: c.category, level: c.level, duration_hours: c.duration_hours, price: c.price, capacity: c.capacity, schedule: c.schedule, teacher_name: c.teacher_name });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette formation ?')) return;
    await supabase.from('courses').delete().eq('id', id);
    fetchCourses();
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Formations</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{courses.length} formations</p></div>
        <Button onClick={() => { setShowForm(!showForm); setEditing(null); }}>{showForm ? <><X className="h-4 w-4" /> Annuler</> : <><Plus className="h-4 w-4" /> Ajouter</>}</Button>
      </div>
      {showForm && (
        <Card className="p-6 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Titre" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <Textarea label="Description" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-3">
              <Select label="Catégorie" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
              <Select label="Niveau" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}><option value="Débutant">Débutant</option><option value="Intermédiaire">Intermédiaire</option><option value="Avancé">Avancé</option></Select>
              <Input label="Durée (heures)" type="number" value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: +e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Prix (€)" type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} />
              <Input label="Places" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })} />
              <Input label="Formateur" value={form.teacher_name} onChange={e => setForm({ ...form, teacher_name: e.target.value })} />
            </div>
            <Input label="Horaire" value={form.schedule} onChange={e => setForm({ ...form, schedule: e.target.value })} placeholder="Lun-Mer 18h-20h" />
            <Button type="submit">{editing ? 'Mettre à jour' : 'Créer la formation'}</Button>
          </form>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map(c => (
          <Card key={c.id} className="p-5">
            <div className="flex items-center justify-between">
              <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">{categoryLabels[c.category]}</Badge>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatPrice(c.price)}</span>
            </div>
            <h3 className="mt-3 font-bold text-slate-900 dark:text-white">{c.title}</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{c.level} • {c.duration_hours}h • {c.capacity} places</p>
            {c.teacher_name && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Par {c.teacher_name}</p>}
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(c)}><Edit className="h-4 w-4" /> Modifier</Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
      {courses.length === 0 && <Card className="flex flex-col items-center p-12"><BookOpen className="h-10 w-10 text-slate-300" /><p className="mt-3 text-sm text-slate-500">Aucune formation.</p></Card>}
    </div>
  );
}
