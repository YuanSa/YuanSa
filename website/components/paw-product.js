import { translate, getLanguage } from "./paw-site.js";
import { buildSkinPackage } from "./paw-package.js";

const assets = "/assets/projects/taoqizhuazhua/coats/";
const stage = document.querySelector("#paw-stage");
const demo = document.querySelector("#demo-paw");
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
let selectedCoat = "tabby", patTimer;
function pat() {
  stage.classList.add("is-patting");
  clearTimeout(patTimer);
  patTimer = setTimeout(() => stage.classList.remove("is-patting"), 240);
}
stage.addEventListener("pointermove", event => {
  if (motionPreference.matches || event.pointerType === "touch") return;
  const bounds = stage.getBoundingClientRect();
  stage.style.setProperty("--move-x", `${(event.clientX - bounds.left - bounds.width / 2) * .16}px`);
  stage.style.setProperty("--move-y", `${(event.clientY - bounds.top - bounds.height / 2) * .12}px`);
});
stage.addEventListener("pointerleave", () => {
  stage.style.setProperty("--move-x", "0px");
  stage.style.setProperty("--move-y", "0px");
});
stage.addEventListener("click", pat);
document.querySelectorAll("[data-coat]").forEach(button => button.addEventListener("click", () => {
  selectedCoat = button.dataset.coat;
  demo.src = `${assets}${selectedCoat}.png`;
  document.querySelectorAll("[data-coat]").forEach(coat => coat.setAttribute("aria-pressed", String(coat === button)));
  pat();
}));

const form = document.querySelector("#skin-form");
const fileInput = document.querySelector("#skin-file");
const nameInput = document.querySelector("#skin-name");
const preview = document.querySelector("#skin-image");
const caption = document.querySelector("#skin-caption");
const status = document.querySelector("#skin-status");
const exportButton = document.querySelector("#export-skin");
const sampleButton = document.querySelector("#use-sample");
let texture, previewURL, operation = 0, busy = false, statusMessage = null;
function message(zh, en, state = "info") {
  statusMessage = { zh, en, state };
  status.textContent = translate(zh, en);
  status.dataset.state = state;
}
function updateCaption() {
  caption.textContent = nameInput.value.trim() || (texture ? translate("我的猫爪", "My paw") : translate("你的猫爪，会出现在这里", "Your paw goes here"));
}
// These labels are dynamic; they must not be overwritten by the static language pass.
caption.removeAttribute("data-en");
function setBusy(next) {
  busy = next;
  exportButton.disabled = next;
  sampleButton.disabled = next;
  form.setAttribute("aria-busy", String(next));
  exportButton.textContent = next ? translate("正在准备皮肤…", "Preparing your skin…") : translate("下载我的 .paw 皮肤 ↓", "Download my .paw skin ↓");
}
exportButton.removeAttribute("data-en");
nameInput.addEventListener("input", updateCaption);
window.addEventListener("paw-language-change", () => {
  updateCaption();
  setBusy(busy);
  if (statusMessage) message(statusMessage.zh, statusMessage.en, statusMessage.state);
});

