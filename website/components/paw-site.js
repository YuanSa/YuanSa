const root = document.documentElement;
const base = "/projects/taoqizhuazhua/";
let language = "zh";
try { language = localStorage.getItem("site-language") === "en" ? "en" : "zh"; } catch { /* Storage is optional. */ }

export const getLanguage = () => language;
export const translate = (zh, en) => language === "en" ? en : zh;

export function applyLanguage(next) {
  language = next === "en" ? "en" : "zh";
  root.lang = language === "en" ? "en" : "zh-CN";
  document.title = root.dataset[language === "en" ? "titleEn" : "titleZh"] || document.title;
  try { localStorage.setItem("site-language", language); } catch { /* Keep in-memory preference. */ }
  document.querySelectorAll("[data-en-html]").forEach(node => {
    if (!node.hasAttribute("data-zh-html")) node.dataset.zhHtml = node.innerHTML;
    node.innerHTML = language === "en" ? node.dataset.enHtml : node.dataset.zhHtml;
  });
  document.querySelectorAll("[data-en]").forEach(node => {
    if (!node.hasAttribute("data-zh")) node.dataset.zh = node.textContent;
    node.textContent = language === "en" ? node.dataset.en : node.dataset.zh;
  });
  for (const attribute of ["aria-label", "placeholder", "alt"]) {
    document.querySelectorAll(`[data-en-${attribute}]`).forEach(node => {
      if (!node.hasAttribute(`data-zh-${attribute}`)) node.setAttribute(`data-zh-${attribute}`, node.getAttribute(attribute) || "");
      node.setAttribute(attribute, node.getAttribute(`data-${language === "en" ? "en" : "zh"}-${attribute}`));
    });
  }
  document.querySelectorAll("[data-paw-language]").forEach(button => {
    button.setAttribute("aria-label", translate("Switch to English", "切换为中文"));
    button.textContent = language === "en" ? "中文" : "EN";
  });
  window.dispatchEvent(new CustomEvent("paw-language-change"));
}

class PawSiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<header class="paw-header paw-container">
      <a class="paw-brand" href="${base}" aria-label="淘气爪爪首页" data-en-aria-label="Mischievous Paws home"><img src="/assets/projects/taoqizhuazhua/app-icon.png" width="40" height="40" alt="" /><span data-en="Mischievous Paws">淘气爪爪</span></a>
      <nav class="paw-nav" aria-label="产品导航" data-en-aria-label="Product navigation"><a href="${base}#experience" data-en="Try it">体验</a><a href="${base}#studio" data-en="Skin studio">制作皮肤</a><a href="${base}support/" data-en="Support">帮助</a></nav>
      <button class="paw-language" data-paw-language type="button">EN</button>
    </header>`;
    this.querySelector("[data-paw-language]").addEventListener("click", () => applyLanguage(language === "en" ? "zh" : "en"));
  }
}

class PawSiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<footer class="paw-footer paw-container"><div class="paw-footer__brand"><a class="paw-brand" href="${base}"><img src="/assets/projects/taoqizhuazhua/app-icon.png" width="32" height="32" alt="" /><span data-en="Mischievous Paws">淘气爪爪</span></a><p data-en="A little paw. A little joy.">一只小爪爪，一点小开心。</p></div><nav aria-label="帮助与法律信息" data-en-aria-label="Help and legal"><a href="${base}privacy/" data-en="Privacy policy">隐私政策</a><a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank" rel="noopener noreferrer" data-en="Apple standard EULA ↗">Apple 标准许可协议 ↗</a><a href="${base}support/" data-en="Technical support">技术支持</a></nav><div class="paw-footer__bottom"><a href="/" data-en="Made by YANG Zihan ↗">由杨子涵制作 ↗</a><button class="paw-theme" type="button" id="paw-theme"></button></div></footer>`;
    const themeButton = this.querySelector("#paw-theme");
    const systemTheme = matchMedia("(prefers-color-scheme: dark)");
    try { const saved = localStorage.getItem("paw-theme"); if (saved === "light" || saved === "dark") root.dataset.theme = saved; } catch { /* Use the system theme. */ }
    const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : systemTheme.matches;
    const updateLabel = () => { themeButton.textContent = isDark() ? translate("切换浅色", "Light appearance") : translate("切换深色", "Dark appearance"); };
    themeButton.addEventListener("click", () => {
      root.dataset.theme = isDark() ? "light" : "dark";
      try { localStorage.setItem("paw-theme", root.dataset.theme); } catch { /* Keep the current-page preference. */ }
      updateLabel();
    });
    systemTheme.addEventListener("change", updateLabel);
    window.addEventListener("paw-language-change", updateLabel);
    updateLabel();
  }
}
customElements.define("paw-site-header", PawSiteHeader);
customElements.define("paw-site-footer", PawSiteFooter);
applyLanguage(language);
