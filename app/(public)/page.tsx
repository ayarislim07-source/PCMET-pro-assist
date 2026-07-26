"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Search,
  Mic,
  Send,
  Languages,
  HeartPulse,
  Globe2,
  FileText,
  Compass,
  Sparkles,
  GraduationCap,
  Award,
  Briefcase,
  Users,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Star,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface NavItem {
  label: string;
  href: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
}

interface SuggestionChip {
  id: string;
  label: string;
}

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
}

interface StatItem {
  id: string;
  label: string;
  value: number;
  suffix: string;
  icon: React.ElementType;
}

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

interface FooterLinkGroup {
  title: string;
  links: { label: string; href: string }[];
}

/* ------------------------------------------------------------------ */
/*  STATIC DATA                                                        */
/* ------------------------------------------------------------------ */

const NAV_ITEMS: NavItem[] = [
  { label: "Accueil", href: "#accueil" },
  { label: "Formations", href: "#formations" },
  { label: "Allemagne", href: "#allemagne" },
  { label: "CV", href: "#cv" },
  { label: "Contact", href: "#contact" },
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "languages",
    title: "Langues",
    description: "Apprenez l'allemand et d'autres langues avec un accompagnement intelligent.",
    icon: Languages,
    gradient: "from-blue-500/20 via-cyan-400/10 to-transparent",
  },
  {
    id: "first-aid",
    title: "Premiers secours",
    description: "Formations certifiantes aux gestes qui sauvent, à votre rythme.",
    icon: HeartPulse,
    gradient: "from-rose-500/20 via-pink-400/10 to-transparent",
  },
  {
    id: "germany",
    title: "Allemagne",
    description: "Toutes les démarches pour étudier, travailler et vous installer en Allemagne.",
    icon: Globe2,
    gradient: "from-amber-500/20 via-yellow-400/10 to-transparent",
  },
  {
    id: "cv",
    title: "CV professionnel",
    description: "Créez un CV percutant et adapté aux standards internationaux.",
    icon: FileText,
    gradient: "from-emerald-500/20 via-teal-400/10 to-transparent",
  },
  {
    id: "career",
    title: "Orientation carrière",
    description: "Un accompagnement personnalisé pour construire votre avenir professionnel.",
    icon: Compass,
    gradient: "from-violet-500/20 via-purple-400/10 to-transparent",
  },
];

const SUGGESTIONS: SuggestionChip[] = [
  { id: "s1", label: "Je veux apprendre l'allemand" },
  { id: "s2", label: "Créer mon CV" },
  { id: "s3", label: "Étudier en Allemagne" },
  { id: "s4", label: "Premiers secours" },
  { id: "s5", label: "Choisir une formation" },
];

const FEATURES: FeatureItem[] = [
  {
    id: "ai",
    title: "Assistance IA",
    description: "Un assistant intelligent disponible à tout moment pour répondre à vos questions.",
    icon: Sparkles,
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    id: "training",
    title: "Formations professionnelles",
    description: "Des parcours certifiants conçus par des experts pour votre évolution.",
    icon: GraduationCap,
    gradient: "from-violet-500 to-fuchsia-400",
  },
  {
    id: "germany-f",
    title: "Allemagne",
    description: "Accompagnement complet pour vos projets d'études et de mobilité.",
    icon: Globe2,
    gradient: "from-amber-500 to-orange-400",
  },
  {
    id: "languages-f",
    title: "Langues",
    description: "Progressez rapidement grâce à des méthodes adaptées à votre niveau.",
    icon: Languages,
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    id: "certificates",
    title: "Certificats",
    description: "Obtenez des certifications reconnues pour valoriser votre profil.",
    icon: Award,
    gradient: "from-rose-500 to-pink-400",
  },
  {
    id: "career-f",
    title: "Carrière",
    description: "Des outils concrets pour préparer votre entrée sur le marché du travail.",
    icon: Briefcase,
    gradient: "from-indigo-500 to-blue-400",
  },
];

