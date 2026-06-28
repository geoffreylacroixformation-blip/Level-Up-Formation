-- Table cours
CREATE TABLE IF NOT EXISTS cours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  titre TEXT NOT NULL,
  niveau TEXT NOT NULL CHECK (niveau IN ('LVL1', 'LVL2', 'LVL3')),
  modules JSONB DEFAULT '[]'::jsonb,
  prix NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table progression
CREATE TABLE IF NOT EXISTS progression (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cours_id UUID REFERENCES cours(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  quiz_score NUMERIC DEFAULT 0,
  PRIMARY KEY (user_id, cours_id, module_id)
);

-- Activer RLS (Row Level Security)
ALTER TABLE cours ENABLE ROW LEVEL SECURITY;
ALTER TABLE progression ENABLE ROW LEVEL SECURITY;

-- Autoriser lecture publique des cours
CREATE POLICY "Cours visibles par tous" ON cours FOR SELECT USING (true);
CREATE POLICY "Lecture progression utilisateur" ON progression FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "MAJ progression utilisateur" ON progression FOR ALL USING (auth.uid() = user_id);

-- Insérer les cours existants
INSERT INTO cours (slug, titre, niveau, prix) VALUES
  ('securite-fondamentaux', 'Sécurité Fondamentaux', 'LVL1', 49),
  ('securisation-reseaux', 'Sécurisation des Réseaux', 'LVL1', 49),
  ('linux-securite', 'Linux Sécurité', 'LVL2', 89),
  ('pentest-web', 'Pentest Web', 'LVL2', 89),
  ('osint-techniques', 'OSINT Techniques', 'LVL3', 149),
  ('analyse-malware', 'Analyse Malware', 'LVL3', 149)
ON CONFLICT (slug) DO NOTHING;

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