const errors = {
  size: ["请选择不超过 10 MB 的 PNG 图片。", "Choose a PNG image no larger than 10 MB."],
  format: ["仅支持带透明通道的 PNG，请先转换图片格式。", "Use a PNG with an alpha channel. Convert your image first."],
  dimensions: ["图片长宽需在 1 至 4096 像素之间，请缩小后重试。", "Image dimensions must be between 1 and 4096 pixels. Resize it and try again."],
  alpha: ["图片没有透明区域。请先移除背景，导出透明 PNG。", "This image has no transparent area. Remove its background and export a transparent PNG."],
  decode: ["无法读取这张图片，请检查文件是否损坏，或重新导出 PNG。", "This image could not be read. Check the file or export it as PNG again."],
  network: ["示例猫爪暂时无法加载，请重试，或选择本地图片。", "The sample could not be loaded. Try again or choose a local image."],
};
function pngDimensions(bytes) {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length < 33 || !signature.every((byte, i) => byte === bytes[i])) throw new Error("format");
  const data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (data.getUint32(8) !== 13 || data.getUint32(12) !== 0x49484452) throw new Error("format");
  const width = data.getUint32(16), height = data.getUint32(20);
  if (!width || !height || width > 4096 || height > 4096) throw new Error("dimensions");
  let hasAlpha = bytes[25] === 4 || bytes[25] === 6;
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const length = data.getUint32(offset);
    if (offset + length + 12 > bytes.length) throw new Error("decode");
    if (data.getUint32(offset + 4) === 0x74524e53) hasAlpha = true; // tRNS
    offset += length + 12;
  }
  if (!hasAlpha) throw new Error("format");
  return { width, height };
}
async function normalizePNG(file) {
  if (!file || file.size > 10 * 1024 * 1024) throw new Error("size");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const dimensions = pngDimensions(bytes);
  const url = URL.createObjectURL(new Blob([bytes], { type: "image/png" }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (image.naturalWidth !== dimensions.width || image.naturalHeight !== dimensions.height) throw new Error("decode");
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("decode");
    const scale = Math.min(512 / image.naturalWidth, 512 / image.naturalHeight);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const x = Math.floor((512 - width) / 2), y = Math.floor((512 - height) / 2);
    context.drawImage(image, x, y, width, height);
    const pixels = context.getImageData(x, y, width, height).data;
    let transparent = false, visible = false;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 255) transparent = true;
      if (pixels[i] > 0) visible = true;
      if (transparent && visible) break;
    }
    if (!transparent || !visible) throw new Error("alpha");
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("decode");
    return { bytes: new Uint8Array(await blob.arrayBuffer()), url: URL.createObjectURL(blob) };
  } catch (error) {
    if (error.message === "alpha") throw error;
    throw new Error("decode");
  } finally { URL.revokeObjectURL(url); }
}
async function loadTexture(source, defaultName) {
  const ticket = ++operation;
  texture = undefined;
  fileInput.removeAttribute("aria-invalid");
  preview.style.opacity = ".4";
  setBusy(true);
  message("正在检查图片与透明背景…", "Checking your image and its transparency…");
  try {
    const file = await source();
    if (ticket !== operation) return;
    const result = await normalizePNG(file);
    if (ticket !== operation) { URL.revokeObjectURL(result.url); return; }
    if (previewURL) URL.revokeObjectURL(previewURL);
    previewURL = result.url;
    texture = result.bytes;
    preview.src = previewURL;
    preview.style.opacity = "1";
    if (!nameInput.value.trim()) nameInput.value = Array.from(defaultName).slice(0, 40).join("");
    updateCaption();
    message("图片已就绪，填写名称后即可下载。", "Your image is ready. Name your paw and download it.", "success");
  } catch (error) {
    if (ticket !== operation) return;
    fileInput.setAttribute("aria-invalid", "true");
    const [zh, en] = errors[error.message] || errors.decode;
    message(zh, en, "error");
    updateCaption();
  } finally { if (ticket === operation) setBusy(false); }
}
function chooseFile(file) {
  if (!file) return;
  loadTexture(() => Promise.resolve(file), file.name.replace(/\.png$/i, ""));
}
fileInput.addEventListener("change", () => chooseFile(fileInput.files[0]));
const zone = document.querySelector("#upload-zone");
zone.addEventListener("dragover", event => { event.preventDefault(); zone.classList.add("is-dragging"); });
zone.addEventListener("dragleave", () => zone.classList.remove("is-dragging"));
zone.addEventListener("drop", event => {
  event.preventDefault();
  zone.classList.remove("is-dragging");
  chooseFile(event.dataTransfer.files[0]);
});
sampleButton.addEventListener("click", () => {
  const coat = selectedCoat;
  fileInput.value = "";
  loadTexture(async () => {
    let response;
    try { response = await fetch(`${assets}${coat}.png`); } catch { throw new Error("network"); }
    if (!response.ok) throw new Error("network");
    return response.blob();
  }, translate("我的猫爪", "My paw"));
});
form.addEventListener("submit", async event => {
  event.preventDefault();
  if (busy) return;
  if (!texture) {
    message("请先选择一张猫爪图片，或使用左侧的示例猫爪。", "Choose a paw image first, or try the sample paw.", "error");
    fileInput.focus();
    return;
  }
  const name = nameInput.value.trim();
  if (!name || Array.from(name).length > 40) {
    message("请填写 1 至 40 个字符的名称。", "Use a name between 1 and 40 characters.", "error");
    nameInput.focus();
    return;
  }
  const contactInput = document.querySelector("#skin-contact");
  const contact = contactInput.value.trim();
  if (contact) {
    try {
      const url = new URL(contact);
      if (!["http:", "https:"].includes(url.protocol) || !url.hostname) throw new Error();
    } catch {
      message("作者主页需要完整的 http:// 或 https:// 地址。", "Use a complete http:// or https:// website address.", "error");
      contactInput.focus();
      return;
    }
  }
  setBusy(true);
  try {
    const bytes = buildSkinPackage(name, texture, {
      author: document.querySelector("#skin-author").value,
      story: document.querySelector("#skin-story").value,
      contact,
    });
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/octet-stream" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")}.paw`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    message("皮肤已打包，下载后用淘气爪爪打开即可。", "Your skin is packaged. Open the download with Mischievous Paws.", "success");
  } catch {
    message("打包失败，请重新选择图片后再试一次。", "Packaging failed. Choose your image again and retry.", "error");
  } finally { setBusy(false); }
});

const promptText = document.querySelector("#paw-prompt-text");
const chinesePrompt = promptText.textContent;
const englishPrompt = `Create a photorealistic [Ragdoll] front paw and foreleg texture for a cursor effect.
Output a square 1024 × 1024 PNG with a real alpha-transparent background.
Top-down view of the back of the paw, toes pointing up and foreleg down, centered.
Place the whole paw in the upper half; extend the foreleg to the bottom edge.
Keep the foreleg naturally uniform in width, with consistent fur and lighting in the lower half so it can be repeated.
Preserve soft translucent fur edges and transparent space on both sides. Use soft, even lighting.
No shadow, text, watermark, or other body parts. Do not draw a checkerboard background.`;
function updatePrompt() { promptText.textContent = getLanguage() === "en" ? englishPrompt : chinesePrompt; }
window.addEventListener("paw-language-change", () => { updatePrompt(); document.querySelector("#copy-status").textContent = ""; });
updatePrompt();
document.querySelector("#copy-prompt").addEventListener("click", async () => {
  const copyStatus = document.querySelector("#copy-status");
  try {
    await navigator.clipboard.writeText(promptText.textContent);
    copyStatus.textContent = translate("提示词已复制。", "Prompt copied.");
  } catch { copyStatus.textContent = translate("无法自动复制，请选中上方文字手动复制。", "Copy was unavailable. Select the prompt above and copy it manually."); }
});
window.addEventListener("pagehide", event => {
  clearTimeout(patTimer);
  if (!event.persisted && previewURL) URL.revokeObjectURL(previewURL);
});
