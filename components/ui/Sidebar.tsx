'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, BookOpen, GraduationCap, FileText, Brain,
  MessageSquare, Users, BarChart3, Award, ClipboardList,
  LogOut, Menu, X, ChevronRight, Calendar, CreditCard, Bell,
  Database, Settings, Compass,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

const studentNav: NavItem[] = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/courses', label: 'Mes formations', icon: BookOpen },
  { href: '/dashboard/ai-guide', label: 'Guide IA', icon: MessageSquare },
  { href: '/dashboard/ai-tools', label: 'Outils IA', icon: Compass },
  { href: '/dashboard/level-test', label: 'Test de niveau', icon: Brain },
  { href: '/dashboard/cv-builder', label: 'CV Builder', icon: FileText },
  { href: '/dashboard/appointments', label: 'Rendez-vous', icon: Calendar },
  { href: '/dashboard/payments', label: 'Paiements', icon: CreditCard },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
];

const adminNav: NavItem[] = [
  { href: '/admin', label: 'Statistiques', icon: BarChart3 },
  { href: '/admin/students', label: 'Étudiants', icon: Users },
  { href: '/admin/courses', label: 'Formations', icon: BookOpen },
  { href: '/admin/registrations', label: 'Inscriptions', icon: ClipboardList },
  { href: '/admin/certificates', label: 'Certificats', icon: Award },
  { href: '/admin/payments', label: 'Paiements', icon: CreditCard },
  { href: '/admin/knowledge-base', label: 'Base de connaissances', icon: Database },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
];

const teacherNav: NavItem[] = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/courses', label: 'Mes cours', icon: BookOpen },
  { href: '/dashboard/appointments', label: 'Rendez-vous', icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const isAdmin = pathname.startsWith('/admin');
  const role = isAdmin ? 'admin' : profile?.role || 'student';
  const nav = isAdmin ? adminNav : role === 'teacher' ? teacherNav : studentNav;
  const basePath = isAdmin ? '/admin' : '/dashboard';

  const handleSignOut = async () => { await signOut(); router.push('/'); };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-600/20">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">PCMET</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Votre Guide</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== basePath && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'}`}>
              <Icon className={`h-5 w-5 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
              {item.label}
              {active && <ChevronRight className="ml-auto h-4 w-4 text-blue-600 dark:text-blue-400" />}
            </Link>
          );
        })}
        {profile?.role === 'admin' && !isAdmin && (
          <Link href="/admin" onClick={() => setOpen(false)} className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">
            <Settings className="h-5 w-5 text-slate-400" /> Espace Admin
          </Link>
        )}
      </nav>
      <div className="border-t border-slate-200 p-3 dark:border-slate-700">
        <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {(profile?.full_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{profile?.full_name || 'Utilisateur'}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{role === 'admin' ? 'Administrateur' : role === 'teacher' ? 'Formateur' : 'Étudiant'}</p>
          </div>
        </div>
        <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut className="h-5 w-5" /> Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 text-white"><GraduationCap className="h-4 w-4" /></div>
          <span className="font-bold text-slate-900 dark:text-white">PCMET</span>
        </div>
        <button onClick={() => setOpen(!open)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed left-0 top-0 z-50 h-full w-72 transform bg-white shadow-2xl transition-transform duration-300 dark:bg-slate-900 lg:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>{sidebarContent}</aside>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:block">{sidebarContent}</aside>
    </>
  );
}
