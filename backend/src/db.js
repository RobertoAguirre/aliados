import { MongoClient, ObjectId } from 'mongodb';

let client;
let coll;
let adminsColl;

const DB_NAME = 'aliadosqr';
const COLLECTION = 'usuarios';
const ADMINS_COLLECTION = 'admins';

function generarCodigo() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = '';
  for (let i = 0; i < 6; i++) codigo += chars[Math.floor(Math.random() * chars.length)];
  return codigo;
}

function docToUsuario(doc) {
  if (!doc) return null;
  const { _id, invitanteId, ...rest } = doc;
  return {
    ...rest,
    id: _id.toString(),
    invitanteId: invitanteId?.toString() ?? null
  };
}

export async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Falta MONGODB_URI en el entorno');
  client = new MongoClient(uri);
  await client.connect();
  const db = client.db(DB_NAME);
  coll = db.collection(COLLECTION);
  adminsColl = db.collection(ADMINS_COLLECTION);
  await coll.createIndex({ codigo: 1 }, { unique: true });
  await coll.createIndex({ invitanteId: 1 });
  await coll.createIndex({ telefono: 1 });
  await adminsColl.createIndex({ email: 1 }, { unique: true });
  return client;
}

// --- Admins (solo para login admin, no toca lógica de usuarios) ---
export async function crearAdmin(email, passwordHash, role = 'admin') {
  const doc = { email: email.trim().toLowerCase(), passwordHash, role, createdAt: new Date() };
  await adminsColl.insertOne(doc);
  return { email: doc.email };
}

export async function obtenerAdminPorEmail(email) {
  return await adminsColl.findOne({ email: email.trim().toLowerCase() });
}

export async function crearUsuario(datos) {
  let codigo = generarCodigo();
  let exists = await coll.findOne({ codigo });
  while (exists) {
    codigo = generarCodigo();
    exists = await coll.findOne({ codigo });
  }

  const doc = {
    codigo,
    nombre: datos.nombre,
    apellidoPaterno: datos.apellidoPaterno,
    apellidoMaterno: datos.apellidoMaterno,
    telefono: datos.telefono,
    fechaNacimiento: datos.fechaNacimiento,
    direccion: datos.direccion,
    lat: datos.lat ?? null,
    lng: datos.lng ?? null,
    invitanteId: datos.invitanteId ? new ObjectId(datos.invitanteId) : null,
    rol: datos.rol,
    createdAt: new Date()
  };

  const { insertedId } = await coll.insertOne(doc);
  const inserted = await coll.findOne({ _id: insertedId });
  return docToUsuario(inserted);
}

export async function obtenerPorCodigo(codigo) {
  const doc = await coll.findOne({ codigo: codigo.toUpperCase() });
  return docToUsuario(doc);
}

export async function obtenerPorId(id) {
  if (!ObjectId.isValid(id)) return null;
  const doc = await coll.findOne({ _id: new ObjectId(id) });
  return docToUsuario(doc);
}

export async function listarInvitations(invitanteId) {
  if (!ObjectId.isValid(invitanteId)) return [];
  const cursor = coll.find({ invitanteId: new ObjectId(invitanteId) });
  const docs = await cursor.toArray();
  return docs.map(docToUsuario);
}

export async function obtenerPorTelefono(telefono) {
  const doc = await coll.findOne({ telefono });
  return docToUsuario(doc);
}

export async function listarUsuarios() {
  const docs = await coll.find({}).toArray();
  return docs.map(docToUsuario);
}

function filtroBusqueda(busqueda) {
  if (!busqueda || typeof busqueda !== 'string') return {};
  const q = busqueda.trim();
  if (!q) return {};
  const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(esc, 'i');
  return {
    $or: [
      { nombre: re },
      { apellidoPaterno: re },
      { apellidoMaterno: re },
      { codigo: re },
      { rol: re }
    ]
  };
}

export async function listarUsuariosPaginado(skip, limit, busqueda = null) {
  const filter = filtroBusqueda(busqueda);
  const [docs, total] = await Promise.all([
    coll.find(filter).skip(skip).limit(limit).toArray(),
    coll.countDocuments(filter)
  ]);
  return { usuarios: docs.map(docToUsuario), total };
}

const CAMPOS_EDITABLES = ['nombre', 'apellidoPaterno', 'apellidoMaterno', 'telefono', 'fechaNacimiento', 'direccion', 'lat', 'lng', 'rol'];

export async function actualizarUsuario(id, datos) {
  if (!ObjectId.isValid(id)) return null;
  if (datos.rol !== undefined && !['impulsa', 'unete'].includes(datos.rol)) return null;
  const update = {};
  for (const key of CAMPOS_EDITABLES) {
    if (datos[key] === undefined) continue;
    update[key] = typeof datos[key] === 'string' ? datos[key].trim() : datos[key];
  }
  if (Object.keys(update).length === 0) return await obtenerPorId(id);
  await coll.updateOne({ _id: new ObjectId(id) }, { $set: update });
  return await obtenerPorId(id);
}

export async function eliminarUsuario(id) {
  if (!ObjectId.isValid(id)) return false;
  await coll.updateMany({ invitanteId: new ObjectId(id) }, { $set: { invitanteId: null } });
  const r = await coll.deleteOne({ _id: new ObjectId(id) });
  return r.deletedCount === 1;
}
