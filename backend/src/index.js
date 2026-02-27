import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connect } from './db.js';
import { referenteRouter } from './routes/referente.js';
import { usuariosRouter } from './routes/usuarios.js';
import { adminRouter } from './routes/admin.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api/referente', referenteRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/admin', adminRouter);

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
