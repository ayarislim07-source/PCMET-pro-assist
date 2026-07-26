'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  { q: 'Comment s\'inscrire à une formation ?', a: 'Créez un compte sur notre plateforme, choisissez votre formation, remplissez le formulaire d\'inscription en ligne, téléchargez vos documents et suivez votre candidature dans votre espace étudiant.' },
  { q: 'Quels sont les modes de paiement acceptés ?', a: 'Nous acceptons les paiements par carte bancaire, virement et chèque. Des facilités de paiement en 3x sans frais sont disponibles.' },
  { q: 'Les formations sont-elles certifiantes ?', a: 'Oui, toutes nos formations débouchent sur une certification reconnue : PSC1, SST pour les premiers secours, et attestations de formation pour les autres domaines.' },
  { q: 'Proposez-vous des cours en ligne ?', a: 'Oui, nous proposons des formations en présentiel et à distance. Les cours en ligne sont accessibles via notre plateforme avec un support pédagogique personnalisé.' },
  { q: 'Comment obtenir un certificat ?', a: 'Le certificat est délivré après la completion de la formation et la réussite de l\'évaluation. Chaque certificat possède un numéro unique et un QR code de vérification.' },
  { q: 'Quelles langues enseignez-vous ?', a: 'Nous enseignons 4 langues : l\'anglais, l\'espagnol, l\'allemand et l\'italien, du niveau débutant (A1) au niveau avancé (B2).' },
  { q: 'Comment réserver un rendez-vous ?', a: 'Vous pouvez réserver un rendez-vous avec un conseiller ou un formateur directement depuis votre espace étudiant dans la section Rendez-vous.' },
  { q: 'Le Guide IA est-il disponible 24/7 ?', a: 'Oui, PCMET Votre Guide est disponible 24h/24 et 7j/7. S\'il ne connaît pas la réponse, votre question est transmise à notre équipe qui vous répondra rapidement.' },
  { q: 'Comment vérifier un certificat ?', a: 'Chaque certificat possède un QR code unique. Scannez le QR code ou utilisez notre page de vérification avec le numéro du certificat.' },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="dark:bg-slate-950">
      <section className="bg-gradient-to-b from-sky-50 to-white py-16 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <HelpCircle className="mx-auto h-10 w-10 text-blue-600 dark:text-blue-400" />
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">Questions fréquentes</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Tout ce que vous devez savoir sur PCMET Votre Guide.</p>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="flex w-full items-center justify-between px-6 py-4 text-left">
                  <span className="font-semibold text-slate-900 dark:text-white">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
                </button>
                {openIndex === i && <div className="px-6 pb-4 text-sm text-slate-600 dark:text-slate-400 animate-slide-up">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
