import { GraduationCap, Target, Eye, Heart, Users, Award, Globe, TrendingUp, Sparkles } from 'lucide-react';

const values = [
  { icon: Heart, title: 'Passion', text: 'Nous mettons tout en œuvre pour la réussite de nos apprenants.' },
  { icon: Award, title: 'Excellence', text: 'Des formations de qualité, certifiées et reconnues par les professionnels.' },
  { icon: Globe, title: 'Accessibilité', text: 'Des formations accessibles à tous, en présentiel et à distance.' },
  { icon: TrendingUp, title: 'Innovation', text: 'Des méthodes pédagogiques modernes et un accompagnement par IA.' },
];

const team = [
  { name: 'Sarah Johnson', role: 'Formatrice Langues', initials: 'SJ' },
  { name: 'Dr. Marie Laurent', role: 'Formatrice Premiers Secours', initials: 'ML' },
  { name: 'Thomas Petit', role: 'Formateur Informatique', initials: 'TP' },
  { name: 'Sophie Martin', role: 'Formatrice Management', initials: 'SM' },
];

export default function AboutPage() {
  return (
    <div className="dark:bg-slate-950">
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 to-white py-20 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-xl">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">À propos de PCMET</h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">PCMET Horizon Qualité — Votre partenaire vers la réussite depuis 2015.</p>
        </div>
      </section>
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Notre histoire</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400">PCMET Horizon Qualité est un centre de formation et d&apos;orientation créé en 2015. Notre mission est d&apos;accompagner chaque apprenant vers la réussite professionnelle grâce à des formations de qualité et un suivi personnalisé.</p>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Nous proposons des formations en langues, premiers secours, informatique et formation continue, avec des certifications reconnues par les organismes officiels.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[{ icon: Target, title: 'Notre mission', text: 'Démocratiser l\u2019accès à la formation professionnelle de qualité.' }, { icon: Eye, title: 'Notre vision', text: 'Devenir le référent en formation et orientation en France.' }].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <h3 className="mt-3 font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-slate-50/60 py-20 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">Nos valeurs</h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"><Icon className="h-7 w-7" /></div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">Notre équipe</h2>
          <p className="mt-4 text-center text-slate-600 dark:text-slate-400">Des formateurs passionnés et certifiés à votre écoute.</p>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div key={member.name} className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-2xl font-bold text-white">{member.initials}</div>
                <h3 className="mt-4 font-bold text-slate-900 dark:text-white">{member.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-slate-50/60 py-20 dark:bg-slate-900/40">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-blue-600 dark:text-blue-400" />
          <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">Rejoignez l&apos;aventure PCMET</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Plus de 5000 apprenants nous font confiance pour leur réussite.</p>
        </div>
      </section>
    </div>
  );
}
