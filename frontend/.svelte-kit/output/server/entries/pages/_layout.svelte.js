import { s as slot } from "../../chunks/index2.js";
function _layout($$renderer, $$props) {
  $$renderer.push(`<div class="min-h-screen bg-brand-yellow text-brand-black"><!--[-->`);
  slot($$renderer, $$props, "default", {});
  $$renderer.push(`<!--]--></div>`);
}
export {
  _layout as default
};