const STATS: StatItem[] = [
  { id: "students", label: "Étudiants accompagnés", value: 12500, suffix: "+", icon: Users },
  { id: "courses", label: "Formations disponibles", value: 84, suffix: "+", icon: BookOpen },
  { id: "certificates-s", label: "Certificats délivrés", value: 6300, suffix: "+", icon: Award },
  { id: "partners", label: "Partenaires", value: 40, suffix: "+", icon: ShieldCheck },
];

const TIMELINE: TimelineItem[] = [
  {
    id: "t1",
    title: "Un accompagnement humain et intelligent",
    description: "PCMET Assist combine expertise pédagogique et intelligence artificielle pour vous guider à chaque étape.",
    icon: Sparkles,
  },
  {
    id: "t2",
    title: "Des formations reconnues",
    description: "Nos parcours sont conçus avec des professionnels pour garantir des compétences réellement utiles.",
    icon: GraduationCap,
  },
  {
    id: "t3",
    title: "Une expertise sur l'Allemagne",
    description: "Études, stages, emploi : nous connaissons parfaitement les démarches pour réussir votre projet allemand.",
    icon: Globe2,
  },
  {
    id: "t4",
    title: "Un suivi personnalisé",
    description: "Chaque utilisateur bénéficie d'un accompagnement adapté à ses objectifs et à son rythme.",
    icon: TrendingUp,
  },
];

