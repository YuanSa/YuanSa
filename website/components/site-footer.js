import { contact } from "../data/contact.js";

class SiteFooter extends HTMLElement {
  connectedCallback() {
    const lang = localStorage.getItem("site-language") || "zh";
    this.innerHTML = `
      <footer class="site-footer">
        <div class="site-footer__inner page-container">
          <div class="footer-profile">
            <img src="${contact.avatar}" alt="${contact.name.zh}照片" />
            <div>
              <p>${lang === "en" ? contact.name.en : contact.name.zh}</p>
              <span>${lang === "en" ? contact.title.en : contact.title.zh}</span>
            </div>
          </div>
          <div class="footer-right">
            <address class="footer-contact">
              <a href="mailto:${contact.email}">${contact.email}</a>
              <a href="tel:${contact.phone.href}">${contact.phone.display}</a>
            </address>
            <nav class="footer-social" aria-label="社交媒体">
              <a class="social-icon" href="${contact.linkedin.url}" target="_blank" rel="noreferrer" aria-label="${contact.linkedin.label}">
                <img src="${contact.linkedin.icon}" alt="" />
              </a>
              <a class="social-icon" href="${contact.github.url}" target="_blank" rel="noreferrer" aria-label="${contact.github.label}">
                <img src="${contact.github.icon}" alt="" />
              </a>
              <a class="social-icon" href="${contact.wechat.url}" aria-label="WeChat">
                <img src="${contact.wechat.icon}" alt="" />
              </a>
            </nav>
          </div>
        </div>
      </footer>
    `;

    window.addEventListener("site-language-change", () => this.connectedCallback(), { once: true });
  }
}

customElements.define("site-footer", SiteFooter);
