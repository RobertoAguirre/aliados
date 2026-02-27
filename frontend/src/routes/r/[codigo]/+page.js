export async function load({ params, fetch }) {
  const codigo = params.codigo;
  const res = await fetch(`/api/referente/${codigo}`);
  if (!res.ok) return { referente: null, codigo };
  const referente = await res.json();
  return { referente, codigo };
}
