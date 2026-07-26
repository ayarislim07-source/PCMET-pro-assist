import { Newspaper, Calendar } from 'lucide-react';

const news = [
  { title: 'Nouvelle session PSC1 en septembre', date: '15 Septembre 2025', excerpt: 'PCMET organise une nouvelle session de formation PSC1 les samedis de septembre. Inscriptions ouvertes.', tag: 'Premiers secours' },
  { title: 'Lancement de notre Guide IA', date: '1 Septembre 2025', excerpt: 'Découvrez PCMET Votre Guide, notre assistant intelligent qui répond à vos questions 24/7 et vous oriente dans votre parcours.', tag: 'Innovation' },
  { title: 'Nouveau cours de cybersécurité', date: '20 Août 2025', excerpt: 'Une formation complète en réseaux et cybersécurité est désormais disponible dans notre catalogue informatique.', tag: 'Informatique' },
  { title: 'Partenariat avec des entreprises locales', date: '10 Août 2025', excerpt: 'PCMET Horizon Qualité signe des partenariats pour faciliter l\u2019insertion professionnelle de ses apprenants.', tag: 'Partenariat' },
  { title: 'Tests de niveau en 4 langues', date: '5 Août 2025', excerpt: 'Évaluez votre niveau en anglais, français, allemand et italien avec nos tests en ligne gratuits.', tag: 'Langues' },
  { title: 'Certificats numériques avec QR code', date: '1 Août 2025', excerpt: 'Tous nos certificats sont désormais numériques et vérifiables instantanément via QR code.', tag: 'Certification' },
];

export default function NewsPage() {
  return (
    <div className="dark:bg-slate-950">
      <section className="bg-gradient-to-b from-sky-50 to-white py-16 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Newspaper className="mx-auto h-10 w-10 text-blue-600 dark:text-blue-400" />
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">Actualités</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Les dernières nouvelles de PCMET Horizon Qualité.</p>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <article key={item.title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <span className="mb-3 inline-block w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">{item.tag}</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-400">{item.excerpt}</p>
                <p className="mt-4 flex items-center gap-2 text-xs text-slate-400"><Calendar className="h-4 w-4" /> {item.date}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
