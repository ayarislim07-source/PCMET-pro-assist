'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import {
  Compass, FileText, Mail, MessageSquare, GraduationCap,
  Sparkles, Bot, Download, Copy, CheckCircle2,
} from 'lucide-react';

type ToolType = 'recommend' | 'learning_path' | 'generate_cv' | 'generate_letter' | 'interview_prep';

const tools: { type: ToolType; title: string; description: string; icon: typeof Compass; color: string }[] = [
  { type: 'recommend', title: 'Recommandation de formation', description: 'Obtenez le meilleur cours PCMET selon votre profil', icon: Compass, color: 'from-blue-500 to-sky-500' },
  { type: 'learning_path', title: 'Parcours d\'apprentissage', description: 'Construisez un parcours personnalisé avec durée et coût estimés', icon: GraduationCap, color: 'from-green-500 to-teal-500' },
  { type: 'generate_cv', title: 'Générateur de CV', description: 'Créez un CV professionnel structuré par IA', icon: FileText, color: 'from-amber-500 to-orange-500' },
  { type: 'generate_letter', title: 'Lettre de motivation', description: 'Rédigez une lettre convaincante par IA', icon: Mail, color: 'from-purple-500 to-pink-500' },
  { type: 'interview_prep', title: 'Préparation entretien', description: 'Questions fréquentes, conseils et simulation', icon: MessageSquare, color: 'from-rose-500 to-red-500' },
];

