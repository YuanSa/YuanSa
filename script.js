const translations = {
  zh: {
    "meta.title": "杨子涵 | AI 时代的业务解决方案专家",
    "brand.tagline": "杨子涵 - AI 时代的业务解决方案专家",
    "nav.contact": "联系我",
    "hero.titleLine1": "帮助你的业务快速落地、持久迭代、拥抱 AI",
    "hero.lead1": "快速从0到1落地新项目",
    "hero.lead2": "建设可持续迭代、维护的产品架构",
    "hero.lead3": "AI 赋能现有业务流程降本增效",
    "hero.primaryCta": "联系我，立刻开始定制你的专属产品方案",
    "highlights.title": "提供专业的业务解决方案",
    "highlights.card1Title": "快速落地新业务与新项目",
    "highlights.card1Body":
      "当业务需要快速启动时，我能把模糊目标拆成可执行方案，在有限时间内完成从需求理解、方案设计到产品落地的完整推进。",
    "highlights.card2Title": "支撑复杂业务长期迭代",
    "highlights.card2Body":
      "当业务规则复杂、流程持续演化时，我能设计更稳健的产品结构与工程方案，让系统既能承接当下复杂度，也能持续支持后续扩展。",
    "highlights.card3Title": "把 AI 平滑接入现有流程",
    "highlights.card3Body":
      "当团队希望用 AI 提效时，我更关注如何在不打断现有业务的前提下，把 AI 平滑接入真实工作流，逐步实现降本增效。",
    "experience.title": "项目案例",
    "experience.item1Title": "从 0 到 1 快速落地 SoundOn",
    "experience.item1Body":
      "在 SoundOn 项目中，我曾在高压周期内，用一个月完成大型项目从方案到上线的落地，并在起步阶段设计出足够稳健的技术架构。四年之后，这套架构依然几乎没有发生根本性变化，却持续高效支撑着业务迭代。",
    "experience.item2Title": "用系统设计驾驭音乐行业历史复杂性",
    "experience.item2Body":
      "在 SoundOn 的发行场景中，我设计出灵活可扩展的表单数据组织方式与校验系统，高效承接音乐发行行业复杂的校验规则、繁多的字段联动关系，以及海量 DSP 各不相同的定制化校验需求。",
    "experience.item3Title": "将 AI 平滑接入 SoundOn 人工客服实现降本增效",
    "experience.item3Body":
      "在 SoundOn 的客服业务中，我从真实痛点出发，循序渐进地引入 AI 客服能力，在保证业务平稳运行的前提下逐步降本增效，让客户体验与内部团队效率同时提升，形成更可持续的双赢结果。",
    "contact.name": "杨子涵",
    "contact.emailLabel": "邮箱",
    "contact.linkedinLabel": "LinkedIn",
    "contact.wechatLabel": "微信",
  },
  en: {
    "meta.title": "YANG Zihan | Business Solution Builder for the AI Era",
    "brand.tagline": "YANG Zihan - Business Solution Builder for the AI Era",
    "nav.contact": "Contact",
    "hero.titleLine1": "Ship faster, iterate longer, and bring AI into your business.",
    "hero.lead1": "Launch new projects quickly from 0 to 1",
    "hero.lead2": "Build product architecture that remains maintainable over time",
    "hero.lead3": "Use AI to improve the efficiency of existing business workflows",
    "hero.primaryCta": "Contact me to start your product solution",
    "highlights.title": "Professional business solutions",
    "highlights.card1Title": "Launch new products and initiatives quickly",
    "highlights.card1Body":
      "When a business needs to move fast, I turn ambiguous goals into executable plans and drive the full path from requirement framing to shipped product.",
    "highlights.card2Title": "Support long-term iteration in complex systems",
    "highlights.card2Body":
      "When workflows, rules, and constraints keep evolving, I design product and engineering structures that can handle present complexity while staying extensible over time.",
    "highlights.card3Title": "Integrate AI into existing operations smoothly",
    "highlights.card3Body":
      "When teams want AI to create efficiency, I focus on introducing it into real workflows without disrupting ongoing operations, so the gains are practical and sustainable.",
    "experience.title": "Showcase",
    "experience.item1Title": "Taking SoundOn from 0 to 1 at speed",
    "experience.item1Body":
      "At SoundOn, I helped deliver a major product from planning to launch within one month, while establishing a technical architecture strong enough to remain largely unchanged for four years and still support fast-moving business iteration.",
    "experience.item2Title": "Handling legacy complexity in the music industry through system design",
    "experience.item2Body":
      "Within SoundOn's distribution workflows, I designed a flexible data model and validation system that could support complex music distribution rules, intricate field dependencies, and highly customized validation logic across a large number of DSP partners.",
    "experience.item3Title": "Integrating AI into SoundOn human support for cost efficiency",
    "experience.item3Body":
      "Within SoundOn's customer support operations, I introduced AI in a gradual, low-risk way based on real pain points, improving cost efficiency while keeping operations stable and raising satisfaction for both customers and internal teams.",
    "contact.name": "YANG Zihan",
    "contact.emailLabel": "Email",
    "contact.linkedinLabel": "LinkedIn",
    "contact.wechatLabel": "WeChat",
  },
};

const languageButtons = document.querySelectorAll("[data-lang-switch]");
const languageToggle = document.querySelector(".lang-switch");
const i18nTargets = document.querySelectorAll("[data-i18n]");

function applyLanguage(lang) {
  const locale = translations[lang] ? lang : "zh";

  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  document.documentElement.classList.toggle("lang-en", locale === "en");
  document.documentElement.classList.toggle("lang-zh", locale === "zh");
  document.title = translations[locale]["meta.title"] || document.title;

  i18nTargets.forEach((node) => {
    const key = node.dataset.i18n;
    const value = translations[locale][key];
    if (value) {
      node.textContent = value;
    }
  });

  languageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.langSwitch === locale);
  });

  localStorage.setItem("portfolio-language", locale);
}

if (languageToggle) {
  languageToggle.addEventListener("click", () => {
    const currentLanguage = document.documentElement.classList.contains("lang-en") ? "en" : "zh";
    applyLanguage(currentLanguage === "zh" ? "en" : "zh");
  });
}

const browserLanguage = (navigator.language || navigator.userLanguage || "").toLowerCase();
const initialLanguage = localStorage.getItem("portfolio-language") || (browserLanguage.startsWith("zh") ? "zh" : "en");
applyLanguage(initialLanguage);
