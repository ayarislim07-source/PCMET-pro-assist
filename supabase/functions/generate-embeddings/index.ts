import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!OPENAI_API_KEY) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.[0]?.embedding ?? null;
  } catch { return null; }
}

async function fetchKBWithoutEmbeddings(): Promise<Array<{ id: string; question: string; answer: string; keywords: string }>> {
  const url = `${SUPABASE_URL}/rest/v1/knowledge_base?select=id,question,answer,keywords&embedding=is.null&is_approved=eq.true`;
  const res = await fetch(url, { headers: { "apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } });
  if (!res.ok) return [];
  return await res.json();
}

async function updateEmbedding(id: string, embedding: number[]): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_base?id=eq.${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
    body: JSON.stringify({ embedding }),
  });
  return res.ok;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") { return new Response(null, { status: 200, headers: corsHeaders }); }
  try {
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY is not configured." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const entries = await fetchKBWithoutEmbeddings();
    if (entries.length === 0) {
      return new Response(JSON.stringify({ message: "All entries already have embeddings.", processed: 0 }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    let processed = 0; let failed = 0;
    for (const entry of entries) {
      const text = `${entry.question} ${entry.answer} ${entry.keywords}`.trim();
      const embedding = await generateEmbedding(text);
      if (embedding) { const success = await updateEmbedding(entry.id, embedding); if (success) processed++; else failed++; }
      else { failed++; }
    }
    return new Response(JSON.stringify({ message: "Embeddings generated.", total: entries.length, processed, failed }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to generate embeddings.", details: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
