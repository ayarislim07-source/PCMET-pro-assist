'use client';

import { useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import {
  Send, Sparkles, Bot, User, Database, AlertCircle,
  Compass, FileText, Mail, MessageSquare, GraduationCap,
  ChevronDown, ChevronUp, X,
} from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  source?: 'knowledge_base' | 'unanswered';
  matchedQuestions?: { question: string; category: string; similarity?: number }[];
};

type ActionType = 'chat' | 'recommend' | 'generate_cv' | 'generate_letter' | 'interview_prep' | 'learning_path';

const actionCards: { action: ActionType; label: string; icon: typeof Compass; description: string; color: string }[] = [
  { action: 'recommend', label: 'Recommander une formation', icon: Compass, description: 'Trouvez le cours PCMET idéal selon votre profil', color: 'from-blue-500 to-sky-500' },
  { action: 'learning_path', label: 'Mon parcours d\'apprentissage', icon: GraduationCap, description: 'Construisez un parcours personnalisé avec durée et coût', color: 'from-green-500 to-teal-500' },
  { action: 'generate_cv', label: 'Générer mon CV', icon: FileText, description: 'Créez un CV professionnel en quelques clics', color: 'from-amber-500 to-orange-500' },
  { action: 'generate_letter', label: 'Lettre de motivation', icon: Mail, description: 'Rédigez une lettre convaincante', color: 'from-purple-500 to-pink-500' },
  { action: 'interview_prep', label: 'Préparation entretien', icon: MessageSquare, description: 'Simulez et préparez vos entretiens', color: 'from-rose-500 to-red-500' },
];

const suggestions = [
  'Quelles formations proposez-vous ?',
  'Quel est le prix des formations ?',
  'Comment m\'inscrire ?',
  'Quelle est la différence entre PSC1, SST et BLS ?',
  'Comment préparer l\'Ausbildung en Allemagne ?',
  'Proposez-vous des cours en ligne ?',
  'Puis-je payer en plusieurs fois ?',
  'Comment vérifier un certificat ?',
];

const sourceBadge = (source?: string) => {
  if (source === 'knowledge_base') {
    return (
      <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
        <Database className="h-3 w-3" /> Réponse validée — Base de connaissances PCMET
      </div>
    );
  }
  if (source === 'unanswered') {
    return (
      <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
        <AlertCircle className="h-3 w-3" /> Question enregistrée — Notre équipe vous répondra
      </div>
    );
  }
  return null;
};

