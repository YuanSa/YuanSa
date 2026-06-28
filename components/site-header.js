import "./nav-menu.js";

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const current = this.getAttribute("current") || "";
    const lang = localStorage.getItem("site-language") || "zh";

    this.innerHTML = `
      <header class="site-header">
        <div class="site-header__inner page-container">
          <div class="site-header__left">
            <a class="site-brand" href="/" aria-label="回到首页">
              <span class="site-brand__name">杨子涵</span>
              <span class="site-brand__latin">YANG Zihan</span>
            </a>
            <nav-menu current="${current}"></nav-menu>
          </div>
          <div class="site-header__right">
            <button class="text-button" type="button" data-contact-open data-en="Contact">联系我</button>
            <div class="language-switch" aria-label="语言切换">
              <button type="button" data-language="zh" lang="zh-CN" ${lang === "zh" ? "aria-current=\"true\"" : ""}>中文</button>
              <button type="button" data-language="en" lang="en" ${lang === "en" ? "aria-current=\"true\"" : ""}>EN</button>
            </div>
          </div>
        </div>
      </header>
    `;

    this.querySelectorAll("[data-language]").forEach((button) => {
      button.addEventListener("click", () => {
        const currentLanguage = localStorage.getItem("site-language") === "en" ? "en" : "zh";
        applyLanguage(currentLanguage === "en" ? "zh" : "en");
      });
    });

    applyLanguage(lang);
  }
}

customElements.define("site-header", SiteHeader);

function applyLanguage(lang) {
  const next = lang === "en" ? "en" : "zh";
  localStorage.setItem("site-language", next);
  document.documentElement.lang = next === "en" ? "en" : "zh-CN";
  document.title = document.documentElement.dataset[next === "en" ? "titleEn" : "titleZh"] || document.title;

  document.querySelectorAll("[data-en-html]").forEach((node) => {
    if (!node.dataset.zhHtml) node.dataset.zhHtml = node.innerHTML.trim();
    node.innerHTML = next === "en" ? node.dataset.enHtml : node.dataset.zhHtml;
  });

  document.querySelectorAll("[data-en]").forEach((node) => {
    if (!node.dataset.zh) node.dataset.zh = node.textContent.trim();
    node.textContent = next === "en" ? node.dataset.en : node.dataset.zh;
  });

  document.querySelectorAll("[data-language]").forEach((button) => {
    if (button.dataset.language === next) {
      button.setAttribute("aria-current", "true");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  window.dispatchEvent(new CustomEvent("site-language-change", { detail: { language: next } }));
}
