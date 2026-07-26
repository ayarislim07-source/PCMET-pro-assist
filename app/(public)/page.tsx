"use client";

import { useState } from "react";
import { Send, Bot, Sparkles } from "lucide-react";

const suggestions = [
  "شنية أحسن دورة تناسبني؟",
  "نحب نقرا الألمانية",
  "عاوني نحضر CV",
  "كيفاش نجم نكمّل تكوين في ألمانيا؟",
];

export default function HomePage() {
  const [message, setMessage] = useState("");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 backdrop-blur">
          <div className="flex items-center gap-4">
            <img
              src="/IMG_1198.jpeg"
              alt="PCMET"
              className="h-12 w-12 rounded-xl bg-white p-1 object-contain"
            />

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                PCMET Assist
              </h1>
              <p className="text-sm text-slate-400">
                Votre assistant intelligent
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 md:flex">
            <Sparkles className="h-4 w-4" />
            IA PCMET
          </div>
        </header>

        <section className="flex flex-1 flex-col px-4 py-8 md:px-8">
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500">
                <Bot className="h-6 w-6 text-white" />
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur">
                <p className="text-lg leading-8 text-slate-100">
                  مرحبا بيك 👋
                  <br />
                  أنا <span className="font-semibold text-cyan-400">PCMET Assist</span>.
                  <br />
                  نعاونك تختار التكوين المناسب، نفسرلك الشهادات،
                  نجاوبك على أسئلتك ونرافقك خطوة بخطوة.
                </p>
              </div>
            </div>

            <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
              <div className="flex h-[420px] items-center justify-center px-6 text-center text-slate-500">
                اكتب سؤالك في الأسفل وابدأ المحادثة مع PCMET Assist.
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-slate-400">
                Suggestions
              </p>

              <div className="flex flex-wrap gap-3">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    onClick={() => setMessage(item)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:border-cyan-400 hover:bg-cyan-500/10"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-end gap-3 rounded-3xl border border-white/10 bg-slate-900/80 p-3 shadow-2xl">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب رسالتك..."
                  rows={2}
                  className="flex-1 resize-none bg-transparent px-2 py-2 text-white outline-none placeholder:text-slate-500"
                />

                <button
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 transition hover:bg-cyan-400"
                >
                  <Send className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}