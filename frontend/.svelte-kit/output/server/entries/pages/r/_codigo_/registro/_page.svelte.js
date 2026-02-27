import { h as head, a3 as attr_class, a4 as stringify, e as escape_html, a as attr, b as ensure_array_like, d as derived } from "../../../../../chunks/index2.js";
import { L as LeafletMap } from "../../../../../chunks/LeafletMap.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let form = {
      nombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      telefono: "",
      mes: "01",
      dia: "1",
      anio: "1990",
      direccion: "",
      lat: null,
      lng: null
    };
    let enviando = false;
    const referente = derived(() => data?.referente);
    const rol = derived(() => data?.rol ?? "unete");
    const esImpulsa = derived(() => rol() === "impulsa");
    const accentBorder = derived(() => esImpulsa() ? "border-brand-orange" : "border-[var(--color-brand-yellow)]");
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head("3toirh", $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>Datos de registro — Aliados QR</title>`);
        });
      });
      $$renderer3.push(`<div class="max-w-lg mx-auto px-4 py-6">`);
      if (!referente()) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<p class="text-center">Referente no encontrado.</p> <a href="/" class="block text-center mt-4 underline">Inicio</a>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<div${attr_class(`bg-white rounded-lg border-2 ${stringify(accentBorder())} p-6 shadow-lg`)}><h2 class="text-lg font-bold flex items-center gap-2 mb-6"><span class="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue">👤</span> Datos de registro</h2> <p class="text-sm text-gray-700 mb-4">Completa los datos obligatorios. Te registras ${escape_html(esImpulsa() ? "como impulsor" : "en la red")} de ${escape_html(referente().nombreCompleto)}.</p> <form class="space-y-4"><label class="block"><span class="block text-sm font-medium mb-1">NOMBRE</span> <input type="text"${attr("value", form.nombre)} required="" class="w-full border-2 border-brand-black rounded px-3 py-2 bg-white" placeholder="Nombre"/></label> <label class="block"><span class="block text-sm font-medium mb-1">APELLIDO PATERNO</span> <input type="text"${attr("value", form.apellidoPaterno)} required="" class="w-full border-2 border-brand-black rounded px-3 py-2 bg-white"/></label> <label class="block"><span class="block text-sm font-medium mb-1">APELLIDO MATERNO</span> <input type="text"${attr("value", form.apellidoMaterno)} required="" class="w-full border-2 border-brand-black rounded px-3 py-2 bg-white"/></label> <label class="block"><span class="block text-sm font-medium mb-1">TELÉFONO</span> <input type="tel"${attr("value", form.telefono)} required="" class="w-full border-2 border-brand-black rounded px-3 py-2 bg-white"/></label> <div><span class="block text-sm font-medium mb-1">FECHA DE NACIMIENTO</span> <div class="flex gap-2">`);
        $$renderer3.select(
          {
            value: form.mes,
            class: "flex-1 border-2 border-brand-black rounded px-2 py-2 bg-white"
          },
          ($$renderer4) => {
            $$renderer4.push(`<!--[-->`);
            const each_array = ensure_array_like([
              "01",
              "02",
              "03",
              "04",
              "05",
              "06",
              "07",
              "08",
              "09",
              "10",
              "11",
              "12"
            ]);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let m = each_array[$$index];
              $$renderer4.option({ value: m }, ($$renderer5) => {
                $$renderer5.push(`${escape_html([
                  "Enero",
                  "Febrero",
                  "Marzo",
                  "Abril",
                  "Mayo",
                  "Junio",
                  "Julio",
                  "Agosto",
                  "Septiembre",
                  "Octubre",
                  "Noviembre",
                  "Diciembre"
                ][parseInt(m) - 1])}`);
              });
            }
            $$renderer4.push(`<!--]-->`);
          }
        );
        $$renderer3.push(` <input type="number"${attr("value", form.dia)} min="1" max="31" class="w-16 border-2 border-brand-black rounded px-2 py-2 bg-white text-center"/> <input type="number"${attr("value", form.anio)} min="1920" max="2026" class="w-20 border-2 border-brand-black rounded px-2 py-2 bg-white text-center"/></div></div> <label class="block"><span class="block text-sm font-medium mb-1">DIRECCIÓN</span> <input type="text"${attr("value", form.direccion)} required="" class="w-full border-2 border-brand-black rounded px-3 py-2 bg-white" placeholder="ESCRIBE AQUÍ TU DIRECCIÓN"/></label> <div class="rounded overflow-hidden border border-brand-black/30 h-48">`);
        LeafletMap($$renderer3, {
          get lat() {
            return form.lat;
          },
          set lat($$value) {
            form.lat = $$value;
            $$settled = false;
          },
          get lng() {
            return form.lng;
          },
          set lng($$value) {
            form.lng = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----></div> `);
        {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> <button type="submit"${attr("disabled", enviando, true)} class="w-full py-3 font-bold bg-brand-black text-brand-yellow rounded border-2 border-brand-black hover:opacity-90 disabled:opacity-50">${escape_html("CREAR USUARIO")}</button></form></div>`);
      }
      $$renderer3.push(`<!--]--></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
export {
  _page as default
};
