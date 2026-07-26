"use client";

import {
  Bot,
  Send,
  Sparkles,
  User,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from "react";

const suggestions = [
  "شنية أحسن دورة تناسبني؟",
  "نحب نقرا الألمانية",
  "عاوني نحضر CV",
  "كيفاش نجم نكمّل تكوين في ألمانيا؟",
];

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "مرحبا بيك 👋\nأنا PCMET Assist.\nكيفاش نجم نعاونك اليوم؟",
    },
  ]);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage() {
    if (!message.trim()) return;

    const text = message;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: text,
      },
    ]);

    setMessage("");

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ??
            "عذراً، لم أتمكن من الإجابة.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "حدث خطأ أثناء الاتصال بالخادم.",
        },
      ]);
    }

    setLoading(false);
  }

  function handleKeyDown(
    e: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col">

        <header className="border-b border-white/10 backdrop-blur">

          <div className="flex items-center justify-between px-6 py-5">

            <div className="flex items-center gap-4">

              <img
                src="/IMG_1198.jpeg"
                alt="PCMET"
                className="h-12 w-12 rounded-xl bg-white object-contain p-1"
              />

              <div>

                <h1 className="text-2xl font-bold">
                  PCMET Assist
                </h1>

                <p className="text-sm text-slate-400">
                  Votre assistant intelligent
                </p>

              </div>

            </div>

            <div className="hidden md:flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-cyan-300">

              <Sparkles className="h-4 w-4" />

              IA PCMET

            </div>

          </div>

        </header>
        <section className="flex flex-1 flex-col px-4 py-8 md:px-8">

          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">

            <div className="flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur">

              <div className="space-y-6 p-6">

                {messages.map((msg, index) => (

                  <div
                    key={index}
                    className={`flex ${
                      msg.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div
                      className={`flex max-w-[85%] gap-3 ${
                        msg.role === "user"
                          ? "flex-row-reverse"
                          : ""
                      }`}
                    >

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          msg.role === "assistant"
                            ? "bg-cyan-500"
                            : "bg-slate-700"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <Bot className="h-5 w-5" />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>

                      <div
                        className={`rounded-2xl px-5 py-4 whitespace-pre-wrap leading-7 ${
                          msg.role === "assistant"
                            ? "bg-slate-800 text-slate-100"
                            : "bg-cyan-500 text-white"
                        }`}
                      >
                        {msg.content}
                      </div>

                    </div>

                  </div>

                ))}

                {loading && (

                  <div className="flex">

                    <div className="flex gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500">

                        <Bot className="h-5 w-5" />

                      </div>

                      <div className="rounded-2xl bg-slate-800 px-5 py-4">

                        <div className="flex gap-2">

                          <span className="animate-bounce">•</span>

                          <span
                            className="animate-bounce"
                            style={{ animationDelay: ".2s" }}
                          >
                            •
                          </span>

                          <span
                            className="animate-bounce"
                            style={{ animationDelay: ".4s" }}
                          >
                            •
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                )}

                <div ref={bottomRef} />

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

              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-3 shadow-2xl">

                <div className="flex items-end gap-3">

                  <textarea
                    value={message}
                    onChange={(e) =>
                      setMessage(e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    rows={2}
                    placeholder="اكتب رسالتك..."
                    className="flex-1 resize-none bg-transparent px-2 py-2 text-white outline-none placeholder:text-slate-500"
                  />

                  <button
                    onClick={sendMessage}
                    disabled={loading}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 transition hover:bg-cyan-400 disabled:opacity-50"
                  >
                    <Send className="h-5 w-5 text-white" />
                  </button>

                </div>

              </div>

            </div>

          </div>

        </section>