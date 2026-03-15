import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect } from './db.js';
import { referenteRouter } from './routes/referente.js';
import { usuariosRouter } from './routes/usuarios.js';
import { adminRouter } from './routes/admin.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'https://www.redmadre.org',
  'https://redmadre.org',
  'https://aliados-maqp.onrender.com'
];

app.use(cors({
  origin(origin, cb) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, origin || true);
    return cb(null, false);
  }
}));
app.use(express.json());

// Rate limit solo para registro y login (por IP)
const RATE_WINDOW_MS = 60 * 1000;
const rateLimitStore = new Map();
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}
function rateLimitMiddleware(limit) {
  return (req, res, next) => {
    const key = `${getClientIp(req)}:${req.path}`;
    const now = Date.now();
    let entry = rateLimitStore.get(key);
    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + RATE_WINDOW_MS };
      rateLimitStore.set(key, entry);
    }
    entry.count++;
    if (entry.count > limit) {
      return res.status(429).json({ error: 'Demasiadas peticiones. Intenta más tarde.' });
    }
    next();
  };
}
app.use((req, res, next) => {
  if (req.method !== 'POST') return next();
  if (req.path === '/api/usuarios') return rateLimitMiddleware(30)(req, res, next);
  if (req.path === '/api/admin/login') return rateLimitMiddleware(15)(req, res, next);
  next();
});

// API
app.use('/api/referente', referenteRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/admin', adminRouter);

// Frontend estático
app.use(express.static(publicDir));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).end();
  res.sendFile(path.join(publicDir, 'index.html'));
});

connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error conectando a MongoDB:', err.message);
    process.exit(1);
  });
