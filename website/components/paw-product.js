const assets = "/assets/projects/taoqizhuazhua/coats/";
const stage = document.querySelector("#paw-stage");
const demo = document.querySelector("#demo-paw");
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
let patTimer;
function pat() {
  stage.classList.add("is-patting");
  clearTimeout(patTimer);
  patTimer = setTimeout(() => stage.classList.remove("is-patting"), 240);
}
stage.addEventListener("pointermove", event => {
  if (motionPreference.matches || event.pointerType === "touch") return;
  const bounds = stage.getBoundingClientRect();
  stage.style.setProperty("--move-x", `${(event.clientX - bounds.left - bounds.width / 2) * .16}px`);
  stage.style.setProperty("--move-y", `${(event.clientY - bounds.top - bounds.height / 2) * .12}px`);
});
stage.addEventListener("pointerleave", () => {
  stage.style.setProperty("--move-x", "0px");
  stage.style.setProperty("--move-y", "0px");
});
stage.addEventListener("click", pat);
document.querySelectorAll("[data-coat]").forEach(button => button.addEventListener("click", () => {
  demo.src = `${assets}${button.dataset.coat}.png`;
  document.querySelectorAll("[data-coat]").forEach(coat => coat.setAttribute("aria-pressed", String(coat === button)));
  pat();
}));

window.addEventListener("pagehide", () => clearTimeout(patTimer));
