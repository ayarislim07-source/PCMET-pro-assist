import Link from 'next/link';
import { Languages, HeartPulse, Laptop, GraduationCap, ArrowRight, BookOpen, Sparkles, ShieldCheck, Users, Clock, MessageSquare, Brain, FileText, Award, Compass } from 'lucide-react';

const formations = [
  { title: 'Langues', description: "Anglais, Français, Allemand, Italien. Améliorez votre communication avec des cours adaptés à votre niveau.", icon: Languages, accent: 'from-sky-500 to-blue-600', href: '/trainings/langues' },
  { title: 'Premiers secours', description: "Formations aux gestes qui sauvent : PSC1, SST, BLS et recyclages avec des formateurs certifiés.", icon: HeartPulse, accent: 'from-rose-500 to-red-600', href: '/trainings/premiers-secours' },
  { title: 'Informatique', description: "Bureautique, développement, réseaux et cybersécurité. Maîtrisez les outils numériques essentiels.", icon: Laptop, accent: 'from-cyan-500 to-teal-600', href: '/trainings/informatique' },
  { title: 'Formation continue', description: "Montez en compétences avec des parcours personnalisés et certifiants tout au long de votre carrière.", icon: GraduationCap, accent: 'from-amber-500 to-orange-600', href: '/trainings/formation-continue' },
];

const advantages = [
  { icon: ShieldCheck, title: 'Formations certifiantes', text: 'Des certifications reconnues par les organismes officiels et les employeurs.' },
  { icon: Users, title: 'Formateurs experts', text: 'Une équipe pédagogique expérimentée à votre écoute pour vous accompagner.' },
  { icon: Clock, title: 'Horaires flexibles', text: 'Des sessions en présentiel et à distance, adaptées à votre emploi du temps.' },
  { icon: Sparkles, title: 'Pédagogie active', text: 'Une approche pratique et concrète pour progresser durablement.' },
];

const features = [
  { icon: MessageSquare, title: 'Guide IA', text: 'Un assistant intelligent qui répond à vos questions 24/7 et vous oriente.', href: '/dashboard/ai-guide' },
  { icon: Compass, title: 'Outils IA', text: 'Recommandations, CV, lettres de motivation et préparation d\'entretien par IA.', href: '/dashboard/ai-tools' },
  { icon: Brain, title: 'Test de niveau', text: 'Évaluez votre niveau en langues et obtenez une recommandation personnalisée.', href: '/dashboard/level-test' },
  { icon: Award, title: 'Certificats numériques', text: 'Recevez un certificat vérifiable avec QR code après chaque formation.', href: '/trainings' },
];

const stats = [
  { value: '12+', label: 'Formations disponibles' },
  { value: '4', label: 'Domaines de formation' },
  { value: '4', label: 'Langues enseignées' },
  { value: '100%', label: 'Taux de satisfaction' },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950" />
        <div className="absolute -top-24 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-200/40 to-sky-100/30 blur-3xl dark:from-blue-900/20 dark:to-sky-900/10" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-32">
          <div className="flex flex-col items-center text-center">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-xl shadow-blue-600/30 ring-8 ring-blue-50 dark:ring-blue-950/50">
              <GraduationCap className="h-10 w-10" />
            </div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-400">
              <Sparkles className="h-4 w-4" /> PCMET Horizon Qualité
            </span>
            <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              PCMET <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">Votre Guide</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400 sm:text-xl">Votre partenaire vers la réussite</p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <Link href="/signup" className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30">
                Commencer <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/trainings" className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-800 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                <BookOpen className="h-5 w-5" /> Découvrir les formations
              </Link>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50/60 py-20 sm:py-24 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Nos domaines de formation</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Un large catalogue de formations pour accompagner votre développement personnel et professionnel.</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {formations.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.description}</p>
                  <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">En savoir plus <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Pourquoi choisir PCMET</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Un accompagnement de qualité pour atteindre vos objectifs.</p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex flex-col items-start">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-900">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-50/60 py-20 sm:py-24 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Une plateforme tout-en-un</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Des outils intelligents pour vous accompagner à chaque étape.</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white"><Icon className="h-5 w-5" /></div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.text}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-sky-500 px-8 py-14 text-center shadow-2xl shadow-blue-600/30 sm:px-16 sm:py-20">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Prêt à démarrer votre parcours ?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-50">Rejoignez PCMET Votre Guide et bénéficiez d&apos;un accompagnement personnalisé pour réussir votre projet de formation.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup" className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50">
              Commencer <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/trainings" className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20">
              <BookOpen className="h-5 w-5" /> Découvrir les formations
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}