import Link from 'next/link';
import { supabase, Course } from '@/lib/supabase';
import { categoryLabels, formatPrice } from '@/lib/utils';
import { Clock, Users, Award, ArrowRight, BookOpen } from 'lucide-react';

export default async function CategoryPage({ category }: { category: string }) {
  const { data: courses } = await supabase.from('courses').select('*').eq('category', category).eq('is_published', true).order('created_at', { ascending: false });
  const label = categoryLabels[category] || category;

  return (
    <div className="dark:bg-slate-950">
      <section className="bg-gradient-to-b from-sky-50 to-white py-16 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">{label}</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Découvrez nos formations en {label.toLowerCase()}.</p>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          {courses && courses.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course: Course) => (
                <Link key={course.id} href={`/courses/${course.id}`} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">{course.level}</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatPrice(course.price)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{course.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-400">{course.description}</p>
                  <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {course.duration_hours}h</p>
                    <p className="flex items-center gap-2"><Users className="h-4 w-4" /> {course.enrolled}/{course.capacity} inscrits</p>
                    {course.teacher_name && <p className="flex items-center gap-2"><Award className="h-4 w-4" /> {course.teacher_name}</p>}
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">Voir les détails <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600" />
              <p className="mt-4 text-slate-500 dark:text-slate-400">Aucune formation disponible pour le moment.</p>
              <Link href="/trainings" className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400">Voir toutes les formations</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
