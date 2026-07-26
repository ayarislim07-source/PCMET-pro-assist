'use client';

import { useEffect, useState } from 'react';
import { supabase, CV, CVData, CVTemplate } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { FileText, Plus, Trash2, Download, Save, User, Briefcase, GraduationCap, Star } from 'lucide-react';

const emptyCV: CVData = {
  fullName: '', email: '', phone: '', address: '', summary: '',
  experience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
  education: [{ school: '', degree: '', startDate: '', endDate: '', description: '' }],
  skills: [], languages: [{ language: '', level: '' }],
  certificates: [{ title: '', issuer: '', date: '' }],
};

const templates: { id: CVTemplate; name: string; description: string }[] = [
  { id: 'europass', name: 'Europass', description: 'Format européen standard' },
  { id: 'modern', name: 'Modern', description: 'Design moderne et épuré' },
  { id: 'ats', name: 'ATS Friendly', description: 'Optimisé pour les recruteurs' },
];

export default function CVBuilderPage() {
  const { profile } = useAuth();
  const [activeCV, setActiveCV] = useState<CV | null>(null);
  const [data, setData] = useState<CVData>(emptyCV);
  const [template, setTemplate] = useState<CVTemplate>('modern');
  const [skillsInput, setSkillsInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    supabase.from('cvs').select('*').eq('user_id', profile.id).order('updated_at', { ascending: false })
      .then(({ data: cvData }) => {
        const cvList = (cvData as CV[]) || [];
        if (cvList.length > 0) {
          setActiveCV(cvList[0]);
          setData(cvList[0].data);
          setTemplate(cvList[0].template);
          setSkillsInput((cvList[0].data.skills || []).join(', '));
        } else {
          setData(prev => ({ ...prev, fullName: profile.full_name, email: profile.email, phone: profile.phone }));
        }
        setLoading(false);
      });
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const cvData = { ...data, skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean) };
    if (activeCV) {
      await supabase.from('cvs').update({ data: cvData, template, updated_at: new Date().toISOString() }).eq('id', activeCV.id);
    } else {
      const { data: newCV } = await supabase.from('cvs').insert({ user_id: profile.id, title: 'Mon CV', data: cvData, template }).select('*').single();
      if (newCV) setActiveCV(newCV as CV);
    }
    setSaving(false);
  };

  const handlePrint = () => window.print();

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between print:hidden">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">CV Builder</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Créez votre CV professionnel en quelques minutes.</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}><Save className="h-4 w-4" /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}</Button>
          <Button onClick={handlePrint}><Download className="h-4 w-4" /> Exporter PDF</Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 print:hidden">
        {templates.map((t) => (
          <button key={t.id} onClick={() => setTemplate(t.id)} className={`rounded-xl border p-4 text-left transition-all ${template === t.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-slate-200 bg-white hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800'}`}>
            <FileText className={`h-6 w-6 ${template === t.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            <h3 className="mt-2 font-bold text-slate-900 dark:text-white">{t.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.description}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 print:hidden">
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-white"><User className="h-5 w-5 text-blue-600" /> Informations personnelles</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Nom complet" value={data.fullName} onChange={e => setData({ ...data, fullName: e.target.value })} />
              <Input label="Email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} />
              <Input label="Téléphone" value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} />
              <Input label="Adresse" value={data.address} onChange={e => setData({ ...data, address: e.target.value })} />
            </div>
            <Textarea label="Profil / Résumé" rows={3} value={data.summary} onChange={e => setData({ ...data, summary: e.target.value })} className="mt-3" />
          </Card>
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><Briefcase className="h-5 w-5 text-blue-600" /> Expérience</h2>
              <Button size="sm" variant="ghost" onClick={() => setData({ ...data, experience: [...(data.experience || []), { company: '', position: '', startDate: '', endDate: '', description: '' }] })}><Plus className="h-4 w-4" /> Ajouter</Button>
            </div>
            {(data.experience || []).map((exp, i) => (
              <div key={i} className="mb-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-slate-400">Expérience {i + 1}</span><button onClick={() => setData({ ...data, experience: data.experience!.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Poste" value={exp.position} onChange={e => { const next = [...data.experience!]; next[i] = { ...exp, position: e.target.value }; setData({ ...data, experience: next }); }} />
                  <Input label="Entreprise" value={exp.company} onChange={e => { const next = [...data.experience!]; next[i] = { ...exp, company: e.target.value }; setData({ ...data, experience: next }); }} />
                  <Input label="Début" type="month" value={exp.startDate} onChange={e => { const next = [...data.experience!]; next[i] = { ...exp, startDate: e.target.value }; setData({ ...data, experience: next }); }} />
                  <Input label="Fin" type="month" value={exp.endDate} onChange={e => { const next = [...data.experience!]; next[i] = { ...exp, endDate: e.target.value }; setData({ ...data, experience: next }); }} />
                </div>
                <Textarea label="Description" rows={2} value={exp.description} onChange={e => { const next = [...data.experience!]; next[i] = { ...exp, description: e.target.value }; setData({ ...data, experience: next }); }} className="mt-2" />
              </div>
            ))}
          </Card>
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><GraduationCap className="h-5 w-5 text-blue-600" /> Formation</h2>
              <Button size="sm" variant="ghost" onClick={() => setData({ ...data, education: [...(data.education || []), { school: '', degree: '', startDate: '', endDate: '', description: '' }] })}><Plus className="h-4 w-4" /> Ajouter</Button>
            </div>
            {(data.education || []).map((edu, i) => (
              <div key={i} className="mb-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-slate-400">Formation {i + 1}</span><button onClick={() => setData({ ...data, education: data.education!.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Diplôme" value={edu.degree} onChange={e => { const next = [...data.education!]; next[i] = { ...edu, degree: e.target.value }; setData({ ...data, education: next }); }} />
                  <Input label="Établissement" value={edu.school} onChange={e => { const next = [...data.education!]; next[i] = { ...edu, school: e.target.value }; setData({ ...data, education: next }); }} />
                  <Input label="Début" type="month" value={edu.startDate} onChange={e => { const next = [...data.education!]; next[i] = { ...edu, startDate: e.target.value }; setData({ ...data, education: next }); }} />
                  <Input label="Fin" type="month" value={edu.endDate} onChange={e => { const next = [...data.education!]; next[i] = { ...edu, endDate: e.target.value }; setData({ ...data, education: next }); }} />
                </div>
              </div>
            ))}
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-white"><Star className="h-5 w-5 text-blue-600" /> Compétences & Langues</h2>
            <Input label="Compétences (séparées par des virgules)" value={skillsInput} onChange={e => setSkillsInput(e.target.value)} />
            <div className="mt-3 space-y-2">
              {(data.languages || []).map((lang, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Langue" value={lang.language} onChange={e => { const next = [...data.languages!]; next[i] = { ...lang, language: e.target.value }; setData({ ...data, languages: next }); }} />
                  <Input placeholder="Niveau (B1, B2...)" value={lang.level} onChange={e => { const next = [...data.languages!]; next[i] = { ...lang, level: e.target.value }; setData({ ...data, languages: next }); }} />
                </div>
              ))}
              <Button size="sm" variant="ghost" onClick={() => setData({ ...data, languages: [...(data.languages || []), { language: '', level: '' }] })}><Plus className="h-4 w-4" /> Ajouter une langue</Button>
            </div>
          </Card>
        </div>
        <div className="lg:sticky lg:top-24">
          <Card className="overflow-hidden bg-white p-8 print:border-0 print:shadow-none">
            <div className={template === 'europass' ? 'border-l-4 border-blue-600 pl-4' : template === 'modern' ? '' : 'font-mono'}>
              <h1 className="text-2xl font-extrabold text-slate-900">{data.fullName || 'Votre nom'}</h1>
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">{data.email && <span>{data.email}</span>}{data.phone && <span>• {data.phone}</span>}{data.address && <span>• {data.address}</span>}</div>
              {data.summary && (<div className="mt-4"><h2 className="text-sm font-bold uppercase tracking-wide text-blue-600">Profil</h2><p className="mt-1 text-sm text-slate-600">{data.summary}</p></div>)}
              {(data.experience || []).filter(e => e.position || e.company).length > 0 && (
                <div className="mt-4"><h2 className="text-sm font-bold uppercase tracking-wide text-blue-600">Expérience</h2>
                  {(data.experience || []).filter(e => e.position || e.company).map((exp, i) => (
                    <div key={i} className="mt-2"><p className="text-sm font-semibold text-slate-900">{exp.position} — {exp.company}</p><p className="text-xs text-slate-400">{exp.startDate} — {exp.endDate || 'Présent'}</p>{exp.description && <p className="mt-1 text-sm text-slate-600">{exp.description}</p>}</div>
                  ))}
                </div>
              )}
              {(data.education || []).filter(e => e.degree || e.school).length > 0 && (
                <div className="mt-4"><h2 className="text-sm font-bold uppercase tracking-wide text-blue-600">Formation</h2>
                  {(data.education || []).filter(e => e.degree || e.school).map((edu, i) => (
                    <div key={i} className="mt-2"><p className="text-sm font-semibold text-slate-900">{edu.degree} — {edu.school}</p><p className="text-xs text-slate-400">{edu.startDate} — {edu.endDate || 'Présent'}</p></div>
                  ))}
                </div>
              )}
              {skillsInput && (
                <div className="mt-4"><h2 className="text-sm font-bold uppercase tracking-wide text-blue-600">Compétences</h2>
                  <div className="mt-1 flex flex-wrap gap-1.5">{skillsInput.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (<span key={i} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{skill}</span>))}</div>
                </div>
              )}
              {(data.languages || []).filter(l => l.language).length > 0 && (
                <div className="mt-4"><h2 className="text-sm font-bold uppercase tracking-wide text-blue-600">Langues</h2>{(data.languages || []).filter(l => l.language).map((lang, i) => (<p key={i} className="text-sm text-slate-600">{lang.language} — {lang.level}</p>))}</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
