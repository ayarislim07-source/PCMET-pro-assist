'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1000);
  };

  return (
    <div className="dark:bg-slate-950">
      <section className="bg-gradient-to-b from-sky-50 to-white py-16 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Mail className="mx-auto h-10 w-10 text-blue-600 dark:text-blue-400" />
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">Contactez-nous</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Une question ? Notre équipe vous répond sous 24h.</p>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6">
              {[{ icon: Mail, title: 'Email', text: 'contact@pcmet-horizon-qualite.com' }, { icon: Phone, title: 'Téléphone', text: '+33 1 23 45 67 89' }, { icon: MapPin, title: 'Adresse', text: '15 Rue de la Formation, 75001 Paris' }].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h3 className="mt-3 font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.text}</p>
                  </div>
                );
              })}
            </div>
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-green-200 bg-green-50 p-12 text-center dark:border-green-900 dark:bg-green-950/30">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                  <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Message envoyé !</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Nous vous répondrons sous 24h.</p>
                  <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>Envoyer un autre message</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-800">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Nom complet" placeholder="Votre nom" required />
                    <Input label="Email" type="email" placeholder="vous@email.com" required />
                  </div>
                  <Input label="Téléphone" type="tel" placeholder="+33 6 12 34 56 78" />
                  <Input label="Sujet" placeholder="Objet de votre message" required />
                  <Textarea label="Message" rows={5} placeholder="Votre message..." required />
                  <Button type="submit" disabled={loading} className="w-full">{loading ? 'Envoi...' : 'Envoyer le message'}{!loading && <Send className="h-4 w-4" />}</Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
