import { Router } from 'express';
import { obtenerPorCodigo } from '../db.js';

export const referenteRouter = Router();

referenteRouter.get('/:codigo', async (req, res) => {
  const usuario = await obtenerPorCodigo(req.params.codigo);
  if (!usuario) {
    return res.status(404).json({ error: 'Referente no encontrado' });
  }
  const nombreCompleto = [usuario.nombre, usuario.apellidoPaterno, usuario.apellidoMaterno]
    .filter(Boolean)
    .join(' ');
  res.json({ nombreCompleto, codigo: usuario.codigo });
});
