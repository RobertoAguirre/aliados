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

app.use(cors({ origin: true }));
app.use(express.json());

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
