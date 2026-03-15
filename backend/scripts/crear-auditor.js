import 'dotenv/config';

const ADMIN_SECRET = process.env.ADMIN_SECRET;
const PORT = process.env.PORT ?? 3001;
const BASE = `http://localhost:${PORT}`;

function generarContraseña(longitud = 12) {
  const minus = 'abcdefghjkmnpqrstuvwxyz';
  const mayus = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numeros = '23456789';
  const todos = minus + mayus + numeros;
  let s = mayus[Math.floor(Math.random() * mayus.length)] + numeros[Math.floor(Math.random() * numeros.length)];
  for (let i = 2; i < longitud; i++) s += todos[Math.floor(Math.random() * todos.length)];
  return s.split('').sort(() => Math.random() - 0.5).join('');
}

const email = 'auditor@redmadre.org';
const password = generarContraseña();

if (!ADMIN_SECRET) {
  console.error('Falta ADMIN_SECRET en .env');
  process.exit(1);
}

const res = await fetch(`${BASE}/api/admin/crear`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET },
  body: JSON.stringify({ email, password, role: 'lectura' })
});

const json = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error('Error:', res.status, json.error ?? res.statusText);
  process.exit(1);
}

console.log('Auditor de solo lectura creado.');
console.log('Email:', email);
console.log('Contraseña (compartir con el auditor):', password);
