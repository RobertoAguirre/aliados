import { a5 as ssr_context, a6 as fallback, a7 as bind_props } from "./index2.js";
import "clsx";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
function LeafletMap($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let lat = $$props["lat"];
    let lng = $$props["lng"];
    let zoom = fallback($$props["zoom"], 13);
    onDestroy(() => {
    });
    $$renderer2.push(`<div class="w-full h-full"></div>`);
    bind_props($$props, { lat, lng, zoom });
  });
}
export {
  LeafletMap as L
};
