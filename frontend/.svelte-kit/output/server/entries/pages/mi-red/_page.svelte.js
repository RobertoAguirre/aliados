import { h as head, a as attr, e as escape_html } from "../../../chunks/index2.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let codigo = "";
    let enviando = false;
    head("19cw1h1", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Mi Red — Aliados QR</title>`);
      });
    });
    $$renderer2.push(`<div class="max-w-lg mx-auto px-4 py-8"><h1 class="text-2xl font-bold text-center mb-2">Mi Red</h1> <p class="text-center text-sm mb-6">Ingresa tu código para ver el avance de tu red.</p> <form class="flex gap-2 mb-6"><input type="text"${attr("value", codigo)} placeholder="Tu código (ej. ABC123)" maxlength="6" class="flex-1 border-2 border-brand-black rounded px-3 py-2 bg-white uppercase"/> <button type="submit"${attr("disabled", enviando, true)} class="px-4 py-2 font-bold bg-brand-black text-brand-yellow rounded border-2 border-brand-black disabled:opacity-50">${escape_html("Ver")}</button></form> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <a href="/" class="block mt-6 text-center underline text-sm">Volver al inicio</a></div>`);
  });
}
export {
  _page as default
};
