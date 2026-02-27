import { h as head, a as attr, e as escape_html, b as ensure_array_like } from "../../../chunks/index2.js";
function _page($$renderer) {
  let password = "";
  let error = "";
  let cargando = false;
  let redes = null;
  let logueado = false;
  const TOKEN_KEY = "aliadosqr_admin_token";
  async function cargarRedes() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      logueado = false;
      redes = null;
      return;
    }
    cargando = true;
    error = "";
    try {
      const res = await fetch("/api/admin/redes", { headers: { "x-admin-token": token } });
      if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        logueado = false;
        redes = null;
        error = "Sesión expirada. Vuelve a iniciar sesión.";
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        error = json.error ?? "No se pudo cargar la información";
        return;
      }
      redes = json;
      logueado = true;
    } catch (e) {
      error = "Error de conexión";
    } finally {
      cargando = false;
    }
  }
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      logueado = true;
      cargarRedes();
    }
  }
  head("1jef3w8", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>Admin — Aliados QR</title>`);
    });
  });
  $$renderer.push(`<div class="max-w-4xl mx-auto px-4 py-8"><h1 class="text-2xl font-bold mb-4">Admin — Redes</h1> `);
  if (!logueado) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<div class="max-w-sm bg-white border-2 border-brand-black rounded-lg p-6"><h2 class="font-semibold mb-3">Iniciar sesión</h2> <form class="space-y-3"><input type="password"${attr("value", password)} placeholder="Clave de administrador" class="w-full border-2 border-brand-black rounded px-3 py-2 bg-white"/> `);
    if (error) {
      $$renderer.push("<!--[-->");
      $$renderer.push(`<p class="text-red-800 text-sm">${escape_html(error)}</p>`);
    } else {
      $$renderer.push("<!--[!-->");
    }
    $$renderer.push(`<!--]--> <button type="submit"${attr("disabled", cargando, true)} class="w-full py-2 font-bold bg-brand-black text-brand-yellow rounded border-2 border-brand-black disabled:opacity-50">${escape_html(cargando ? "Entrando…" : "Entrar")}</button></form></div>`);
  } else {
    $$renderer.push("<!--[!-->");
    $$renderer.push(`<div class="bg-white border-2 border-brand-black rounded-lg p-4"><div class="flex items-center justify-between mb-4"><h2 class="font-semibold">Resumen de redes</h2> <button type="button" class="px-3 py-1 text-sm border border-brand-black rounded bg-brand-yellow hover:opacity-90">Actualizar</button></div> `);
    if (error) {
      $$renderer.push("<!--[-->");
      $$renderer.push(`<p class="text-red-800 text-sm mb-2">${escape_html(error)}</p>`);
    } else {
      $$renderer.push("<!--[!-->");
    }
    $$renderer.push(`<!--]--> `);
    if (!redes) {
      $$renderer.push("<!--[-->");
      $$renderer.push(`<p class="text-sm text-gray-600">${escape_html(cargando ? "Cargando…" : "Sin datos aún.")}</p>`);
    } else {
      $$renderer.push("<!--[!-->");
      $$renderer.push(`<div class="overflow-x-auto"><table class="w-full text-sm border-collapse"><thead><tr class="bg-brand-yellow"><th class="border border-brand-black px-2 py-1 text-left">Nombre</th><th class="border border-brand-black px-2 py-1 text-left">Código</th><th class="border border-brand-black px-2 py-1 text-left">Rol</th><th class="border border-brand-black px-2 py-1 text-left">Invitante</th><th class="border border-brand-black px-2 py-1 text-right">Invitados</th></tr></thead><tbody><!--[-->`);
      const each_array = ensure_array_like(redes);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let r = each_array[$$index];
        $$renderer.push(`<tr><td class="border border-brand-black px-2 py-1">${escape_html(r.nombreCompleto)}</td><td class="border border-brand-black px-2 py-1">${escape_html(r.codigo)}</td><td class="border border-brand-black px-2 py-1 capitalize">${escape_html(r.rol)}</td><td class="border border-brand-black px-2 py-1">${escape_html(r.invitanteNombre ?? "—")}</td><td class="border border-brand-black px-2 py-1 text-right">${escape_html(r.totalInvitados)}</td></tr>`);
      }
      $$renderer.push(`<!--]--></tbody></table></div>`);
    }
    $$renderer.push(`<!--]--></div>`);
  }
  $$renderer.push(`<!--]--></div>`);
}
export {
  _page as default
};
