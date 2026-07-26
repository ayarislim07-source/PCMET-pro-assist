'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GraduationCap, Menu, X, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/lib/auth-context';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/about', label: 'À propos' },
  { href: '/trainings', label: 'Formations' },
  { href: '/news', label: 'Actualités' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
];

const categoryLinks = [
  { href: '/trainings/langues', label: 'Langues' },
  { href: '/trainings/premiers-secours', label: 'Premiers secours' },
  { href: '/trainings/informatique', label: 'Informatique' },
  { href: '/trainings/formation-continue', label: 'Formation continue' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [trainingsOpen, setTrainingsOpen] = useState(false);
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg dark:border-slate-700/70 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-600/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <span className="block text-sm font-bold leading-tight text-slate-900 dark:text-white">PCMET</span>
            <span className="block text-xs leading-tight text-slate-500 dark:text-slate-400">Votre Guide</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) =>
            link.href === '/trainings' ? (
              <div key={link.href} className="relative" onMouseEnter={() => setTrainingsOpen(true)} onMouseLeave={() => setTrainingsOpen(false)}>
                <Link href={link.href} className="flex items-center gap-0.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400">
                  {link.label}<ChevronDown className="h-4 w-4" />
                </Link>
                {trainingsOpen && (
                  <div className="absolute left-0 top-full pt-1">
                    <div className="w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800 animate-scale-in">
                      {categoryLinks.map((cat) => (
                        <Link key={cat.href} href={cat.href} className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-700">{cat.label}</Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400">{link.label}</Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {profile ? (
            <Link href={profile.role === 'admin' ? '/admin' : '/dashboard'} className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 sm:inline-block">Mon espace</Link>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 sm:inline-block">Connexion</Link>
              <Link href="/signup" className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 sm:inline-block">S&apos;inscrire</Link>
            </>
          )}
          <button onClick={() => setOpen(!open)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-700 lg:hidden animate-slide-up">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">{link.label}</Link>
            ))}
            <div className="mt-2 border-t border-slate-200 pt-2 dark:border-slate-700">
              {categoryLinks.map((cat) => (
                <Link key={cat.href} href={cat.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:bg-slate-800">{cat.label}</Link>
              ))}
            </div>
            {!profile && (
              <div className="mt-3 flex gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
                <Link href="/login" onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">Connexion</Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white">S&apos;inscrire</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
