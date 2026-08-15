const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll("[data-reveal]");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.12 },
  );

  revealItems.forEach((item) => observer.observe(item));
}

document.documentElement.classList.add("work-has-js");

function syncLocalizedAttributes(language) {
  const isEnglish = language === "en";

  document.querySelectorAll("[data-en-alt]").forEach((node) => {
    if (!node.dataset.zhAlt) node.dataset.zhAlt = node.getAttribute("alt") || "";
    node.setAttribute("alt", isEnglish ? node.dataset.enAlt : node.dataset.zhAlt);
  });

  document.querySelectorAll("[data-en-aria-label]").forEach((node) => {
    if (!node.dataset.zhAriaLabel) {
      node.dataset.zhAriaLabel = node.getAttribute("aria-label") || "";
    }
    node.setAttribute(
      "aria-label",
      isEnglish ? node.dataset.enAriaLabel : node.dataset.zhAriaLabel,
    );
  });

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute(
      "content",
      isEnglish ? description.dataset.descriptionEn : description.dataset.descriptionZh,
    );
  }
}

syncLocalizedAttributes(localStorage.getItem("site-language") === "en" ? "en" : "zh");

window.addEventListener("site-language-change", (event) => {
  syncLocalizedAttributes(event.detail.language);
});
