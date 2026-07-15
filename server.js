require('dotenv').config();
const express    = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const helmet     = require('helmet');
const path       = require('path');
const fs         = require('fs');
const { createClient } = require('@supabase/supabase-js');

const PORT           = process.env.PORT           || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SUPABASE_URL   = process.env.SUPABASE_URL;
const SUPABASE_KEY   = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[FATAL] SUPABASE_URL e SUPABASE_KEY sono obbligatorie');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// =============================================================================
// SEED DATA — usato solo se le tabelle sono vuote
// =============================================================================

const SEED_BIRRE = [
  { id: 1,  formato: 'spina', nome: 'URTYP',         birrificio: 'PAULANER',            tipologia: 'Helles',       gradazione_alcolica: 5.5, prezzo_piccola: 3.00, prezzo_media: 4.50, disponibile: true, immagine_url: '/images/paulaner.png',          prezzo_unico: null, gluten_free: false },
  { id: 2,  formato: 'spina', nome: 'RAPID',         birrificio: 'BREWORT',             tipologia: 'Lager',        gradazione_alcolica: 5.3, prezzo_piccola: 3.50, prezzo_media: 5.00, disponibile: true, immagine_url: null,                            prezzo_unico: null, gluten_free: false },
  { id: 3,  formato: 'spina', nome: 'ESTIVALE',      birrificio: 'LA RULLES',           tipologia: 'Saison',       gradazione_alcolica: 5.2, prezzo_piccola: 4.00, prezzo_media: 6.00, disponibile: true, immagine_url: null,                            prezzo_unico: null, gluten_free: false },
  { id: 4,  formato: 'spina', nome: 'BOCK',          birrificio: 'BANDIGA',             tipologia: 'Bock',         gradazione_alcolica: 6.2, prezzo_piccola: 4.00, prezzo_media: 6.00, disponibile: true, immagine_url: null,                            prezzo_unico: null, gluten_free: false },
  { id: 5,  formato: 'spina', nome: 'STOUT',         birrificio: 'BANDIGA',             tipologia: 'Stout',        gradazione_alcolica: 5.5, prezzo_piccola: 4.00, prezzo_media: 6.00, disponibile: true, immagine_url: '/images/stout-bandiga.png',     prezzo_unico: null, gluten_free: false },
  { id: 6,  formato: 'spina', nome: 'RENNA RIBELLE', birrificio: 'PORTA BRUCIATA',      tipologia: 'Red Ale',      gradazione_alcolica: 6.5, prezzo_piccola: 4.00, prezzo_media: 6.00, disponibile: true, immagine_url: null,                            prezzo_unico: null, gluten_free: false },
  { id: 7,  formato: 'spina', nome: 'JAMBON ATTACKS',birrificio: 'MUTNINK',             tipologia: 'IPA',          gradazione_alcolica: 6.2, prezzo_piccola: 4.00, prezzo_media: 6.00, disponibile: true, immagine_url: null,                            prezzo_unico: null, gluten_free: false },
  { id: 8,  formato: 'spina', nome: 'BERRY DROP',    birrificio: 'VETRA',               tipologia: 'Sour',         gradazione_alcolica: 4.5, prezzo_piccola: 4.00, prezzo_media: 6.00, disponibile: true, immagine_url: null,                            prezzo_unico: null, gluten_free: false },
  { id: 9,  formato: 'spina', nome: 'GOSE',          birrificio: 'BANDIGA',             tipologia: 'Gose',         gradazione_alcolica: 4.5, prezzo_piccola: 4.00, prezzo_media: 6.00, disponibile: true, immagine_url: null,                            prezzo_unico: null, gluten_free: false },
  { id: 10, formato: 'spina', nome: 'DUNKELBOCK',    birrificio: 'BANDIGA',             tipologia: 'Dunkelbock',   gradazione_alcolica: 6.5, prezzo_piccola: 3.50, prezzo_media: 5.00, disponibile: true, immagine_url: null,                            prezzo_unico: null, gluten_free: false },
  { id: 11, formato: 'spina', nome: 'ITALIAN PILS',  birrificio: 'BANDIGA',             tipologia: 'Italian Pils', gradazione_alcolica: 5.0, prezzo_piccola: 4.00, prezzo_media: 6.00, disponibile: true, immagine_url: null,                            prezzo_unico: null, gluten_free: false },
  { id: 12, formato: 'spina', nome: 'ZHULKA',        birrificio: 'MUTTNIK',             tipologia: 'Imperial IPA', gradazione_alcolica: 8.0, prezzo_piccola: 4.50, prezzo_media: 6.50, disponibile: true, immagine_url: '/images/zhulka-muttnik.png',   prezzo_unico: null, gluten_free: false },
  { id: 13, formato: 'spina', nome: 'ISAAC',         birrificio: 'BALADIN',             tipologia: 'Blanche',      gradazione_alcolica: 5.0, prezzo_piccola: 4.00, prezzo_media: 6.00, disponibile: true, immagine_url: null,                            prezzo_unico: null, gluten_free: false },
  { id: 14, formato: 'spina', nome: 'NORA',          birrificio: 'BALADIN',             tipologia: 'Spiced Ale',   gradazione_alcolica: 6.8, prezzo_piccola: 4.50, prezzo_media: 6.50, disponibile: true, immagine_url: null,                            prezzo_unico: null, gluten_free: false },
  { id: 15, formato: 'spina', nome: 'TIPOPILS',      birrificio: 'BIRRIFICIO ITALIANO', tipologia: 'Italian Pils', gradazione_alcolica: 5.2, prezzo_piccola: 4.00, prezzo_media: 6.00, disponibile: true, immagine_url: null,                            prezzo_unico: null, gluten_free: false },
  { id: 16, formato: 'spina', nome: 'AMBER SHOCK',   birrificio: 'BIRRIFICIO ITALIANO', tipologia: 'Amber Ale',    gradazione_alcolica: 7.0, prezzo_piccola: 4.50, prezzo_media: 6.50, disponibile: true, immagine_url: null,                            prezzo_unico: null, gluten_free: false },
  { id: 17, formato: 'spina', nome: 'PUNK IPA',      birrificio: 'BREWDOG',             tipologia: 'IPA',          gradazione_alcolica: 5.6, prezzo_piccola: 4.50, prezzo_media: 6.50, disponibile: true, immagine_url: '/images/brewdog-punk-ipa.png', prezzo_unico: null, gluten_free: false },
  { id: 18, formato: 'spina', nome: 'DEAD PONY CLUB',birrificio: 'BREWDOG',             tipologia: 'Session IPA',  gradazione_alcolica: 3.8, prezzo_piccola: 3.50, prezzo_media: 5.00, disponibile: true, immagine_url: null,                            prezzo_unico: null, gluten_free: false },
  { id: 19, formato: 'spina', nome: 'MOTOR OIL',     birrificio: 'BREWFIST',            tipologia: 'Porter',       gradazione_alcolica: 6.5, prezzo_piccola: 4.50, prezzo_media: 6.50, disponibile: true, immagine_url: null,                            prezzo_unico: null, gluten_free: false },
  { id: 20, formato: 'spina', nome: 'SPACEMAN',      birrificio: 'BREWFIST',            tipologia: 'Pale Ale',     gradazione_alcolica: 5.3, prezzo_piccola: 4.00, prezzo_media: 6.00, disponibile: true, immagine_url: null,                            prezzo_unico: null, gluten_free: false },
  { id: 21, formato: 'spina', nome: 'REBEERS',       birrificio: 'BIRRA DEL BORGO',     tipologia: 'Lager',        gradazione_alcolica: 6.0, prezzo_piccola: 4.00, prezzo_media: 6.00, disponibile: true, immagine_url: null,                            prezzo_unico: null, gluten_free: false },
  { id: 22, formato: 'lattina', nome: 'ZIP',            birrificio: 'BREWFIST',        tipologia: 'Italian Pils',   gradazione_alcolica: 5.1, prezzo_piccola: null, prezzo_media: null, disponibile: true,  immagine_url: '/images/brewort-zip.png', prezzo_unico: 6.00, gluten_free: true  },
  { id: 23, formato: 'lattina', nome: 'ELVIS JUICE',    birrificio: 'BREWDOG',         tipologia: 'IPA',             gradazione_alcolica: 6.5, prezzo_piccola: null, prezzo_media: null, disponibile: true,  immagine_url: null,                     prezzo_unico: 5.50, gluten_free: false },
  { id: 24, formato: 'lattina', nome: 'PAZZESKA',       birrificio: 'BREWFIST',        tipologia: 'Session IPA',     gradazione_alcolica: 4.0, prezzo_piccola: null, prezzo_media: null, disponibile: true,  immagine_url: '/images/pazzeska.png',   prezzo_unico: 6.00, gluten_free: false },
  { id: 25, formato: 'lattina', nome: 'SETA',           birrificio: 'BIRRA DEL BORGO', tipologia: 'Blanche',         gradazione_alcolica: 4.7, prezzo_piccola: null, prezzo_media: null, disponibile: true,  immagine_url: null,                     prezzo_unico: 4.50, gluten_free: false },
  { id: 26, formato: 'lattina', nome: 'OPEN TO DEBATE', birrificio: 'BALADIN',         tipologia: 'Amber Ale',       gradazione_alcolica: 5.8, prezzo_piccola: null, prezzo_media: null, disponibile: true,  immagine_url: null,                     prezzo_unico: 5.00, gluten_free: false },
  { id: 27, formato: 'lattina', nome: 'PUNK IPA',       birrificio: 'BREWDOG',         tipologia: 'IPA',             gradazione_alcolica: 5.6, prezzo_piccola: null, prezzo_media: null, disponibile: true,  immagine_url: null,                     prezzo_unico: 5.00, gluten_free: false },
  { id: 28, formato: 'lattina', nome: 'HAZY JANE',      birrificio: 'BREWDOG',         tipologia: 'New England IPA', gradazione_alcolica: 5.0, prezzo_piccola: null, prezzo_media: null, disponibile: true,  immagine_url: null,                     prezzo_unico: 5.00, gluten_free: false },
  { id: 29, formato: 'lattina', nome: 'LOST LAGER',     birrificio: 'BREWDOG',         tipologia: 'Lager',           gradazione_alcolica: 4.7, prezzo_piccola: null, prezzo_media: null, disponibile: true,  immagine_url: null,                     prezzo_unico: 4.50, gluten_free: false },
  { id: 30, formato: 'lattina', nome: 'TORPEDO',        birrificio: 'SIERRA NEVADA',   tipologia: 'IPA',             gradazione_alcolica: 7.2, prezzo_piccola: null, prezzo_media: null, disponibile: true,  immagine_url: null,                     prezzo_unico: 5.50, gluten_free: false },
  { id: 31, formato: 'lattina', nome: 'RE ALE EXTRA',   birrificio: 'BIRRA DEL BORGO', tipologia: 'Extra Pale Ale',  gradazione_alcolica: 6.4, prezzo_piccola: null, prezzo_media: null, disponibile: true,  immagine_url: null,                     prezzo_unico: 5.50, gluten_free: false },
  { id: 32, formato: 'lattina', nome: 'NORA',           birrificio: 'BALADIN',         tipologia: 'Spiced Ale',      gradazione_alcolica: 6.8, prezzo_piccola: null, prezzo_media: null, disponibile: true,  immagine_url: null,                     prezzo_unico: 5.50, gluten_free: false },
];

