export function getPreferredLanguage() {
  return localStorage.getItem("site-language") || "zh";
}

export function setPreferredLanguage(language) {
  localStorage.setItem("site-language", language);
}
