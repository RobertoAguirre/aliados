import { Router } from 'express';
import { crearUsuario, obtenerPorCodigo, obtenerPorId, listarInvitations, obtenerPorTelefono } from '../db.js';

export const usuariosRouter = Router();

usuariosRouter.post('/', async (req, res) => {
  const body = req.body;
  const required = ['nombre', 'apellidoPaterno', 'apellidoMaterno', 'telefono', 'fechaNacimiento', 'direccion', 'rol'];
  for (const key of required) {
    if (body[key] == null || body[key] === '') {
      return res.status(400).json({ error: `Falta campo: ${key}` });
    }
  }
  if (!['impulsa', 'unete'].includes(body.rol)) {
    return res.status(400).json({ error: 'rol debe ser impulsa o unete' });
  }

  let invitanteId = body.invitanteId ?? null;
  if (body.invitanteCodigo) {
    const inv = await obtenerPorCodigo(body.invitanteCodigo);
    if (inv) invitanteId = inv.id;
  }

  const telefono = body.telefono.trim();
  const existente = await obtenerPorTelefono(telefono);
  if (existente) {
    return res.status(409).json({ error: 'Este teléfono ya está registrado en una red.' });
  }

  const usuario = await crearUsuario({
    nombre: body.nombre.trim(),
    apellidoPaterno: body.apellidoPaterno.trim(),
    apellidoMaterno: body.apellidoMaterno.trim(),
    telefono,
    fechaNacimiento: body.fechaNacimiento,
    direccion: body.direccion.trim(),
    lat: body.lat,
    lng: body.lng,
    invitanteId,
    rol: body.rol
  });

  const nombreCompleto = [usuario.nombre, usuario.apellidoPaterno, usuario.apellidoMaterno]
    .filter(Boolean)
    .join(' ');

  res.status(201).json({
    id: usuario.id,
    codigo: usuario.codigo,
    nombreCompleto,
    rol: usuario.rol,
    linkInvitacion: `/r/${usuario.codigo}`
  });
});

usuariosRouter.get('/by-codigo/:codigo', async (req, res) => {
  const usuario = await obtenerPorCodigo(req.params.codigo);
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });
  res.json(usuario);
});

usuariosRouter.get('/:id', async (req, res) => {
  const usuario = await obtenerPorId(req.params.id);
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });
  res.json(usuario);
});

usuariosRouter.get('/:id/red', async (req, res) => {
  const usuario = await obtenerPorId(req.params.id);
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });
  const invitados = await listarInvitations(usuario.id);
  res.json({ usuario, invitados });
});
