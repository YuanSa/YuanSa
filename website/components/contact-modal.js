import { contact } from "../data/contact.js";

class ContactModal extends HTMLElement {
  connectedCallback() {
    const lang = localStorage.getItem("site-language") || "zh";
    this.innerHTML = `
      <dialog class="contact-modal" aria-labelledby="contact-title">
        <form method="dialog" class="contact-card-modal">
          <button class="modal-close" value="close" aria-label="关闭联系弹窗">×</button>
          <picture class="contact-card-modal__media">
            <source media="(max-width: 760px)" srcset="${contact.avatar}" />
            <img class="contact-card-modal__photo" src="${contact.portrait}" alt="${contact.name.zh}照片" />
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

    const dialog = this.querySelector("dialog");
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-contact-open]");
      if (trigger) dialog.showModal();
      if (event.target === dialog) dialog.close();
    });

    window.addEventListener("site-language-change", () => this.connectedCallback(), { once: true });
  }
}

customElements.define("contact-modal", ContactModal);
