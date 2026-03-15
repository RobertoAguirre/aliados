import crypto from 'crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import {
  actualizarUsuario,
  crearAdmin,
  eliminarUsuario,
  listarInvitations,
  listarUsuarios,
  obtenerAdminPorEmail,
  obtenerPorId
} from '../db.js';

export const adminRouter = Router();

const ADMIN_SECRET = process.env.ADMIN_SECRET;
const TOKEN_LECTURA =
  ADMIN_SECRET && crypto.createHash('sha256').update(ADMIN_SECRET + 'lectura').digest('hex');

function validarConSecret(req) {
  const secret = req.body?.secret ?? req.header('x-admin-secret');
  return ADMIN_SECRET && secret === ADMIN_SECRET;
}

function tokenValido(token) {
  return token === ADMIN_SECRET || token === TOKEN_LECTURA;
}

adminRouter.post('/crear', async (req, res) => {
  if (!validarConSecret(req)) return res.status(401).json({ error: 'No autorizado' });
  const { email, password, role } = req.body ?? {};
  if (!email?.trim() || !password) return res.status(400).json({ error: 'Faltan email o contraseña' });
  const existente = await obtenerAdminPorEmail(email);
  if (existente) return res.status(409).json({ error: 'Ya existe un admin con ese email' });
  const passwordHash = await bcrypt.hash(password, 10);
  const rol = role === 'lectura' ? 'lectura' : 'admin';
  await crearAdmin(email, passwordHash, rol);
  res.status(201).json({ ok: true, email: email.trim().toLowerCase(), role: rol });
});

adminRouter.post('/login', async (req, res) => {
  if (!ADMIN_SECRET) return res.status(500).json({ error: 'ADMIN_SECRET no configurado' });
  const { email, password } = req.body ?? {};
  if (!email?.trim() || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
  const admin = await obtenerAdminPorEmail(email);
  if (!admin) return res.status(401).json({ error: 'Credenciales inválidas' });
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });
  const rol = admin.role ?? 'admin';
  const token = rol === 'lectura' ? TOKEN_LECTURA : ADMIN_SECRET;
  res.json({ token, role: rol });
});

adminRouter.get('/redes', async (req, res) => {
  if (!ADMIN_SECRET) return res.status(500).json({ error: 'ADMIN_SECRET no configurado' });
  const token = req.header('x-admin-token');
  if (!tokenValido(token)) return res.status(401).json({ error: 'No autorizado' });

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

function requireAdmin(req, res, next) {
  if (!ADMIN_SECRET) return res.status(500).json({ error: 'ADMIN_SECRET no configurado' });
  const token = req.header('x-admin-token');
  if (token !== ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado' });
  next();
}

adminRouter.get('/usuarios/:id', requireAdmin, async (req, res) => {
  const usuario = await obtenerPorId(req.params.id);
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });
  res.json(usuario);
});

adminRouter.put('/usuarios/:id', requireAdmin, async (req, res) => {
  const usuario = await actualizarUsuario(req.params.id, req.body);
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });
  res.json(usuario);
});

adminRouter.delete('/usuarios/:id', requireAdmin, async (req, res) => {
  const ok = await eliminarUsuario(req.params.id);
  if (!ok) return res.status(404).json({ error: 'No encontrado' });
  res.status(204).end();
});

