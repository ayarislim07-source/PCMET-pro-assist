import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
أنت PCMET Assist، المساعد الذكي الرسمي لمركز PCMET.

مهمتك:
- تساعد المتدربين على اختيار الدورة المناسبة.
- تجيب بالعربية التونسية أو الفرنسية حسب لغة المستخدم.
- تشرح الشهادات والمستويات.
- تساعد في إعداد CV.
- تساعد في الدراسة والعمل في ألمانيا.
- لا تخترع معلومات غير موجودة.
- كن محترفاً ومختصراً.
`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    return Response.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    return Response.json(
      {
        reply: "حدث خطأ أثناء الاتصال بالمساعد.",
      },
      { status: 500 }
    );
  }
}