const FOOTER_LINKS: FooterLinkGroup[] = [
  {
    title: "Plateforme",
    links: [
      { label: "Accueil", href: "#accueil" },
      { label: "Formations", href: "#formations" },
      { label: "Allemagne", href: "#allemagne" },
      { label: "CV", href: "#cv" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Certificats", href: "#" },
      { label: "Guides", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "#" },
      { label: "Contact", href: "#contact" },
      { label: "Partenaires", href: "#" },
      { label: "Carrières", href: "#" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  HOOK: animated counter                                             */
/* ------------------------------------------------------------------ */

function useCountUp(target: number, isActive: boolean, duration = 1800): number {
  const [value, setValue] = useState<number>(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;
    startRef.current = null;

    const step = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isActive, target, duration]);

  return value;
}

/* ------------------------------------------------------------------ */
/*  HOOK: on-screen visibility (hardcoded to HTMLDivElement to avoid   */
/*  generic/JSX parsing ambiguity in .tsx files)                       */
/* ------------------------------------------------------------------ */

function useInView(): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState<boolean>(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}

/* ------------------------------------------------------------------ */
/*  COMPONENT: Floating background blobs                               */
/* ------------------------------------------------------------------ */

function BackgroundBlobs(): React.ReactElement {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-blue-600/30 blur-[120px] animate-blob-slow" />
      <div className="absolute top-20 -right-32 h-[24rem] w-[24rem] rounded-full bg-fuchsia-600/20 blur-[120px] animate-blob-slower" />
      <div className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full bg-cyan-500/20 blur-[130px] animate-blob-slowest" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  COMPONENT: Header                                                   */
/* ------------------------------------------------------------------ */

function Header(): React.ReactElement {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl ring-1 ring-white/15 shadow-lg shadow-blue-500/10">
            <Image
              src="/IMG_1198.jpeg"
              alt="PCMET Assist"
              fill
              sizes="40px"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight text-white sm:text-lg">
              PCMET Assist
            </span>
            <span className="text-[11px] text-white/50 sm:text-xs">
              Votre assistant intelligent
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/70 transition-colors duration-300 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex">
          <button className="group relative overflow-hidden rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.35)]">
            <span className="relative z-10 flex items-center gap-1.5">
              Commencer
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </button>
        </div>

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex items-center justify-center rounded-lg p-2 text-white/80 hover:bg-white/10 md:hidden"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out md:hidden ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-1 border-t border-white/10 bg-black/80 px-5 pb-5 pt-3 backdrop-blur-xl">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </a>
          ))}
          <button className="mt-2 w-full rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">
            Commencer
          </button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  COMPONENT: Smart search bar                                        */
/* ------------------------------------------------------------------ */

function SmartSearchBar(): React.ReactElement {
  const [query, setQuery] = useState<string>("");
  const [focused, setFocused] = useState<boolean>(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div
        className={`relative flex items-center gap-2 rounded-2xl border bg-white/[0.06] px-4 py-3.5 backdrop-blur-2xl transition-all duration-300 sm:px-5 sm:py-4 ${
          focused
            ? "border-blue-400/60 shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_0_40px_rgba(59,130,246,0.25)]"
            : "border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
        }`}
      >
        <Search className="h-5 w-5 flex-shrink-0 text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Posez votre question…"
          className="w-full bg-transparent text-sm text-white placeholder-white/40 outline-none sm:text-base"
        />
        <button
          type="button"
          className="flex-shrink-0 rounded-full p-2 text-white/50 transition-colors duration-300 hover:bg-white/10 hover:text-white"
          aria-label="Recherche vocale"
        >
          <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          type="submit"
          className="flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 p-2 text-white shadow-lg shadow-blue-500/30 transition-transform duration-300 hover:scale-105 active:scale-95 sm:p-2.5"
          aria-label="Envoyer"
        >
          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  COMPONENT: Hero                                                     */
/* ------------------------------------------------------------------ */

function Hero(): React.ReactElement {
  return (
    <section
      id="accueil"
      className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-20 sm:pt-32"
    >
      <BackgroundBlobs />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-5 text-center sm:px-8">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-xl">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-xs font-medium text-white/70">
            Propulsé par l&apos;intelligence artificielle
          </span>
        </div>

        <h1 className="max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Votre assistant intelligent pour{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
            apprendre, évoluer et réussir.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base text-white/60 sm:text-lg">
          Formations, langues, orientation professionnelle et projets en Allemagne :
          PCMET Assist vous accompagne à chaque étape avec des réponses claires et personnalisées.
        </p>

        <div className="mt-10 flex w-full justify-center">
          <SmartSearchBar />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 px-2">
          {SUGGESTIONS.map((chip) => (
            <button
              key={chip.id}
              className="group flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/70 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white sm:text-sm"
            >
              {chip.label}
              <ChevronRight className="h-3 w-3 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  COMPONENT: Quick actions                                            */
/* ------------------------------------------------------------------ */

function QuickActions(): React.ReactElement {
  return (
    <section id="formations" className="relative px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col items-center text-center">
          <span className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            Actions rapides
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Que souhaitez-vous faire aujourd&apos;hui ?
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b ${action.gradient} bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]`}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 transition-all duration-500 group-hover:scale-110 group-hover:bg-white/15">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{action.title}</h3>
                <p className="text-sm leading-relaxed text-white/55">{action.description}</p>
                <div className="mt-5 flex items-center gap-1 text-xs font-medium text-white/40 transition-all duration-300 group-hover:gap-2 group-hover:text-white/80">
                  Découvrir
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  COMPONENT: Features                                                 */
/* ------------------------------------------------------------------ */

function Features(): React.ReactElement {
  return (
    <section className="relative px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col items-center text-center">
          <span className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Fonctionnalités
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Tout ce dont vous avez besoin, en un seul endroit
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20"
              >
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-white/55">{feature.description}</p>

                <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white/5 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  COMPONENT: Stats                                                    */
/* ------------------------------------------------------------------ */

function StatCard({ stat }: { stat: StatItem }): React.ReactElement {
  const [ref, inView] = useInView();
  const count = useCountUp(stat.value, inView);
  const Icon = stat.icon;

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 text-center backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:bg-white/[0.06]"
    >
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
        <Icon className="h-5 w-5 text-blue-400" />
      </div>
      <div className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {count.toLocaleString("fr-FR")}
        <span className="text-blue-400">{stat.suffix}</span>
      </div>
      <p className="mt-2 text-sm text-white/55">{stat.label}</p>
    </div>
  );
}

function Stats(): React.ReactElement {
  return (
    <section className="relative px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  COMPONENT: Why PCMET (timeline)                                     */
/* ------------------------------------------------------------------ */

function WhyPcmet(): React.ReactElement {
  return (
    <section id="allemagne" className="relative px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 flex flex-col items-center text-center">
          <span className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Pourquoi PCMET
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Une plateforme pensée pour votre réussite
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-blue-500/50 via-white/10 to-transparent sm:block" />

          <div className="space-y-6">
            {TIMELINE.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:bg-white/[0.05] sm:flex-row sm:items-start sm:pl-8"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20 sm:absolute sm:-left-6">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="sm:ml-6">
                    <h3 className="mb-1.5 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-white/55">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  COMPONENT: Trust bar                                                */
/* ------------------------------------------------------------------ */

function TrustBar(): React.ReactElement {
  return (
    <section id="cv" className="relative px-5 py-14 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-6 rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center backdrop-blur-xl sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 w-10 rounded-full border-2 border-black bg-gradient-to-br from-blue-500 to-violet-500"
              />
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm text-white/60">Noté 4.9/5 par nos utilisateurs</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-white/50">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          Réponses fiables
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <Clock className="h-4 w-4 text-blue-400" />
          Disponible 24/7
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  COMPONENT: CTA                                                      */
/* ------------------------------------------------------------------ */

function CallToAction(): React.ReactElement {
  return (
    <section id="contact" className="relative px-5 py-20 sm:px-8 sm:py-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-blue-600/30 via-violet-600/20 to-cyan-500/20 px-6 py-16 text-center backdrop-blur-2xl sm:px-16 sm:py-20">
        <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-blue-500/30 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-violet-500/30 blur-[110px]" />

        <div className="relative z-10 flex flex-col items-center">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Prêt à transformer votre avenir ?
          </h2>
          <p className="mt-5 max-w-xl text-base text-white/65 sm:text-lg">
            Rejoignez des milliers d&apos;utilisateurs qui font confiance à PCMET Assist
            pour apprendre, se former et réussir.
          </p>

          <button className="group mt-9 flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] sm:text-base">
            Commencer maintenant
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  COMPONENT: Footer                                                   */
/* ------------------------------------------------------------------ */

function Footer(): React.ReactElement {
  const socialIcons = [Facebook, Instagram, Linkedin, Youtube];

  return (
    <footer className="relative border-t border-white/10 px-5 pb-10 pt-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl ring-1 ring-white/15">
                <Image
                  src="/IMG_1198.jpeg"
                  alt="PCMET Assist"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <span className="text-base font-semibold text-white">PCMET Assist</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/50">
              Votre assistant intelligent pour apprendre, évoluer et réussir, chaque jour.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {socialIcons.map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h4 className="mb-4 text-sm font-semibold text-white">{group.title}</h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/50 transition-colors duration-300 hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} PCMET Assist. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <a href="#" className="transition-colors hover:text-white">
              Confidentialité
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Conditions
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                                */
/* ------------------------------------------------------------------ */

export default function Page(): React.ReactElement {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050507] text-white antialiased">
      <style jsx global>{`
        @keyframes blob-slow {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -40px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
        }
        @keyframes blob-slower {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-40px, 30px) scale(1.05);
          }
          66% {
            transform: translate(20px, -30px) scale(0.9);
          }
        }
        @keyframes blob-slowest {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(25px, 25px) scale(1.15);
          }
        }
        .animate-blob-slow {
          animation: blob-slow 18s ease-in-out infinite;
        }
        .animate-blob-slower {
          animation: blob-slower 22s ease-in-out infinite;
        }
        .animate-blob-slowest {
          animation: blob-slowest 26s ease-in-out infinite;
        }
      `}</style>

      <Header />
      <Hero />
      <QuickActions />
      <Features />
      <Stats />
      <WhyPcmet />
      <TrustBar />
      <CallToAction />
      <Footer />
    </main>
  );
}
