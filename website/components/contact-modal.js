import { contact } from "../data/contact.js";

class ContactModal extends HTMLElement {
  connectedCallback() {
    if (!this.handleDocumentClick) {
      this.handleDocumentClick = (event) => {
        const trigger = event.target.closest("[data-contact-open]");
        const dialog = this.querySelector("dialog");
        if (!dialog) return;
        if (trigger && !dialog.open) dialog.showModal();
        if (event.target === dialog) dialog.close();
      };
      document.addEventListener("click", this.handleDocumentClick);
    }

    if (!this.handleLanguageChange) {
      this.handleLanguageChange = () => this.applyLanguage();
      window.addEventListener("site-language-change", this.handleLanguageChange);
    }

    this.render();
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleDocumentClick);
    window.removeEventListener("site-language-change", this.handleLanguageChange);
    this.handleDocumentClick = null;
    this.handleLanguageChange = null;
  }

  render() {
    const lang = localStorage.getItem("site-language") || "zh";
    this.innerHTML = `
      <dialog class="contact-modal" aria-labelledby="contact-title">
        <form method="dialog" class="contact-card-modal">
          <button class="modal-close" value="close" aria-label="${lang === "en" ? "Close contact dialog" : "关闭联系弹窗"}">×</button>
          <picture class="contact-card-modal__media">
            <source media="(max-width: 760px)" srcset="${contact.avatar}" />
            <img class="contact-card-modal__photo" src="${contact.portrait}" alt="${lang === "en" ? `Portrait of ${contact.name.en}` : `${contact.name.zh}照片`}" />
          </picture>
          <div class="contact-card-modal__body">
            <div class="contact-card-modal__identity">
              <h2 id="contact-title">${lang === "en" ? contact.name.en : contact.name.zh}</h2>
              <p>${lang === "en" ? contact.title.en : contact.title.zh}</p>
            </div>
            <div class="contact-lines">
              <a href="mailto:${contact.email}"><span>Email</span><span>${contact.email}</span></a>
              <a href="tel:${contact.phone.href}"><span>Phone</span><span>${contact.phone.display}</span></a>
              <a href="${contact.linkedin.url}" target="_blank" rel="noreferrer"><span>LinkedIn</span><span>${contact.linkedin.display}</span></a>
              <a href="${contact.github.url}" target="_blank" rel="noreferrer"><span>GitHub</span><span>${contact.github.display}</span></a>
              <a href="${contact.wechat.url}"><span>WeChat</span><span>${contact.wechat.id}</span></a>
            </div>
          </div>
        </form>
      </dialog>
    `;
  }

  applyLanguage() {
    const lang = localStorage.getItem("site-language") === "en" ? "en" : "zh";
    const isEnglish = lang === "en";
    const title = this.querySelector("#contact-title");
    const identity = this.querySelector(".contact-card-modal__identity p");
    const photo = this.querySelector(".contact-card-modal__photo");
    const close = this.querySelector(".modal-close");

    if (title) title.textContent = isEnglish ? contact.name.en : contact.name.zh;
    if (identity) identity.textContent = isEnglish ? contact.title.en : contact.title.zh;
    if (photo) {
      photo.alt = isEnglish ? `Portrait of ${contact.name.en}` : `${contact.name.zh}照片`;
    }
    if (close) close.setAttribute("aria-label", isEnglish ? "Close contact dialog" : "关闭联系弹窗");
  }
}

customElements.define("contact-modal", ContactModal);
