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
/*  HOOK: on-screen visibility                                         */
/* ------------------------------------------------------------------ */

function useInView<T extends HTMLElement>(): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState<boolean>(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
      
