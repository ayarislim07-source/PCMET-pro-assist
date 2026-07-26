import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const SYSTEM_PROMPT = `Tu es "PCMET Votre Guide", l'assistant intelligent officiel de PCMET Horizon Qualité, un centre de formation et d'orientation.

DOMAINES D'EXPERTISE PCMET (TU NE RÉPONDS QU'À CES SUJETS):

1. CENTRE DE LANGUES
   - Cours d'allemand, français, anglais, italien (niveaux A1 à B2)
   - Tests de niveau et évaluation linguistique
   - Préparation à l'Ausbildung (formation professionnelle en Allemagne)
   - Préparation aux études à l'étranger (TOEFL, IELTS, TestDaF, DELF)
   - Horaires, prix et certifications linguistiques

2. CENTRE DE PREMIERS SECOURS
   - Formation PSC1 (Premiers Secours Civiques, 10h, 120€)
   - Formation SST (Sauveteur Secouriste du Travail, 14h, 180€)
   - Formation BLS (Basic Life Support, certification internationale)
   - RCP, DAE/défibrillateur, premiers secours pédiatriques
   - Recyclages et certifications internationales

3. FORMATION PROFESSIONNELLE
   - Formation continue et corporate
   - Management, gestion de projet agile, marketing digital
   - Soft skills (communication, leadership, gestion du temps)
   - Bureautique, développement web, cybersécurité

CAPACITÉS SUPPLÉMENTAIRES:
- Recommander le meilleur cours PCMET selon le profil de l'étudiant (niveau, objectif, pays, éducation)
- Générer des CV professionnels (formats Europass, Modern, ATS)
- Rédiger des lettres de motivation personnalisées
- Expliquer les différences entre les certifications PCMET
- Recommander des parcours d'apprentissage personnalisés
- Estimer la durée et le coût des parcours
- Aider à la préparation d'entretiens
- Suivre le progrès des étudiants

RÈGLES STRICTES (NE JAMAIS VIOLER):
1. Tu ne réponds QUE sur les activités et services de PCMET. Si la question ne concerne pas PCMET ou la formation, refuse poliment.
2. Tu ne JAMAIS inventes d'information. Si la réponse n'est pas dans le CONTEXTE fourni, dis honnêtement que tu ne sais pas et que la question sera transmise à l'équipe.
3. Toute recommandation DOIT prioriser les programmes et services de PCMET.
4. Réponds dans la langue de l'utilisateur (français, arabe ou anglais).
5. Sois professionnel, bienveillant et encourageant.
6. Ne mentionne jamais "CONTEXTE", "base de données" ou "système". Présente les informations naturellement.
7. Quand tu recommandes un parcours, inclus l'estimation de durée et de coût.
8. Pour les CV et lettres de motivation, propose une structure claire et professionnelle.`;

interface ChatRequest {
  question: string;
  language: "fr" | "ar" | "en";
  userId?: string | null;
  action?: "chat" | "recommend" | "generate_cv" | "generate_letter" | "interview_prep" | "learning_path";
  studentProfile?: {
    currentLevel?: string;
    careerObjective?: string;
    targetCountry?: string;
    previousEducation?: string;
    preferredCategory?: string;
  };
  cvData?: {
    fullName?: string;
    targetPosition?: string;
    experience?: string;
    education?: string;
    skills?: string;
  };
  letterData?: {
    targetPosition?: string;
    targetCompany?: string;
    applicantName?: string;
    keySkills?: string;
    motivation?: string;
  };
}

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

