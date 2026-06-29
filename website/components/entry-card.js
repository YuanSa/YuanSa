class EntryCard extends HTMLElement {
  connectedCallback() {
    const number = this.getAttribute("number") || "";
    const lang = localStorage.getItem("site-language") || "zh";
    const title = lang === "en" ? this.getAttribute("title-en") || this.getAttribute("title") || "" : this.getAttribute("title") || "";
    const href = this.getAttribute("href") || "/";
    const text = lang === "en" ? this.getAttribute("text-en") || this.getAttribute("text") || "" : this.getAttribute("text") || "";

    this.innerHTML = `
      <a class="entry-card" href="${href}">
        <span class="entry-card__number">${number}</span>
        <strong>${title}</strong>
        <span class="entry-card__text">${text}</span>
      </a>
    `;

    window.addEventListener("site-language-change", () => this.connectedCallback(), { once: true });
  }
}

customElements.define("entry-card", EntryCard);
