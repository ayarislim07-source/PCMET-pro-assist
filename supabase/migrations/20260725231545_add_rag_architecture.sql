/*
# PCMET AI Guide — RAG Architecture

Production-ready Retrieval-Augmented Generation system for the PCMET AI Guide.
Uses pgvector for semantic search, full-text search as fallback, and tracks
question analytics for continuous improvement.
*/

-- ============ ENABLE PGVECTOR ============
CREATE EXTENSION IF NOT EXISTS vector;

-- ============ KNOWLEDGE BASE: add embedding + match_count ============
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_base' AND column_name = 'embedding') THEN
    ALTER TABLE knowledge_base ADD COLUMN embedding vector(1536);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_base' AND column_name = 'match_count') THEN
    ALTER TABLE knowledge_base ADD COLUMN match_count int DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_base' AND column_name = 'updated_at') THEN
    ALTER TABLE knowledge_base ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

ALTER TABLE knowledge_base DROP CONSTRAINT IF EXISTS knowledge_base_category_check;
ALTER TABLE knowledge_base ADD CONSTRAINT knowledge_base_category_check
  CHECK (category IN ('langues','premiers_secours','informatique','formation_continue','certificats','prix','administration','faq','general'));

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS knowledge_base_embedding_idx
  ON knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS knowledge_base_fts_idx
  ON knowledge_base USING gin (to_tsvector('french', coalesce(question, '') || ' ' || coalesce(answer, '') || ' ' || coalesce(keywords, '')));

-- ============ QUESTION ANALYTICS TABLE ============
CREATE TABLE IF NOT EXISTS question_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  question_normalized text NOT NULL,
  language text DEFAULT 'fr',
  category text,
  was_answered boolean DEFAULT false,
  source text DEFAULT 'knowledge_base' CHECK (source IN ('knowledge_base','ai_fallback','unanswered')),
  answer_snippet text DEFAULT '',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE question_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_analytics" ON question_analytics;
CREATE POLICY "admin_select_analytics" ON question_analytics FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "anon_insert_analytics" ON question_analytics;
CREATE POLICY "anon_insert_analytics" ON question_analytics FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_analytics_created ON question_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_normalized ON question_analytics(question_normalized);

-- ============ MATCH FUNCTION: vector similarity search ============
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding vector(1536),
  query_language text DEFAULT 'fr',
  match_threshold float DEFAULT 0.72,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  question text,
  answer text,
  category text,
  language text,
  keywords text,
  similarity float
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.question,
    kb.answer,
    kb.category,
    kb.language,
    kb.keywords,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE kb.is_approved = true
    AND (kb.language = query_language OR query_language IS NULL)
    AND kb.embedding IS NOT NULL
    AND 1 - (kb.embedding <=> query_embedding) >= match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============ FTS FUNCTION: full-text search fallback ============