async function generateAIResponse(
  question: string,
  context: string,
  language: string,
  action: string,
  extraInstructions: string = ""
): Promise<string | null> {
  if (!OPENAI_API_KEY) return null;
  try {
    const langInstruction =
      language === "ar" ? "Réponds en arabe." : language === "en" ? "Respond in English." : "Réponds en français.";

    const actionInstructions: Record<string, string> = {
      recommend: `L'utilisateur demande une recommandation de formation. Analyse son profil et recommande le ou les meilleurs cours PCMET. Inclus: le cours recommandé, la justification, la durée estimée, le coût estimé, et les prochaines étapes. Priorise TOUJOURS les formations PCMET.`,
      generate_cv: `Génère un CV professionnel structuré pour l'utilisateur basé sur les informations fournies. Utilise un format clair avec sections: En-tête (nom, contact), Profil professionnel, Expérience, Formation, Compétences, Langues. Suggère des améliorations si les informations sont incomplètes.`,
      generate_letter: `Rédige une lettre de motivation professionnelle et personnalisée. Structure: introduction (qui vous êtes et pourquoi vous postulez), développement (vos compétences et motivations alignées avec le poste), conclusion (demande d'entretien). Ton professionnel et convaincant.`,
      interview_prep: `Prépare l'utilisateur à un entretien. Fournis: 5-7 questions fréquentes pour le type de poste/formation visé, des conseils sur la posture et la communication, des suggestions de réponses modèles, et des erreurs à éviter.`,
      learning_path: `Construis un parcours d'apprentissage personnalisé PCMET. Inclus: les étapes dans l'ordre, les cours PCMET recommandés à chaque étape, la durée totale estimée, le coût total estimé, et les objectifs intermédiaires. Priorise TOUJOURS les formations PCMET.`,
    };

    const specificInstructions = actionInstructions[action] || "";

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}\n\n${langInstruction}` },
          { role: "system", content: `CONTEXTE PCMET (informations validées):\n${context}` },
          { role: "system", content: `${specificInstructions}\n${extraInstructions}` },
          { role: "user", content: question },
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch { return null; }
}

async function callSupabaseRPC(fn: string, params: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) return null;
  return await res.json();
}

async function insertSupabase(table: string, data: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(data),
  });
  return res.ok;
}

async function fetchCourses(category?: string): Promise<string> {
  let url = `${SUPABASE_URL}/rest/v1/courses?select=title,description,category,level,price,duration_hours,schedule,teacher_name&is_published=eq.true`;
  if (category) url += `&category=eq.${category}`;
  const res = await fetch(url, {
    headers: { "apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
  });
  if (!res.ok) return "";
  const courses = await res.json();
  if (!Array.isArray(courses) || courses.length === 0) return "";
  return courses.map((c: any) =>
    `- ${c.title} (${c.category}, ${c.level}, ${c.duration_hours}h, ${c.price}€${c.schedule ? `, ${c.schedule}` : ""}${c.teacher_name ? `, par ${c.teacher_name}` : ""})`
  ).join("\n");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as ChatRequest;
    const { question, language, userId, action = "chat", studentProfile, cvData, letterData } = body;

    if (!question || question.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Question is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lang = language || "fr";
    const trimmedQuestion = question.trim();

    // === STEP 1: Generate embedding ===
    const embedding = await generateEmbedding(trimmedQuestion);

    // === STEP 2: Vector similarity search ===
    let vectorMatches: any[] | null = null;
    if (embedding) {
      vectorMatches = await callSupabaseRPC("match_knowledge_base", {
        query_embedding: embedding, query_language: lang, match_threshold: 0.72, match_count: 5,
      });
    }

    // === STEP 3: Full-text search fallback ===
    const ftsMatches = await callSupabaseRPC("search_knowledge_base_fts", {
      query_text: trimmedQuestion, query_language: lang, match_count: 5,
    });

    // === STEP 4: Merge results ===
    const allMatches = new Map<string, any>();
    if (vectorMatches && Array.isArray(vectorMatches)) {
      for (const m of vectorMatches) allMatches.set(m.id, m);
    }
    if (ftsMatches && Array.isArray(ftsMatches)) {
      for (const m of ftsMatches) if (!allMatches.has(m.id)) allMatches.set(m.id, m);
    }
    const matches = Array.from(allMatches.values());

    // === STEP 5: Build context (KB matches + course catalog) ===
    let contextText = "";
    if (matches.length > 0) {
      contextText = "INFORMATIONS DE LA BASE DE CONNAISSANCES:\n" +
        matches.map((m, i) => `[${i + 1}] Q: ${m.question}\n    R: ${m.answer}`).join("\n\n");
    }

    // For recommendation/learning path actions, also fetch course catalog
    if (action === "recommend" || action === "learning_path") {
      const courseCategory = studentProfile?.preferredCategory || undefined;
      const coursesContext = await fetchCourses(courseCategory);
      if (coursesContext) {
        contextText += "\n\nCATALOGUE DES FORMATIONS PCMET:\n" + coursesContext;
      }
    }

    // For CV/letter/interview, add student profile context
    let extraInstructions = "";
    if (action === "recommend" || action === "learning_path") {
      if (studentProfile) {
        extraInstructions = `PROFIL DE L'ÉTUDIANT:\n- Niveau actuel: ${studentProfile.currentLevel || "Non précisé"}\n- Objectif professionnel: ${studentProfile.careerObjective || "Non précisé"}\n- Pays de destination: ${studentProfile.targetCountry || "Non précisé"}\n- Éducation précédente: ${studentProfile.previousEducation || "Non précisé"}\n- Domaine préféré: ${studentProfile.preferredCategory || "Non précisé"}`;
      }
    } else if (action === "generate_cv") {
      if (cvData) {
        extraInstructions = `DONNÉES CV:\n- Nom: ${cvData.fullName || "À compléter"}\n- Poste visé: ${cvData.targetPosition || "À compléter"}\n- Expérience: ${cvData.experience || "À compléter"}\n- Formation: ${cvData.education || "À compléter"}\n- Compétences: ${cvData.skills || "À compléter"}`;
      }
    } else if (action === "generate_letter") {
      if (letterData) {
        extraInstructions = `DONNÉES LETTRE:\n- Poste visé: ${letterData.targetPosition || "À compléter"}\n- Entreprise: ${letterData.targetCompany || "À compléter"}\n- Nom du candidat: ${letterData.applicantName || "À compléter"}\n- Compétences clés: ${letterData.keySkills || "À compléter"}\n- Motivation: ${letterData.motivation || "À compléter"}`;
      }
    } else if (action === "interview_prep") {
      extraInstructions = `Prépare l'utilisateur pour un entretien lié à: ${trimmedQuestion}`;
    }

    // === STEP 6: Generate response ===
    const hasContext = matches.length > 0 || contextText.length > 0;

    if (hasContext || OPENAI_API_KEY) {
      let answer: string | null = null;

      if (OPENAI_API_KEY) {
        answer = await generateAIResponse(trimmedQuestion, contextText || "Aucune information spécifique trouvée. Réponds selon tes connaissances générales sur PCMET.", lang, action, extraInstructions);
      }

      // Fallback: return best KB match directly
      if (!answer && matches.length > 0) {
        answer = matches[0].answer;
      }

      if (answer) {
        // Log analytics
        await callSupabaseRPC("log_question", {
          p_question: trimmedQuestion, p_language: lang,
          p_category: matches[0]?.category ?? null,
          p_was_answered: true,
          p_source: OPENAI_API_KEY ? "ai_fallback" : "knowledge_base",
          p_answer_snippet: answer, p_user_id: userId ?? null,
        });

        if (matches[0]?.id) {
          await callSupabaseRPC("increment_kb_match_count", { target_id: matches[0].id });
        }

        return new Response(JSON.stringify({
          answer, source: "knowledge_base",
          matchedQuestions: matches.map((m: any) => ({
            question: m.question, category: m.category, similarity: m.similarity,
          })),
        }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // === STEP 7: No answer found — save as unanswered ===
    await callSupabaseRPC("log_question", {
      p_question: trimmedQuestion, p_language: lang, p_category: null,
      p_was_answered: false, p_source: "unanswered", p_answer_snippet: "", p_user_id: userId ?? null,
    });

    await insertSupabase("unanswered_questions", {
      question: trimmedQuestion, language: lang, status: "pending",
      ...(userId ? { user_id: userId } : {}),
    });

    const fallbackMessage =
      lang === "ar" ? "ليس لدي إجابة على هذا السؤال بعد، لكنني حفظته. سيرد فريقنا قريباً! يمكنك أيضاً مراجعة صفحة الأسئلة الشائعة أو الاتصال بنا مباشرة."
      : lang === "en" ? "I don't have the answer to this question yet, but I've saved it. Our team will respond soon! You can also check our FAQ page or contact us directly."
      : "Je n'ai pas encore la réponse à cette question, mais je l'ai enregistrée et transmise à notre équipe. Vous recevrez une réponse bientôt. En attendant, n'hésitez pas à consulter notre FAQ ou à nous contacter directement.";

    return new Response(JSON.stringify({
      answer: fallbackMessage, source: "unanswered", saved: true,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({
      error: "Une erreur est survenue. Veuillez réessayer.", details: error.message,
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
