export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `
أنت PCMET Assist.

أنت المساعد الذكي الرسمي لمركز PCMET.

تجيب بالعربية التونسية أو الفرنسية حسب لغة المستخدم.

تساعد في:
- اختيار الدورات
- تعلم اللغات
- تكوين ألمانيا Ausbildung
- إعداد CV
- الشهادات
- التسجيل
- خدمات PCMET

لا تخترع معلومات غير صحيحة.
كن مختصراً واحترافياً.
            `,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    return Response.json({
      reply:
        data.choices?.[0]?.message?.content ??
        "عذراً، لم أتمكن من الإجابة.",
    });
  } catch (error) {
    return Response.json(
      {
        reply: "حدث خطأ في الاتصال بالمساعد.",
      },
      {
        status: 500,
      }
    );
  }
}