const SEED_SPINE = [
  { numero_spina: 1, birra_id: 1 },
  { numero_spina: 2, birra_id: 2 },
  { numero_spina: 3, birra_id: 3 },
  { numero_spina: 4, birra_id: 4 },
  { numero_spina: 5, birra_id: 5 },
  { numero_spina: 6, birra_id: 6 },
  { numero_spina: 7, birra_id: 7 },
  { numero_spina: 8, birra_id: 8 },
];

// =============================================================================
// INIT DB — popola le tabelle se vuote
// =============================================================================

async function initDB() {
  // Controlla se la tabella birre ha già dati
  const { data: birreEsistenti, error: errBirre } = await supabase
    .from('birre')
    .select('id')
    .limit(1);

  if (errBirre) {
    // La tabella non esiste ancora su Supabase — devi crearla manualmente
    // Vedi istruzioni nel README o esegui lo script SQL in supabase/schema.sql
    console.error('[DB] Tabella "birre" non trovata:', errBirre.message);
    console.error('[DB] Crea le tabelle su Supabase con lo script SQL allegato.');
    process.exit(1);
  }

  if (birreEsistenti.length === 0) {
    logger.info('Tabella birre vuota — eseguo seed...');
    const { error } = await supabase.from('birre').insert(SEED_BIRRE);
    if (error) { logger.error('Seed birre fallito', error); process.exit(1); }
    logger.info(`Inserite ${SEED_BIRRE.length} birre.`);
  }

  const { data: spineEsistenti, error: errSpine } = await supabase
    .from('spine')
    .select('numero_spina')
    .limit(1);

  if (errSpine) {
    console.error('[DB] Tabella "spine" non trovata:', errSpine.message);
    process.exit(1);
  }

  if (spineEsistenti.length === 0) {
    logger.info('Tabella spine vuota — eseguo seed...');
    const { error } = await supabase.from('spine').insert(SEED_SPINE);
    if (error) { logger.error('Seed spine fallito', error); process.exit(1); }
    logger.info('Inserite 8 spine.');
  }

  logger.info('Database pronto.');
}

