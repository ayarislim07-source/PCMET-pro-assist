import Link from 'next/link';
import { supabase, Course } from '@/lib/supabase';
import { categoryLabels, formatPrice } from '@/lib/utils';
import { Clock, Users, Award, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const { data: course } = await supabase.from('courses').select('*').eq('id', params.id).maybeSingle();
  if (!course) notFound();
  const c = course as Course;

  return (
    <div className="dark:bg-slate-950">
      <section className="bg-gradient-to-b from-sky-50 to-white py-16 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-4xl px-6">
          <Link href="/trainings" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
            <ArrowRight className="h-4 w-4 rotate-180" /> Retour aux formations
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">{categoryLabels[c.category]}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">{c.level}</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{c.title}</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">{c.description}</p>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Programme de la formation</h2>
              {c.syllabus && c.syllabus.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {c.syllabus.map((module, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                      <h3 className="font-bold text-slate-900 dark:text-white">{i + 1}. {module.title}</h3>
                      <ul className="mt-3 space-y-2">
                        {module.topics.map((topic, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><CheckCircle2 className="h-4 w-4 text-green-500" /> {topic}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-slate-500 dark:text-slate-400">Le programme détaillé sera communiqué à l&apos;inscription.</p>
              )}
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{formatPrice(c.price)}</p>
                <div className="mt-6 space-y-3 text-sm">
                  <p className="flex items-center gap-3 text-slate-600 dark:text-slate-400"><Clock className="h-5 w-5 text-slate-400" /> {c.duration_hours} heures</p>
                  <p className="flex items-center gap-3 text-slate-600 dark:text-slate-400"><Users className="h-5 w-5 text-slate-400" /> {c.enrolled}/{c.capacity} places</p>
                  {c.teacher_name && <p className="flex items-center gap-3 text-slate-600 dark:text-slate-400"><Award className="h-5 w-5 text-slate-400" /> {c.teacher_name}</p>}
                  {c.schedule && <p className="flex items-center gap-3 text-slate-600 dark:text-slate-400"><Calendar className="h-5 w-5 text-slate-400" /> {c.schedule}</p>}
                </div>
                <Link href={`/register?course=${c.id}`} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700">S&apos;inscrire à cette formation <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/dashboard/ai-guide" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">Demander au Guide IA</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
