-- ============================================================
-- BlackOut Pub — Schema Supabase
-- Esegui questo script nell'SQL Editor di Supabase
-- ============================================================

-- Tabella birre (catalogo completo: spina + lattina)
CREATE TABLE IF NOT EXISTS birre (
  id                  INTEGER PRIMARY KEY,
  formato             TEXT    NOT NULL CHECK (formato IN ('spina', 'lattina')),
  nome                TEXT    NOT NULL,
  birrificio          TEXT    NOT NULL,
  tipologia           TEXT,
  gradazione_alcolica NUMERIC(4,1) NOT NULL,
  prezzo_piccola      NUMERIC(5,2),          -- solo spina
  prezzo_media        NUMERIC(5,2),          -- solo spina
  prezzo_unico        NUMERIC(5,2),          -- solo lattina
  disponibile         BOOLEAN NOT NULL DEFAULT TRUE,
  gluten_free         BOOLEAN NOT NULL DEFAULT FALSE,
  immagine_url        TEXT
);

-- Tabella spine (8 tap attivi)
CREATE TABLE IF NOT EXISTS spine (
  numero_spina  INTEGER PRIMARY KEY CHECK (numero_spina BETWEEN 1 AND 8),
  birra_id      INTEGER REFERENCES birre(id) ON DELETE SET NULL
);

-- Permessi per anon key (lettura pubblica, scrittura solo server)
ALTER TABLE birre  ENABLE ROW LEVEL SECURITY;
ALTER TABLE spine  ENABLE ROW LEVEL SECURITY;

-- Policy: chiunque può leggere
CREATE POLICY "Lettura pubblica birre"
  ON birre FOR SELECT USING (true);

CREATE POLICY "Lettura pubblica spine"
  ON spine FOR SELECT USING (true);

-- Policy: solo il service_role (server) può scrivere
CREATE POLICY "Scrittura server birre"
  ON birre FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Scrittura server spine"
  ON spine FOR ALL USING (auth.role() = 'service_role');