// =============================================================================
// DATA ACCESS LAYER — query Supabase
// =============================================================================

const db = {

  getCatalogoCompleto: async () => {
    const { data, error } = await supabase.from('birre').select('*').order('id');
    if (error) throw new Error(error.message);
    return data;
  },

  getCatalogoSpina: async () => {
    const { data, error } = await supabase.from('birre').select('*').eq('formato', 'spina').order('id');
    if (error) throw new Error(error.message);
    return data;
  },

  getLattineTutte: async () => {
    const { data, error } = await supabase.from('birre').select('*').eq('formato', 'lattina').order('id');
    if (error) throw new Error(error.message);
    return data;
  },

  getLattineDisponibili: async () => {
    const { data, error } = await supabase.from('birre').select('*').eq('formato', 'lattina').eq('disponibile', true).order('id');
    if (error) throw new Error(error.message);
    return data;
  },

  // Ritorna le 8 spine con i dati della birra joinati
  getSpine: async () => {
    const { data: spine, error: errSpine } = await supabase
      .from('spine')
      .select('numero_spina, birra_id')
      .order('numero_spina');
    if (errSpine) throw new Error(errSpine.message);

    const { data: birre, error: errBirre } = await supabase
      .from('birre')
      .select('*')
      .eq('formato', 'spina');
    if (errBirre) throw new Error(errBirre.message);

    const birreMap = Object.fromEntries(birre.map(b => [b.id, b]));
    return spine.map(s => ({
      numero_spina: s.numero_spina,
      birra: s.birra_id ? (birreMap[s.birra_id] || null) : null,
    }));
  },

  aggiornaSpina: async (numero, birraId) => {
    // Valida che la birra esista (se non null)
    if (birraId !== null) {
      const { data, error } = await supabase.from('birre').select('id').eq('id', birraId).single();
      if (error || !data) throw new Error('Birra non trovata nel catalogo');
    }
    const { error } = await supabase
      .from('spine')
      .update({ birra_id: birraId })
      .eq('numero_spina', numero);
    if (error) throw new Error(error.message);
    const spine = await db.getSpine();
    return spine.find(s => s.numero_spina === numero);
  },

  toggleLattina: async (id) => {
    // Leggi stato attuale
    const { data: birra, error: errRead } = await supabase
      .from('birre')
      .select('id, nome, disponibile, formato')
      .eq('id', id)
      .single();
    if (errRead || !birra) throw new Error('Lattina non trovata');
    if (birra.formato !== 'lattina') throw new Error('La birra non è una lattina');

    const nuovoStato = !birra.disponibile;
    const { data: aggiornata, error: errUpd } = await supabase
      .from('birre')
      .update({ disponibile: nuovoStato })
      .eq('id', id)
      .select()
      .single();
    if (errUpd) throw new Error(errUpd.message);
    return aggiornata;
  },

  aggiornaImmagine: async (id, url) => {
    const { data: aggiornata, error } = await supabase
      .from('birre')
      .update({ immagine_url: url || null })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return aggiornata;
  },
};

