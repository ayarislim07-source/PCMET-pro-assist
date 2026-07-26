import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-blue-600 to-sky-500 p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm"><GraduationCap className="h-5 w-5" /></div>
          <div><span className="block text-sm font-bold text-white">PCMET</span><span className="block text-xs text-blue-100">Votre Guide</span></div>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-white">Votre partenaire vers la réussite</h2>
          <p className="mt-4 text-lg text-blue-50">Formations en langues, premiers secours, informatique et formation continue. Certifications reconnues et accompagnement personnalisé.</p>
          <div className="mt-8 flex gap-8">
            <div><p className="text-3xl font-extrabold text-white">12+</p><p className="text-sm text-blue-100">Formations</p></div>
            <div><p className="text-3xl font-extrabold text-white">5000+</p><p className="text-sm text-blue-100">Apprenants</p></div>
            <div><p className="text-3xl font-extrabold text-white">4</p><p className="text-sm text-blue-100">Langues</p></div>
          </div>
        </div>
        <p className="text-sm text-blue-100">© {new Date().getFullYear()} PCMET Horizon Qualité</p>
      </div>
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white"><GraduationCap className="h-5 w-5" /></div>
            <span className="font-bold text-slate-900 dark:text-white">PCMET Votre Guide</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