export default function AIToolsPage() {
  const { profile } = useAuth();
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form states
  const [studentProfile, setStudentProfile] = useState({ currentLevel: '', careerObjective: '', targetCountry: '', previousEducation: '', preferredCategory: '' });
  const [cvData, setCvData] = useState({ fullName: '', targetPosition: '', experience: '', education: '', skills: '' });
  const [letterData, setLetterData] = useState({ targetPosition: '', targetCompany: '', applicantName: '', keySkills: '', motivation: '' });
  const [interviewTarget, setInterviewTarget] = useState('');

  const callAPI = async (question: string, action: ToolType, extraData?: Record<string, unknown>) => {
    setLoading(true);
    setResult('');
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/ai-guide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ question, language: 'fr', userId: profile?.id || null, action, ...extraData }),
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setResult(data.answer || 'Une erreur est survenue.');
    } catch {
      setResult('Désolé, une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (tool: ToolType) => {
    let question = '';
    let extraData: Record<string, unknown> = {};

    if (tool === 'recommend' || tool === 'learning_path') {
      question = tool === 'recommend'
        ? `Recommandez-moi une formation PCMET. Niveau: ${studentProfile.currentLevel}, objectif: ${studentProfile.careerObjective}, pays: ${studentProfile.targetCountry}, éducation: ${studentProfile.previousEducation}, domaine: ${studentProfile.preferredCategory}`
        : `Construisez mon parcours d'apprentissage PCMET. Niveau: ${studentProfile.currentLevel}, objectif: ${studentProfile.careerObjective}, pays: ${studentProfile.targetCountry}, éducation: ${studentProfile.previousEducation}`;
      extraData = { studentProfile };
    } else if (tool === 'generate_cv') {
      question = `Générez un CV professionnel. Nom: ${cvData.fullName}, poste: ${cvData.targetPosition}, expérience: ${cvData.experience}, formation: ${cvData.education}, compétences: ${cvData.skills}`;
      extraData = { cvData };
    } else if (tool === 'generate_letter') {
      question = `Rédigez une lettre de motivation. Poste: ${letterData.targetPosition}, entreprise: ${letterData.targetCompany}, candidat: ${letterData.applicantName}, compétences: ${letterData.keySkills}, motivation: ${letterData.motivation}`;
      extraData = { letterData };
    } else if (tool === 'interview_prep') {
      question = `Préparez-moi pour un entretien: ${interviewTarget}`;
    }

    callAPI(question, tool, extraData);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Outils IA PCMET</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Vos outils intelligents pour réussir votre parcours de formation.</p>
      </div>

      {/* Tool selection grid */}
      {!activeTool && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button key={tool.type} onClick={() => { setActiveTool(tool.type); setResult(''); }}
                className="group flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tool.color} text-white shadow-md transition-transform group-hover:scale-110`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-bold text-slate-900 dark:text-white">{tool.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tool.description}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Active tool form + result */}
      {activeTool && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => { setActiveTool(null); setResult(''); }}
              className="text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
              ← Retour aux outils
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Sparkles className="h-4 w-4" /> Propulsé par PCMET Votre Guide
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Form */}
            <Card className="p-6">
              <h2 className="mb-4 font-bold text-slate-900 dark:text-white">
                {tools.find(t => t.type === activeTool)?.title}
              </h2>

              {(activeTool === 'recommend' || activeTool === 'learning_path') && (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label="Niveau actuel" placeholder="Ex: Débutant, A1, B1..." value={studentProfile.currentLevel} onChange={e => setStudentProfile({ ...studentProfile, currentLevel: e.target.value })} />
                    <Input label="Objectif professionnel" placeholder="Ex: Travailler en Allemagne" value={studentProfile.careerObjective} onChange={e => setStudentProfile({ ...studentProfile, careerObjective: e.target.value })} />
                    <Input label="Pays de destination" placeholder="Ex: Allemagne, France..." value={studentProfile.targetCountry} onChange={e => setStudentProfile({ ...studentProfile, targetCountry: e.target.value })} />
                    <Input label="Éducation précédente" placeholder="Ex: Bac, Licence..." value={studentProfile.previousEducation} onChange={e => setStudentProfile({ ...studentProfile, previousEducation: e.target.value })} />
                  </div>
                  <Select label="Domaine préféré" value={studentProfile.preferredCategory} onChange={e => setStudentProfile({ ...studentProfile, preferredCategory: e.target.value })}>
                    <option value="">Tous les domaines</option>
                    <option value="langues">Langues</option>
                    <option value="premiers_secours">Premiers secours</option>
                    <option value="informatique">Informatique</option>
                    <option value="formation_continue">Formation continue</option>
                  </Select>
                  <Button onClick={() => handleSubmit(activeTool)} disabled={loading} className="w-full">
                    {loading ? 'Génération en cours...' : activeTool === 'recommend' ? 'Obtenir ma recommandation' : 'Construire mon parcours'}
                  </Button>
                </div>
              )}

              {activeTool === 'generate_cv' && (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label="Nom complet" value={cvData.fullName} onChange={e => setCvData({ ...cvData, fullName: e.target.value })} />
                    <Input label="Poste visé" value={cvData.targetPosition} onChange={e => setCvData({ ...cvData, targetPosition: e.target.value })} />
                  </div>
                  <Textarea label="Expérience professionnelle" rows={3} placeholder="Ex: 3 ans comme développeur..." value={cvData.experience} onChange={e => setCvData({ ...cvData, experience: e.target.value })} />
                  <Textarea label="Formation" rows={2} placeholder="Ex: Licence en informatique..." value={cvData.education} onChange={e => setCvData({ ...cvData, education: e.target.value })} />
                  <Input label="Compétences" placeholder="Ex: Python, JavaScript, management..." value={cvData.skills} onChange={e => setCvData({ ...cvData, skills: e.target.value })} />
                  <Button onClick={() => handleSubmit('generate_cv')} disabled={loading} className="w-full">
                    {loading ? 'Génération...' : 'Générer mon CV'}
                  </Button>
                </div>
              )}

              {activeTool === 'generate_letter' && (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label="Poste visé" value={letterData.targetPosition} onChange={e => setLetterData({ ...letterData, targetPosition: e.target.value })} />
                    <Input label="Entreprise" value={letterData.targetCompany} onChange={e => setLetterData({ ...letterData, targetCompany: e.target.value })} />
                  </div>
                  <Input label="Votre nom" value={letterData.applicantName} onChange={e => setLetterData({ ...letterData, applicantName: e.target.value })} />
                  <Input label="Compétences clés" placeholder="Ex: Management, communication..." value={letterData.keySkills} onChange={e => setLetterData({ ...letterData, keySkills: e.target.value })} />
                  <Textarea label="Votre motivation" rows={3} placeholder="Pourquoi ce poste ?" value={letterData.motivation} onChange={e => setLetterData({ ...letterData, motivation: e.target.value })} />
                  <Button onClick={() => handleSubmit('generate_letter')} disabled={loading} className="w-full">
                    {loading ? 'Génération...' : 'Générer ma lettre'}
                  </Button>
                </div>
              )}

              {activeTool === 'interview_prep' && (
                <div className="space-y-3">
                  <Textarea label="Type d'entretien / poste visé" rows={4} placeholder="Ex: Entretien pour une formation Ausbildung en Allemagne, entretien pour un poste de développeur web..." value={interviewTarget} onChange={e => setInterviewTarget(e.target.value)} />
                  <Button onClick={() => handleSubmit('interview_prep')} disabled={loading || !interviewTarget.trim()} className="w-full">
                    {loading ? 'Préparation...' : 'Préparer mon entretien'}
                  </Button>
                </div>
              )}
            </Card>

            {/* Result */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Résultat
                </h2>
                {result && !loading && (
                  <div className="flex gap-2">
                    <button onClick={copyResult} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">
                      {copied ? <><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Copié</> : <><Copy className="h-3.5 w-3.5" /> Copier</>}
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">
                      <Download className="h-3.5 w-3.5" /> Exporter
                    </button>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Génération en cours...</p>
                  </div>
                </div>
              ) : result ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">{result}</pre>
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <Sparkles className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Le résultat apparaîtra ici après génération.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