// =============================================================================
// APP SETUP
// =============================================================================

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.NODE_ENV === 'production' ? false : '*', methods: ['GET', 'POST'] },
});

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Rotte HTML — cerca prima in public/, poi nella root (compatibilità Render)
const serveHtml = (file) => (req, res) => {
  const inPublic = path.join(__dirname, 'public', file);
  const inRoot   = path.join(__dirname, file);
  res.sendFile(fs.existsSync(inPublic) ? inPublic : inRoot);
};
app.get('/',        serveHtml('cliente.html'));
app.get('/cliente', serveHtml('cliente.html'));
app.get('/admin',   serveHtml('admin.html'));

// =============================================================================
// LOGGER & MIDDLEWARE
// =============================================================================

const logger = {
  info:  (msg)      => console.log(`[INFO]  ${new Date().toISOString()} ${msg}`),
  warn:  (msg)      => console.warn(`[WARN]  ${new Date().toISOString()} ${msg}`),
  error: (msg, err) => console.error(`[ERROR] ${new Date().toISOString()} ${msg}`, err || ''),
};

const requireAdmin = (req, res, next) => {
  if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
    logger.warn(`Accesso non autorizzato da ${req.ip}`);
    return res.status(401).json({ success: false, message: 'Password non valida' });
  }
  next();
};

