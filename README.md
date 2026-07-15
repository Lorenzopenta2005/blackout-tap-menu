# 🍺 Pub Tap Manager

Sistema di gestione real-time per spine di birra artigianale con interfaccia cliente via QR Code e dashboard amministrativa.

## 🎯 Caratteristiche

- **Vista Cliente (Menu QR Code)**: Menu pubblico mobile-first che si aggiorna automaticamente in tempo reale
- **Dashboard Admin**: Interfaccia protetta per gestire le 8 spine e cambiare le birre al volo
- **Aggiornamenti Real-Time**: Socket.io per notifiche istantanee senza refresh della pagina
- **Database Ready**: Struttura modulare pronta per migrazione a PostgreSQL/MySQL
- **Sicurezza**: Autenticazione per rotte admin, validazione input, helmet.js
- **Architettura Pulita**: Separazione delle responsabilità, error handling centralizzato

## 📦 Installazione

```bash
# Installa le dipendenze
npm install

# Copia il file di configurazione
cp .env.example .env

# (Opzionale) Modifica la password admin in .env
```

## 🚀 Avvio

```bash
# Modalità produzione
npm start

# Modalità sviluppo (con auto-restart)
npm run dev
```

Il server sarà disponibile su `http://localhost:3000`

## 📱 Utilizzo

### Vista Cliente
Accedi a: `http://localhost:3000/cliente.html`
- Menu pubblico ottimizzato per mobile
- Si aggiorna automaticamente quando l'admin cambia una birra
- Perfetto per QR Code da stampare e appendere nei tavoli

### Dashboard Admin
Accedi a: `http://localhost:3000/admin.html`
- Usa la password configurata in `.env` (default: `admin123`)
- Seleziona una birra dal catalogo per ogni spina
- Clicca "Aggiorna" per cambiare immediatamente il menu clienti
- Clicca "Svuota" per disattivare una spina

## 🗂️ Struttura del Progetto

```
pub-tap-manager/
├── server.js              # Server Express + Socket.io
├── package.json           # Dipendenze
├── .env                   # Configurazione (NON committare!)
├── .env.example           # Template configurazione
├── public/
│   ├── cliente.html       # Interfaccia menu clienti
│   └── admin.html         # Dashboard amministrativa
└── README.md
```

## 🔧 Configurazione

File `.env`:
```env
PORT=3000
NODE_ENV=development
ADMIN_PASSWORD=admin123
```

## 📊 Modello Dati

### CatalogoBirre
```javascript
{
  id: number,
  nome: string,
  birrificio: string,
  gradazione_alcolica: number,
  prezzo_piccola: number,
  prezzo_media: number,
  disponibile: boolean
}
```

### SpineAttive
```javascript
{
  numero_spina: number (1-8),
  birra_id: number | null
}
```

## 🔌 API Endpoints

### Pubblici
- `GET /api/spine` - Ottieni tutte le spine con dettagli birre

### Admin (Richiedono header `X-Admin-Password`)
- `GET /api/admin/catalogo` - Ottieni catalogo birre
- `POST /api/admin/spine/:numero` - Aggiorna una spina
  ```json
  { "birra_id": 1 }  // o null per svuotare
  ```

## 🔄 Eventi Socket.io

- `stato_iniziale` - Inviato al client alla connessione
- `spina_cambiata` - Broadcast quando una spina viene aggiornata

## 🚀 Migrazione a Database Reale

Il codice è strutturato con un **Data Access Layer** che rende semplice la migrazione:

1. Installa il driver DB (es. `pg` per PostgreSQL)
2. Sostituisci le funzioni in `dataAccess` con query SQL
3. Zero modifiche alle rotte API e alla logica Socket.io

Esempio con PostgreSQL:
```javascript
const dataAccess = {
  getCatalogoBirre: async () => {
    const result = await pool.query(
      'SELECT * FROM catalogo_birre WHERE disponibile = true'
    );
    return result.rows;
  },
  // ...
};
```

## 🛡️ Sicurezza

- ✅ Helmet.js per header HTTP sicuri
- ✅ Validazione input su tutte le rotte
- ✅ Autenticazione tramite header custom
- ✅ Error handling centralizzato
- ⚠️ **IMPORTANTE**: In produzione usa HTTPS e password robuste!

## 📝 TODO per Produzione

- [ ] Implementare JWT invece di password in header
- [ ] Migrare a database reale (PostgreSQL/MySQL)
- [ ] Aggiungere rate limiting (es. express-rate-limit)
- [ ] Implementare logging su file (es. Winston)
- [ ] Setup HTTPS/SSL
- [ ] Aggiungere tests (Jest/Mocha)
- [ ] Containerizzazione con Docker

## 🤝 Sviluppo

Architettura pensata seguendo principi **KISS** e **Separation of Concerns**:
- Codice pulito e modulare
- Facile da estendere e manutenere
- Pronto per team di sviluppo

## 📄 Licenza

MIT