CREATE OR REPLACE FUNCTION search_knowledge_base_fts(
  query_text text,
  query_language text DEFAULT 'fr',
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  question text,
  answer text,
  category text,
  language text,
  keywords text,
  rank real
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.question,
    kb.answer,
    kb.category,
    kb.language,
    kb.keywords,
    ts_rank(to_tsvector('french', coalesce(kb.question, '') || ' ' || coalesce(kb.answer, '') || ' ' || coalesce(kb.keywords, '')), plainto_tsquery('french', query_text)) AS rank
  FROM knowledge_base kb
  WHERE kb.is_approved = true
    AND (kb.language = query_language OR query_language IS NULL)
    AND to_tsvector('french', coalesce(kb.question, '') || ' ' || coalesce(kb.answer, '') || ' ' || coalesce(kb.keywords, '')) @@ plainto_tsquery('french', query_text)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;

-- ============ ANALYTICS LOG FUNCTION ============
CREATE OR REPLACE FUNCTION log_question(
  p_question text,
  p_language text DEFAULT 'fr',
  p_category text DEFAULT NULL,
  p_was_answered boolean DEFAULT false,
  p_source text DEFAULT 'unanswered',
  p_answer_snippet text DEFAULT '',
  p_user_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
  v_normalized text;
BEGIN
  v_normalized := lower(trim(regexp_replace(p_question, '[^a-zA-Z0-9 ]', ' ', 'g')));
  v_normalized := regexp_replace(v_normalized, '\s+', ' ', 'g');

  INSERT INTO question_analytics (question, question_normalized, language, category, was_answered, source, answer_snippet, user_id)
  VALUES (p_question, v_normalized, p_language, p_category, p_was_answered, p_source, left(p_answer_snippet, 500), p_user_id)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- ============ UPDATED_AT TRIGGER ============
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS kb_updated_at ON knowledge_base;
CREATE TRIGGER kb_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============ INCREMENT MATCH_COUNT ============
CREATE OR REPLACE FUNCTION increment_kb_match_count(target_id uuid)
RETURNS void
LANGUAGE sql SECURITY DEFINER
AS $$
  UPDATE knowledge_base SET match_count = match_count + 1 WHERE id = target_id;
$$;

-- ============ SEED ADDITIONAL KB ENTRIES ============
INSERT INTO knowledge_base (question, answer, category, language, keywords) VALUES
('Quels cours de langues proposez-vous ?', 'PCMET propose des cours en 4 langues : anglais, espagnol, allemand et italien. Les niveaux vont de A1 (débutant) à B2 (avancé). Des tests de niveau gratuits sont disponibles en ligne pour vous orienter.', 'langues', 'fr', 'langue cours anglais espagnol allemand italien niveau'),
('Quels sont les prérequis pour les cours d''informatique ?', 'Aucun prérequis pour la bureautique. Pour le développement web, des bases en informatique sont recommandées. Pour la cybersécurité, des connaissances en réseaux sont attendues.', 'informatique', 'fr', 'informatique prérequis bureautique développement cybersécurité réseau'),
('Comment se déroule une formation PSC1 ?', 'La formation PSC1 dure 10 heures sur une journée (samedi 9h-17h). Elle combine théorie et pratique : alerte, protection, victime inconsciente, RCP, défibrillation. Le certificat est délivré en fin de session.', 'premiers_secours', 'fr', 'psc1 secours formation déroulement durée certificat rcp'),
('Combien coûte la formation SST ?', 'La formation SST (Sauveteur Secouriste du Travail) coûte 180€ pour 14 heures de formation sur 2 jours. Le certificat est reconnu en entreprise.', 'prix', 'fr', 'prix coût sst tarif sauveteur secouriste travail'),
('Comment vérifier l''authenticité d''un certificat ?', 'Chaque certificat PCMET possède un numéro unique et un QR code. Scannez le QR code avec votre téléphone ou rendez-vous sur notre page de vérification et entrez le numéro du certificat.', 'certificats', 'fr', 'certificat vérifier authentique qr code numéro'),
('Quels sont les documents requis pour s''inscrire ?', 'Pour vous inscrire, vous devez fournir une pièce d''identité et un justificatif de domicile. Selon la formation, un CV ou une lettre de motivation peut être demandé.', 'administration', 'fr', 'document inscription pièce identité justificatif cv'),
('Puis-je payer en plusieurs fois ?', 'Oui, nous proposons le paiement en 3 fois sans frais. Vous pouvez choisir cette option lors de l''inscription. Nous acceptons les cartes bancaires, virements et chèques.', 'prix', 'fr', 'paiement fois facilité carte virement chèque'),
('Quelle est la durée de la formation en management ?', 'La formation en management d''équipe dure 24 heures réparties sur 6 vendredis de 14h à 18h. Elle couvre le leadership, la communication managériale et la performance.', 'formation_continue', 'fr', 'management durée formation continue leadership'),
('Proposez-vous des formations en ligne ?', 'Oui, PCMET propose des formations en présentiel et à distance. Les cours en ligne sont accessibles via notre plateforme avec un support pédagogique personnalisé et des sessions de live.', 'faq', 'fr', 'en ligne distance online présentiel plateforme'),
('Comment fonctionne le Guide IA ?', 'Le Guide IA PCMET recherche d''abord dans sa base de connaissances. S''il trouve une réponse, il vous la donne immédiatement. Sinon, il enregistre votre question et notre équipe vous répond. Plus l''assistant est utilisé, plus il devient intelligent.', 'faq', 'fr', 'guide ia assistant intelligent base connaissance')
ON CONFLICT DO NOTHING;
