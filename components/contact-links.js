import { contact } from "../data/contact.js";

class ContactLinks extends HTMLElement {}

function fillContactLinks() {
  const isEnglish = document.documentElement.lang === "en";

  document.querySelectorAll("[data-contact-name]").forEach((node) => {
    node.textContent = isEnglish ? contact.name.en : contact.name.zh;
  });

  document.querySelectorAll("[data-contact-phone]").forEach((node) => {
    node.href = `tel:${contact.phone.href}`;
    node.textContent = contact.phone.display;
  });

  document.querySelectorAll("[data-contact-email]").forEach((node) => {
    node.href = `mailto:${contact.email}`;
    node.textContent = contact.email;
  });

  document.querySelectorAll("[data-contact-location]").forEach((node) => {
    node.dataset.zh = contact.location.zh;
    node.dataset.en = contact.location.en;
    node.textContent = isEnglish ? contact.location.en : contact.location.zh;
  });
}

customElements.define("contact-links", ContactLinks);
fillContactLinks();
document.addEventListener("DOMContentLoaded", fillContactLinks);
window.addEventListener("site-language-change", fillContactLinks);
