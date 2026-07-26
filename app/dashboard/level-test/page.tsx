'use client';

import { useEffect, useState } from 'react';
import { supabase, LevelTest } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { languageLabels } from '@/lib/utils';
import { Brain, CheckCircle2, ArrowRight, RotateCcw, Award } from 'lucide-react';

const languageFlags: Record<string, string> = { anglais: '🇬🇧', francais: '🇫🇷', allemand: '🇩🇪', italien: '🇮🇹' };

const getRecommendedLevel = (score: number, total: number): string => {
  const pct = (score / total) * 100;
  if (pct >= 90) return 'C1 — Avancé';
  if (pct >= 75) return 'B2 — Intermédiaire supérieur';
  if (pct >= 60) return 'B1 — Intermédiaire';
  if (pct >= 40) return 'A2 — Élémentaire';
  return 'A1 — Débutant';
};

export default function LevelTestPage() {
  const { profile } = useAuth();
  const [tests, setTests] = useState<LevelTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<LevelTest | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState<{ score: number; total: number; level: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('level_tests').select('*').then(({ data }) => { setTests((data as LevelTest[]) || []); setLoading(false); });
  }, []);

  const startTest = (test: LevelTest) => { setSelectedTest(test); setAnswers(new Array(test.questions.length).fill(-1)); setCurrentQ(0); setResult(null); };

  const submitTest = async () => {
    if (!selectedTest || !profile) return;
    const score = answers.reduce((sum, ans, i) => sum + (ans === selectedTest.questions[i].correct ? 1 : 0), 0);
    const level = getRecommendedLevel(score, selectedTest.questions.length);
    await supabase.from('test_results').insert({ user_id: profile.id, test_id: selectedTest.id, score, total: selectedTest.questions.length, recommended_level: level, answers });
    setResult({ score, total: selectedTest.questions.length, level });
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;

  if (result && selectedTest) {
    const pct = Math.round((result.score / result.total) * 100);
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30"><Award className="h-10 w-10 text-green-500" /></div>
        <h1 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">Test terminé !</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{selectedTest.title}</p>
        <Card className="mt-8 w-full max-w-md p-8 text-center">
          <p className="text-5xl font-extrabold text-blue-600 dark:text-blue-400">{pct}%</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{result.score} / {result.total} bonnes réponses</p>
          <div className="mt-6 rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30"><p className="text-sm text-slate-500 dark:text-slate-400">Niveau recommandé</p><p className="mt-1 text-xl font-bold text-blue-700 dark:text-blue-400">{result.level}</p></div>
        </Card>
        <div className="mt-6"><Button variant="outline" onClick={() => { setSelectedTest(null); setResult(null); }}><RotateCcw className="h-4 w-4" /> Autre test</Button></div>
      </div>
    );
  }

  if (selectedTest) {
    const q = selectedTest.questions[currentQ];
    return (
      <div className="mx-auto max-w-2xl animate-fade-in">
        <div className="mb-4 flex items-center justify-between"><h1 className="text-xl font-bold text-slate-900 dark:text-white">{selectedTest.title}</h1><span className="text-sm text-slate-500 dark:text-slate-400">Question {currentQ + 1}/{selectedTest.questions.length}</span></div>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${((currentQ + 1) / selectedTest.questions.length) * 100}%` }} /></div>
        <Card className="p-6">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{q.question}</p>
          <div className="mt-4 space-y-2">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => setAnswers(prev => { const next = [...prev]; next[currentQ] = i; return next; })}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all ${answers[currentQ] === i ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' : 'border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${answers[currentQ] === i ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 text-slate-400'}`}>{String.fromCharCode(65 + i)}</span>{opt}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="outline" disabled={currentQ === 0} onClick={() => setCurrentQ(prev => prev - 1)}>Précédent</Button>
            {currentQ < selectedTest.questions.length - 1 ? (
              <Button disabled={answers[currentQ] === -1} onClick={() => setCurrentQ(prev => prev + 1)}>Suivant <ArrowRight className="h-4 w-4" /></Button>
            ) : (
              <Button disabled={answers[currentQ] === -1} onClick={submitTest}>Voir mon résultat <CheckCircle2 className="h-4 w-4" /></Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Test de niveau</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Évaluez votre niveau et obtenez une recommandation personnalisée.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        {tests.map((test) => (
          <Card key={test.id} hover className="p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{languageFlags[test.language] || '🌐'}</span>
              <div><h3 className="font-bold text-slate-900 dark:text-white">{test.title}</h3><p className="text-sm text-slate-500 dark:text-slate-400">{test.questions.length} questions • {languageLabels[test.language] || test.language}</p></div>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{test.description}</p>
            <Button onClick={() => startTest(test)} className="mt-4 w-full"><Brain className="h-4 w-4" /> Commencer le test</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
