import Link from 'next/link';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const footerLinks = {
  'Formations': [
    { href: '/trainings/langues', label: 'Langues' },
    { href: '/trainings/premiers-secours', label: 'Premiers secours' },
    { href: '/trainings/informatique', label: 'Informatique' },
    { href: '/trainings/formation-continue', label: 'Formation continue' },
  ],
  'Plateforme': [
    { href: '/login', label: 'Connexion' },
    { href: '/signup', label: 'Inscription' },
    { href: '/dashboard', label: 'Espace étudiant' },
    { href: '/dashboard/ai-guide', label: 'Guide IA' },
  ],
  'Informations': [
    { href: '/about', label: 'À propos' },
    { href: '/news', label: 'Actualités' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-900 dark:text-white">PCMET Votre Guide</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">PCMET Horizon Qualité</span>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm text-slate-600 dark:text-slate-400">Votre partenaire vers la réussite. Formation et orientation professionnelle pour tous.</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-blue-600" /> contact@pcmet-horizon-qualite.com</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-blue-600" /> +33 1 23 45 67 89</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-600" /> 15 Rue de la Formation, Paris</p>
            </div>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}><Link href={link.href} className="text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row">
          <p className="text-xs text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} PCMET Horizon Qualité. Tous droits réservés.</p>
          <div className="flex gap-3">
            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-blue-600 dark:hover:bg-slate-800"><Icon className="h-4 w-4" /></a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