export default function AIGuidePage() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis PCMET Votre Guide, l\'assistant intelligent officiel de PCMET Horizon Qualité. Je peux vous renseigner sur nos formations en langues, premiers secours et formation professionnelle. Je peux aussi vous recommander un parcours personnalisé, générer votre CV, rédiger une lettre de motivation ou vous préparer à un entretien. Comment puis-je vous aider aujourd\'hui ?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'fr' | 'ar' | 'en'>('fr');
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [showActionPanel, setShowActionPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Form states for different actions
  const [studentProfile, setStudentProfile] = useState({
    currentLevel: '', careerObjective: '', targetCountry: '', previousEducation: '', preferredCategory: '',
  });
  const [cvData, setCvData] = useState({ fullName: '', targetPosition: '', experience: '', education: '', skills: '' });
  const [letterData, setLetterData] = useState({ targetPosition: '', targetCompany: '', applicantName: '', keySkills: '', motivation: '' });
  const [interviewTarget, setInterviewTarget] = useState('');

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const callAPI = async (question: string, action: ActionType = 'chat', extraData?: Record<string, unknown>) => {
    setLoading(true);
    scrollToBottom();
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/ai-guide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          question, language, userId: profile?.id || null, action, ...extraData,
        }),
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      return data;
    } catch {
      return { answer: 'Désolé, je rencontre un problème technique. Veuillez réessayer.', source: 'unanswered' };
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleSend = async (text?: string) => {
    const question = text || input.trim();
    if (!question || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    const data = await callAPI(question, 'chat');
    setMessages(prev => [...prev, {
      role: 'assistant', content: data.answer, source: data.source,
      matchedQuestions: data.matchedQuestions,
    }]);
  };

  const handleActionSubmit = async (action: ActionType) => {
    let question = '';
    let extraData: Record<string, unknown> = {};

    if (action === 'recommend' || action === 'learning_path') {
      question = action === 'recommend'
        ? `Recommandez-moi une formation PCMET. Mon niveau: ${studentProfile.currentLevel}, mon objectif: ${studentProfile.careerObjective}, pays visé: ${studentProfile.targetCountry}, éducation: ${studentProfile.previousEducation}, domaine: ${studentProfile.preferredCategory}`
        : `Construisez mon parcours d'apprentissage PCMET. Niveau: ${studentProfile.currentLevel}, objectif: ${studentProfile.careerObjective}, pays: ${studentProfile.targetCountry}, éducation: ${studentProfile.previousEducation}`;
      extraData = { studentProfile };
    } else if (action === 'generate_cv') {
      question = `Générez un CV professionnel. Nom: ${cvData.fullName}, poste visé: ${cvData.targetPosition}, expérience: ${cvData.experience}, formation: ${cvData.education}, compétences: ${cvData.skills}`;
      extraData = { cvData };
    } else if (action === 'generate_letter') {
      question = `Rédigez une lettre de motivation. Poste: ${letterData.targetPosition}, entreprise: ${letterData.targetCompany}, candidat: ${letterData.applicantName}, compétences: ${letterData.keySkills}, motivation: ${letterData.motivation}`;
      extraData = { letterData };
    } else if (action === 'interview_prep') {
      question = `Préparez-moi pour un entretien: ${interviewTarget}`;
    }

    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setShowActionPanel(false);
    setActiveAction(null);
    const data = await callAPI(question, action, extraData);
    setMessages(prev => [...prev, {
      role: 'assistant', content: data.answer, source: data.source,
      matchedQuestions: data.matchedQuestions,
    }]);
  };

  const openAction = (action: ActionType) => {
    setActiveAction(action);
    setShowActionPanel(true);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">PCMET Votre Guide</h1>
            <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex h-2 w-2 rounded-full bg-green-500" /> Assistant IA officiel • En ligne 24/7
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
          {(['fr', 'en', 'ar'] as const).map((lang) => (
            <button key={lang} onClick={() => setLanguage(lang)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${language === lang ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
              {lang === 'fr' ? 'FR' : lang === 'en' ? 'EN' : 'AR'}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${msg.role === 'user' ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : 'bg-gradient-to-br from-blue-600 to-sky-500 text-white'}`}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'assistant' && sourceBadge(msg.source)}
                {msg.matchedQuestions && msg.matchedQuestions.length > 0 && (
                  <div className="mt-2 border-t border-slate-200 pt-2 dark:border-slate-600">
                    <p className="text-xs text-slate-400">Sources PCMET :</p>
                    {msg.matchedQuestions.map((mq, j) => (
                      <p key={j} className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        • {mq.question} <span className="text-slate-400">({mq.category})</span>
                        {mq.similarity && <span className="ml-1 text-green-500">{Math.round(mq.similarity * 100)}%</span>}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-700">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Action Cards (shown initially) */}
      {messages.length <= 1 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {actionCards.map((card) => {
            const Icon = card.icon;
            return (
              <button key={card.action} onClick={() => openAction(card.action)}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${card.color} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{card.label}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{card.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Action Panel */}
      {showActionPanel && activeAction && (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800 animate-slide-up">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">
              {actionCards.find(a => a.action === activeAction)?.label}
            </h3>
            <button onClick={() => { setShowActionPanel(false); setActiveAction(null); }}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Recommend / Learning Path form */}
          {(activeAction === 'recommend' || activeAction === 'learning_path') && (
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
              <Button onClick={() => handleActionSubmit(activeAction)} disabled={loading} className="w-full">
                {activeAction === 'recommend' ? 'Obtenir ma recommandation' : 'Construire mon parcours'}
              </Button>
            </div>
          )}

          {/* CV Generator form */}
          {activeAction === 'generate_cv' && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Nom complet" value={cvData.fullName} onChange={e => setCvData({ ...cvData, fullName: e.target.value })} />
                <Input label="Poste visé" value={cvData.targetPosition} onChange={e => setCvData({ ...cvData, targetPosition: e.target.value })} />
              </div>
              <Textarea label="Expérience professionnelle" rows={3} placeholder="Ex: 3 ans comme développeur chez..." value={cvData.experience} onChange={e => setCvData({ ...cvData, experience: e.target.value })} />
              <Textarea label="Formation" rows={2} placeholder="Ex: Licence en informatique..." value={cvData.education} onChange={e => setCvData({ ...cvData, education: e.target.value })} />
              <Input label="Compétences" placeholder="Ex: Python, JavaScript, gestion de projet..." value={cvData.skills} onChange={e => setCvData({ ...cvData, skills: e.target.value })} />
              <Button onClick={() => handleActionSubmit('generate_cv')} disabled={loading} className="w-full">Générer mon CV</Button>
            </div>
          )}

          {/* Motivation letter form */}
          {activeAction === 'generate_letter' && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Poste visé" value={letterData.targetPosition} onChange={e => setLetterData({ ...letterData, targetPosition: e.target.value })} />
                <Input label="Entreprise" value={letterData.targetCompany} onChange={e => setLetterData({ ...letterData, targetCompany: e.target.value })} />
              </div>
              <Input label="Votre nom" value={letterData.applicantName} onChange={e => setLetterData({ ...letterData, applicantName: e.target.value })} />
              <Input label="Compétences clés" placeholder="Ex: Management, communication,..." value={letterData.keySkills} onChange={e => setLetterData({ ...letterData, keySkills: e.target.value })} />
              <Textarea label="Votre motivation" rows={3} placeholder="Pourquoi ce poste ? Pourquoi cette entreprise ?" value={letterData.motivation} onChange={e => setLetterData({ ...letterData, motivation: e.target.value })} />
              <Button onClick={() => handleActionSubmit('generate_letter')} disabled={loading} className="w-full">Générer ma lettre</Button>
            </div>
          )}

          {/* Interview prep form */}
          {activeAction === 'interview_prep' && (
            <div className="space-y-3">
              <Textarea label="Type d'entretien / poste / formation visé" rows={3} placeholder="Ex: Entretien pour une formation Ausbildung en Allemagne, entretien pour un poste de développeur..." value={interviewTarget} onChange={e => setInterviewTarget(e.target.value)} />
              <Button onClick={() => handleActionSubmit('interview_prep')} disabled={loading || !interviewTarget.trim()} className="w-full">Préparer mon entretien</Button>
            </div>
          )}
        </div>
      )}

      {/* Quick suggestions */}
      {messages.length <= 1 && !showActionPanel && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => handleSend(s)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-3 flex items-center gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Posez votre question à PCMET Votre Guide..."
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        <Button onClick={() => handleSend()} disabled={loading || !input.trim()} size="lg" className="px-4">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
