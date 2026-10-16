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
      if (attribute === "aria-label" && node.hasAttribute("data-coat")) node.title = node.getAttribute(attribute);
    });
  }
  document.querySelectorAll("[data-paw-language]").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.pawLanguage === language));
  });
  window.dispatchEvent(new CustomEvent("paw-language-change"));
}

class PawSiteHeader extends HTMLElement {
  connectedCallback() {
    const createLink = this.hasAttribute("hide-create-link") ? "" : `<a class="paw-create-link" href="${base}studio/" data-en="Make my paw">制作我的猫爪</a>`;
    this.innerHTML = `<header class="paw-header paw-container${this.hasAttribute("hide-create-link") ? " paw-header--studio" : ""}">
      <a class="paw-brand" href="${base}" aria-label="淘气爪爪首页" data-en-aria-label="PawPawPaw! home"><img src="/assets/projects/taoqizhuazhua/app-icon.png" width="40" height="40" alt="" /><span data-en="PawPawPaw!">淘气爪爪</span></a>
      ${createLink}
      <div class="paw-language" role="group" aria-label="语言" data-en-aria-label="Language"><button data-paw-language="zh" type="button" lang="zh-CN" aria-pressed="true">中文</button><button data-paw-language="en" type="button" lang="en" aria-pressed="false">English</button></div>
    </header>`;
    this.querySelectorAll("[data-paw-language]").forEach(button => button.addEventListener("click", () => applyLanguage(language === "en" ? "zh" : "en")));
  }
}
class PawSiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<footer class="paw-footer paw-container"><nav aria-label="帮助与法律信息" data-en-aria-label="Help and legal"><a href="${base}privacy/" data-en="Privacy policy">隐私政策</a><a href="${base}support/" data-en="Technical support">技术支持</a></nav></footer>`;
  }
}
customElements.define("paw-site-header", PawSiteHeader);
customElements.define("paw-site-footer", PawSiteFooter);
applyLanguage(language);
