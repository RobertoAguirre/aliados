import { Router } from 'express';
import { listarInvitations, listarUsuarios } from '../db.js';

export const adminRouter = Router();

const ADMIN_SECRET = process.env.ADMIN_SECRET;

adminRouter.post('/login', (req, res) => {
  if (!ADMIN_SECRET) return res.status(500).json({ error: 'ADMIN_SECRET no configurado' });
  const { secret } = req.body ?? {};
  if (secret !== ADMIN_SECRET) return res.status(401).json({ error: 'Credenciales inválidas' });
  res.json({ token: ADMIN_SECRET });
});

adminRouter.get('/redes', async (req, res) => {
  if (!ADMIN_SECRET) return res.status(500).json({ error: 'ADMIN_SECRET no configurado' });
  const token = req.header('x-admin-token');
  if (token !== ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado' });

  const usuarios = await listarUsuarios();
  const porId = new Map(usuarios.map((u) => [u.id, u]));
  const resultado = [];

  for (const u of usuarios) {
    const invitados = await listarInvitations(u.id);
    const invitante = u.invitanteId ? porId.get(u.invitanteId) : null;
    const nombreCompleto = [u.nombre, u.apellidoPaterno, u.apellidoMaterno].filter(Boolean).join(' ');
    const invitanteNombre = invitante
      ? [invitante.nombre, invitante.apellidoPaterno].filter(Boolean).join(' ')
      : null;

    resultado.push({
      id: u.id,
      codigo: u.codigo,
      rol: u.rol,
      nombreCompleto,
      invitanteNombre,
      totalInvitados: invitados.length
    });
  }

  res.json(resultado);
});

