export async function load({ params, url, fetch }) {
  const codigo = params.codigo;
  const rol = url.searchParams.get('rol') ?? 'unete';
  if (rol !== 'impulsa' && rol !== 'unete') {
    return { referente: null, codigo, rol: 'unete' };
  }
  const res = await fetch(`/api/referente/${codigo}`);
  if (!res.ok) return { referente: null, codigo, rol };
  const referente = await res.json();
  return { referente, codigo, rol };
}