// =============================================================================
// ROUTES — PUBLIC
// =============================================================================

app.get('/api/spine', async (req, res) => {
  try { res.json({ success: true, data: await db.getSpine() }); }
  catch (err) { logger.error('GET /api/spine', err); res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/lattine', async (req, res) => {
  try { res.json({ success: true, data: await db.getLattineDisponibili() }); }
  catch (err) { logger.error('GET /api/lattine', err); res.status(500).json({ success: false, message: err.message }); }
});

// =============================================================================
// ROUTES — ADMIN
// =============================================================================

app.get('/api/admin/catalogo', requireAdmin, async (req, res) => {
  try { res.json({ success: true, data: await db.getCatalogoCompleto() }); }
  catch (err) { logger.error('GET /api/admin/catalogo', err); res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/spine/aggiorna', requireAdmin, async (req, res) => {
  try {
    const { numero_spina, birra_id } = req.body;
    const numero = parseInt(numero_spina, 10);
    if (isNaN(numero) || numero < 1 || numero > 8)
      return res.status(400).json({ success: false, message: 'numero_spina non valido (1-8)' });
    if (birra_id !== null && typeof birra_id !== 'number')
      return res.status(400).json({ success: false, message: 'birra_id deve essere un numero o null' });

    const spinaAggiornata = await db.aggiornaSpina(numero, birra_id);
    const tutte = await db.getSpine();
    io.emit('menu_spine_aggiornato', tutte);
    logger.info(`Spina ${numero} → birra_id=${birra_id}`);
    res.json({ success: true, message: 'Spina aggiornata', data: spinaAggiornata });
  } catch (err) { logger.error('POST /api/spine/aggiorna', err); res.status(400).json({ success: false, message: err.message }); }
});

app.post('/api/lattine/toggle', requireAdmin, async (req, res) => {
  try {
    const { birra_id } = req.body;
    if (!birra_id || typeof birra_id !== 'number')
      return res.status(400).json({ success: false, message: 'birra_id obbligatorio (numero)' });

    const aggiornata = await db.toggleLattina(birra_id);
    const disponibili = await db.getLattineDisponibili();
    io.emit('menu_lattine_aggiornato', disponibili);
    logger.info(`Lattina ${birra_id} (${aggiornata.nome}) → disponibile=${aggiornata.disponibile}`);
    res.json({ success: true, data: aggiornata });
  } catch (err) { logger.error('POST /api/lattine/toggle', err); res.status(400).json({ success: false, message: err.message }); }
});

app.post('/api/admin/immagine', requireAdmin, async (req, res) => {
  try {
    const { birra_id, immagine_url } = req.body;
    if (!birra_id || typeof birra_id !== 'number')
      return res.status(400).json({ success: false, message: 'birra_id obbligatorio (numero)' });

    const aggiornata = await db.aggiornaImmagine(birra_id, immagine_url);
    if (aggiornata.formato === 'spina') {
      io.emit('menu_spine_aggiornato', await db.getSpine());
    } else {
      io.emit('menu_lattine_aggiornato', await db.getLattineDisponibili());
    }
    logger.info(`Immagine aggiornata: id=${birra_id}`);
    res.json({ success: true, data: aggiornata });
  } catch (err) { logger.error('POST /api/admin/immagine', err); res.status(400).json({ success: false, message: err.message }); }
});

// =============================================================================
// SOCKET.IO
// =============================================================================

io.on('connection', async (socket) => {
  logger.info(`Socket connesso: ${socket.id}`);
  try {
    socket.emit('menu_spine_aggiornato',   await db.getSpine());
    socket.emit('menu_lattine_aggiornato', await db.getLattineDisponibili());
  } catch (err) {
    logger.error('Socket init error', err);
  }
  socket.on('disconnect', () => logger.info(`Socket disconnesso: ${socket.id}`));
});

// =============================================================================
// ERROR HANDLER & START
// =============================================================================

app.use((err, req, res, next) => {
  logger.error('Unhandled error', err);
  res.status(500).json({ success: false, message: 'Errore interno del server' });
});

// Avvia prima il DB, poi il server HTTP
initDB().then(() => {
  httpServer.listen(PORT, () => {
    logger.info(`Server avviato su :${PORT}`);
    logger.info(`Cliente → http://localhost:${PORT}/`);
    logger.info(`Admin   → http://localhost:${PORT}/admin`);
  });
});

process.on('SIGTERM', () => httpServer.close(() => process.exit(0)));
