class NavMenu extends HTMLElement {
  connectedCallback() {
    const current = this.getAttribute("current") || "";
    const lang = localStorage.getItem("site-language") || "zh";
    const items = [
      ["work", "/work/", "业务解决方案", "Biz Solutions"],
      ["blog", "/blog/", "博客", "Blog"],
      ["projects", "/projects/", "个人项目", "Projects"],
      ["resume", "/resume/", "简历", "Resume"],
    ];

    this.innerHTML = `
      <nav class="nav-menu" aria-label="主导航">
        ${items.map(([key, href, zh, en]) => `
          <a href="${href}" ${current === key ? "aria-current=\"page\"" : ""}>${lang === "en" ? en : zh}</a>
        `).join("")}
      </nav>
    `;

    window.addEventListener("site-language-change", () => this.connectedCallback(), { once: true });
  }
}

customElements.define("nav-menu", NavMenu);
