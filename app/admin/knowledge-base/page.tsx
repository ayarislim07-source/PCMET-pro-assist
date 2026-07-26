'use client';

import { useEffect, useState } from 'react';
import { supabase, KnowledgeBase, UnansweredQuestion } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Database, Plus, X, CheckCircle2, Brain, Trash2, Edit, BarChart3, TrendingUp, MessageCircle, AlertCircle, Sparkles } from 'lucide-react';

const categories = [
  { value: 'langues', label: 'Langues' }, { value: 'premiers_secours', label: 'Premiers secours' },
  { value: 'informatique', label: 'Informatique' }, { value: 'formation_continue', label: 'Formation continue' },
  { value: 'certificats', label: 'Certificats' }, { value: 'prix', label: 'Prix' },
  { value: 'administration', label: 'Administration' }, { value: 'faq', label: 'FAQ' }, { value: 'general', label: 'Général' },
];

const categoryColors: Record<string, string> = {
  langues: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', premiers_secours: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  informatique: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400', formation_continue: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  certificats: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', prix: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  administration: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', faq: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  general: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const categoryLabel = (value: string) => categories.find(c => c.value === value)?.label || value;

type AnalyticsRow = { question: string; count: number; was_answered: boolean; source: string };

export default function AdminKnowledgeBasePage() {
  const [kb, setKb] = useState<KnowledgeBase[]>([]);
  const [unanswered, setUnanswered] = useState<UnansweredQuestion[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'knowledge' | 'unanswered' | 'analytics'>('knowledge');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<KnowledgeBase | null>(null);
  const [form, setForm] = useState({ question: '', answer: '', category: 'general', language: 'fr', keywords: '' });
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answerCategory, setAnswerCategory] = useState('general');
  const [filterCategory, setFilterCategory] = useState('all');
  const [generatingEmbeddings, setGeneratingEmbeddings] = useState(false);

  const fetchData = async () => {
    const [{ data: kbData }, { data: unansweredData }, { data: analyticsData }] = await Promise.all([
      supabase.from('knowledge_base').select('*').order('created_at', { ascending: false }),
      supabase.from('unanswered_questions').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('question_analytics').select('question, was_answered, source, created_at').order('created_at', { ascending: false }).limit(500),
    ]);
    setKb((kbData as KnowledgeBase[]) || []);
    setUnanswered((unansweredData as UnansweredQuestion[]) || []);
    const rows = (analyticsData || []) as any[];
    const aggregated = new Map<string, AnalyticsRow>();
    for (const row of rows) {
      const key = (row.question || '').toLowerCase().trim();
      if (!key) continue;
      const existing = aggregated.get(key);
      if (existing) { existing.count++; } else { aggregated.set(key, { question: row.question, count: 1, was_answered: row.was_answered, source: row.source }); }
    }
    setAnalytics(Array.from(aggregated.values()).sort((a, b) => b.count - a.count).slice(0, 20));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) { await supabase.from('knowledge_base').update({ ...form, embedding: null }).eq('id', editing.id); }
    else { await supabase.from('knowledge_base').insert({ ...form, is_approved: true }); }
    setShowForm(false); setEditing(null);
    setForm({ question: '', answer: '', category: 'general', language: 'fr', keywords: '' });
    fetchData();
  };

  const handleAnswer = async (id: string) => {
    const q = unanswered.find(u => u.id === id);
    if (!q || !answerText.trim()) return;
    await supabase.from('knowledge_base').insert({ question: q.question, answer: answerText, category: answerCategory, language: q.language || 'fr', keywords: q.question, is_approved: true });
    await supabase.from('unanswered_questions').update({ status: 'answered', answer: answerText, answered_at: new Date().toISOString() }).eq('id', id);
    setAnsweringId(null); setAnswerText(''); setAnswerCategory('general');
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette entrée ?')) return;
    await supabase.from('knowledge_base').delete().eq('id', id);
    fetchData();
  };

  const handleIgnore = async (id: string) => {
    await supabase.from('unanswered_questions').update({ status: 'ignored' }).eq('id', id);
    fetchData();
  };

  const handleGenerateEmbeddings = async () => {
    setGeneratingEmbeddings(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/generate-embeddings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` },
      });
      const data = await res.json();
      if (data.processed !== undefined) { alert(`${data.processed} embeddings générés !`); }
      else if (data.error) { alert(`Erreur: ${data.error}`); }
    } catch { alert('Erreur lors de la génération.'); }
    setGeneratingEmbeddings(false);
    fetchData();
  };

  const startEdit = (entry: KnowledgeBase) => {
    setEditing(entry);
    setForm({ question: entry.question, answer: entry.answer, category: entry.category, language: entry.language, keywords: entry.keywords });
    setShowForm(true);
  };

  const filteredKb = filterCategory === 'all' ? kb : kb.filter(e => e.category === filterCategory);

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Base de connaissances IA</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{kb.length} entrées • {unanswered.length} questions en attente</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateEmbeddings} disabled={generatingEmbeddings}><Sparkles className="h-4 w-4" /> {generatingEmbeddings ? 'Génération...' : 'Générer embeddings'}</Button>
          <Button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ question: '', answer: '', category: 'general', language: 'fr', keywords: '' }); }}>{showForm ? <><X className="h-4 w-4" /> Annuler</> : <><Plus className="h-4 w-4" /> Ajouter</>}</Button>
        </div>
      </div>

      <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
        {[{ id: 'knowledge' as const, label: 'Base de connaissances', icon: Database, count: kb.length }, { id: 'unanswered' as const, label: 'Questions sans réponse', icon: AlertCircle, count: unanswered.length }, { id: 'analytics' as const, label: 'Analytique', icon: BarChart3, count: null }].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
              <Icon className="h-4 w-4" /> {tab.label}
              {tab.count !== null && tab.count > 0 && <span className={`rounded-full px-1.5 py-0.5 text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>{tab.count}</span>}
            </button>
          );
        })}
      </div>

      {showForm && (
        <Card className="p-6 animate-slide-up">
          <h2 className="mb-4 font-bold text-slate-900 dark:text-white">{editing ? 'Modifier l\'entrée' : 'Nouvelle entrée'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Question" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} required placeholder="Ex: Quel est le prix de la formation PSC1 ?" />
            <Textarea label="Réponse" rows={4} value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} required placeholder="La réponse détaillée..." />
            <div className="grid gap-4 sm:grid-cols-3">
              <Select label="Catégorie" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</Select>
              <Select label="Langue" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}><option value="fr">Français</option><option value="en">English</option><option value="ar">العربية</option></Select>
              <Input label="Mots-clés" value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} placeholder="mot1 mot2 mot3" />
            </div>
            <div className="flex gap-2"><Button type="submit">{editing ? 'Mettre à jour' : 'Ajouter à la base'}</Button><Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Annuler</Button></div>
          </form>
        </Card>
      )}

      {activeTab === 'knowledge' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilterCategory('all')} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${filterCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}>Toutes ({kb.length})</button>
            {categories.map(c => { const count = kb.filter(e => e.category === c.value).length; if (count === 0) return null; return <button key={c.value} onClick={() => setFilterCategory(c.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${filterCategory === c.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}>{c.label} ({count})</button>; })}
          </div>
          <div className="space-y-3">
            {filteredKb.map(entry => (
              <Card key={entry.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={categoryColors[entry.category] || categoryColors.general}>{categoryLabel(entry.category)}</Badge>
                      <span className="text-xs text-slate-400">{entry.language}</span>
                      {(entry.match_count ?? 0) > 0 && <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400"><TrendingUp className="h-3 w-3" /> {entry.match_count}x utilisée</span>}
                    </div>
                    <p className="mt-2 font-semibold text-slate-900 dark:text-white">{entry.question}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{entry.answer}</p>
                    {entry.keywords && <div className="mt-2 flex flex-wrap gap-1">{entry.keywords.split(' ').filter(Boolean).map((kw, i) => <span key={i} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">{kw}</span>)}</div>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => startEdit(entry)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-700"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(entry.id)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {filteredKb.length === 0 && <Card className="flex flex-col items-center p-12 text-center"><Database className="h-10 w-10 text-slate-300 dark:text-slate-600" /><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Aucune entrée dans cette catégorie.</p></Card>}
        </div>
      )}

      {activeTab === 'unanswered' && (
        <div className="space-y-3">
          {unanswered.length > 0 ? unanswered.map(q => (
            <Card key={q.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-500" /><span className="text-xs text-slate-400">{formatDate(q.created_at)} • {q.language}</span></div>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">{q.question}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleIgnore(q.id)} className="text-slate-400">Ignorer</Button>
              </div>
              {answeringId === q.id ? (
                <div className="mt-4 space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <Textarea label="Réponse" rows={3} value={answerText} onChange={e => setAnswerText(e.target.value)} placeholder="Écrivez la réponse..." autoFocus />
                  <Select label="Catégorie" value={answerCategory} onChange={e => setAnswerCategory(e.target.value)}>{categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</Select>
                  <div className="flex gap-2"><Button size="sm" onClick={() => handleAnswer(q.id)} disabled={!answerText.trim()}><CheckCircle2 className="h-4 w-4" /> Enregistrer dans la base</Button><Button size="sm" variant="ghost" onClick={() => { setAnsweringId(null); setAnswerText(''); }}>Annuler</Button></div>
                </div>
              ) : (
                <Button size="sm" variant="outline" className="mt-3" onClick={() => { setAnsweringId(q.id); setAnswerText(''); setAnswerCategory('general'); }}><MessageCircle className="h-4 w-4" /> Répondre</Button>
              )}
            </Card>
          )) : (
            <Card className="flex flex-col items-center p-12 text-center"><CheckCircle2 className="h-10 w-10 text-green-500" /><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Aucune question en attente. L&apos;assistant IA répond à toutes les questions !</p></Card>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5"><div className="flex items-center justify-between"><div><p className="text-2xl font-extrabold text-slate-900 dark:text-white">{analytics.reduce((s, a) => s + a.count, 0)}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Total questions</p></div><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30"><MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div></div></Card>
            <Card className="p-5"><div className="flex items-center justify-between"><div><p className="text-2xl font-extrabold text-green-600 dark:text-green-400">{analytics.filter(a => a.was_answered).reduce((s, a) => s + a.count, 0)}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Répondues</p></div><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/30"><CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" /></div></div></Card>
            <Card className="p-5"><div className="flex items-center justify-between"><div><p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{analytics.filter(a => !a.was_answered).reduce((s, a) => s + a.count, 0)}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sans réponse</p></div><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30"><AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" /></div></div></Card>
          </div>
          <Card>
            <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4 dark:border-slate-700"><TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" /><h2 className="font-bold text-slate-900 dark:text-white">Questions les plus fréquentes</h2></div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {analytics.length > 0 ? analytics.map((row, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400">{i + 1}</span>
                    <div><p className="text-sm font-medium text-slate-900 dark:text-white">{row.question}</p><p className="text-xs text-slate-400">{row.was_answered ? 'Répondue' : 'Sans réponse'} • {row.source}</p></div>
                  </div>
                  <Badge className={row.was_answered ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}>{row.count}x</Badge>
                </div>
              )) : (
                <div className="px-5 py-12 text-center"><BarChart3 className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" /><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Aucune donnée analytique pour le moment.</p></div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
