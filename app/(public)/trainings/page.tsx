import Link from 'next/link';
import { Languages, HeartPulse, Laptop, GraduationCap, ArrowRight } from 'lucide-react';

const categories = [
  { title: 'Langues', description: 'Anglais, Français, Allemand, Italien — du niveau A1 au niveau B2.', icon: Languages, accent: 'from-sky-500 to-blue-600', href: '/trainings/langues' },
  { title: 'Premiers secours', description: 'PSC1, SST, BLS et recyclages. Des gestes qui sauvent, certifiés officiellement.', icon: HeartPulse, accent: 'from-rose-500 to-red-600', href: '/trainings/premiers-secours' },
  { title: 'Informatique', description: 'Bureautique, développement web, réseaux et cybersécurité.', icon: Laptop, accent: 'from-cyan-500 to-teal-600', href: '/trainings/informatique' },
  { title: 'Formation continue', description: 'Management, gestion de projet, marketing digital et plus encore.', icon: GraduationCap, accent: 'from-amber-500 to-orange-600', href: '/trainings/formation-continue' },
];

export default function TrainingsPage() {
  return (
    <div className="dark:bg-slate-950">
      <section className="bg-gradient-to-b from-sky-50 to-white py-20 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">Nos formations</h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">Explorez nos 4 domaines de formation et trouvez le parcours qui vous correspond.</p>
        </div>
      </section>
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href} className="group flex items-start gap-5 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent} text-white shadow-md transition-transform group-hover:scale-110`}><Icon className="h-7 w-7" /></div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">Voir les formations <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
