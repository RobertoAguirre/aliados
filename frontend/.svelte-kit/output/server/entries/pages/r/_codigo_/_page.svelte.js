import { h as head, e as escape_html, d as derived } from "../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import "../../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const referente = derived(() => data?.referente);
    head("1beld7f", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Elige tu opción — Aliados QR</title>`);
      });
    });
    if (!referente()) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="max-w-lg mx-auto px-4 py-12 text-center"><p class="text-red-800">Enlace o referente no encontrado.</p> <a href="/" class="mt-4 inline-block underline">Volver al inicio</a></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="min-h-[80vh] flex flex-col"><div class="flex-1 grid grid-cols-2 min-h-[320px]"><div class="bg-brand-orange flex flex-col items-center justify-center p-4 border-r-2 border-brand-black"><button type="button" class="px-8 py-4 font-bold bg-white border-2 border-brand-black rounded shadow-[4px_4px_0_0_#000] hover:bg-gray-100">IMPULSA</button> <p class="mt-4 text-center text-sm font-medium">CONSTRUYE TU PROPIA RED EN APOYO A:</p> <p class="mt-1 text-center font-bold">${escape_html(referente().nombreCompleto)}</p></div> <div class="bg-white flex flex-col items-center justify-center p-4 border-l border-brand-black"><button type="button" class="px-8 py-4 font-bold bg-brand-orange border-2 border-brand-black rounded shadow-[4px_4px_0_0_#000] hover:opacity-90">ÚNETE</button> <p class="mt-4 text-center text-sm font-medium">A LA RED DE:</p> <p class="mt-1 text-center font-bold">${escape_html(referente().nombreCompleto)}</p></div></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
