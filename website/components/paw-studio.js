import { translate, getLanguage } from "./paw-site.js?v=20261017.4";
import { buildSkinPackage } from "./paw-package.js";
import { createPawPreview } from "./paw-preview.js?v=20261017.4";

const form = document.querySelector("#skin-form");
const fileInput = document.querySelector("#skin-file");
const nameInput = document.querySelector("#skin-name");
const preview = document.querySelector("#skin-image");
const desktopPreview = createPawPreview(document.querySelector("#skin-preview-canvas"), preview);
const nameHeading = document.querySelector("#name-step-heading");
const workingTitle = document.querySelector("#working-title");
const editNameButton = document.querySelector("#edit-skin-name");
const uploadStep = document.querySelector("#upload-step");
const editorStep = document.querySelector("#editor-step");
const uploadStatus = document.querySelector("#upload-status");
const status = document.querySelector("#skin-status");
const exportButton = document.querySelector("#export-skin");
const importDialog = document.querySelector("#import-dialog");
const nameStep = document.querySelector("#name-step");
const initialName = document.querySelector("#initial-skin-name");
const uploadErrorDialog = document.querySelector("#upload-error-dialog");
const uploadErrorDescription = document.querySelector("#upload-error-description");
let skinName = "", uploadErrorMessage;
let texture, previewURL, operation = 0, busy = false;
const messages = new Map();
function message(target, zh, en, state = "info") {
  messages.set(target, { zh, en, state });
  target.textContent = translate(zh, en);
  target.hidden = false;
  target.dataset.state = state;
}
function clearMessage(target) {
  messages.delete(target);
  target.textContent = "";
  target.hidden = true;
}
function setBusy(next) {
  busy = next;
  exportButton.disabled = next;
  fileInput.disabled = next;
  form.setAttribute("aria-busy", String(next));
  uploadStep.setAttribute("aria-busy", String(next));
  exportButton.textContent = next ? translate("正在生成…", "Generating…") : translate("生成皮肤", "Generate skin");
}
exportButton.removeAttribute("data-en");
window.addEventListener("paw-language-change", () => {
  setBusy(busy);
  updateTitle();
  if (uploadErrorMessage) uploadErrorDescription.textContent = translate(...uploadErrorMessage);
  for (const [target, text] of messages) target.textContent = translate(text.zh, text.en);
});
const errors = {
  size: ["请选择不超过 10 MB 的 PNG 图片。", "Choose a PNG image no larger than 10 MB."],
  format: ["请选择带透明背景的 PNG 图片。", "Choose a PNG with a transparent background."],
  dimensions: ["图片单边不能超过 4096 像素，请缩小后重试。", "Resize your image to no more than 4096 pixels per side."],
  alpha: ["图片没有透明区域，请移除背景后重新导出 PNG。", "Remove the image background and export it as a transparent PNG."],
  decode: ["无法读取这张图片，请重新导出 PNG 后再试。", "This image could not be read. Export it as PNG and try again."],
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
function updateTitle() {
  editNameButton.textContent = skinName;
  editNameButton.title = translate("修改名字", "Edit name");
}
function showStep(step) {
  nameHeading.hidden = step !== "name";
  workingTitle.hidden = step === "name";
  updateTitle();
  nameStep.hidden = step !== "name";
  uploadStep.hidden = step !== "upload";
  editorStep.hidden = step !== "editor";
}
nameStep.addEventListener("submit", event => {
  event.preventDefault();
  const name = initialName.value.trim();
  if (!name || Array.from(name).length > 40) {
    initialName.setCustomValidity(translate("请填写 1 至 40 个字符的皮肤名。", "Use a skin name between 1 and 40 characters."));
    initialName.reportValidity();
    return;
  }
  skinName = name;
  initialName.value = name;
  nameInput.value = name;
  updatePrompt();
  showStep(texture ? "editor" : "upload");
  (texture ? nameInput : fileInput).focus();
});
initialName.addEventListener("input", () => initialName.setCustomValidity(""));
nameInput.addEventListener("input", () => {
  skinName = nameInput.value.trim();
  initialName.value = skinName;
  updateTitle();
  updatePrompt();
});
document.querySelector("#edit-skin-name").addEventListener("click", () => {
  initialName.value = skinName;
  showStep("name");
  initialName.focus();
});
for (const id of ["close-upload-error", "dismiss-upload-error"]) {
  document.querySelector(`#${id}`).addEventListener("click", () => uploadErrorDialog.close());
}
uploadErrorDialog.addEventListener("close", () => {
  uploadErrorMessage = undefined;
  if (!uploadStep.hidden) fileInput.focus();
});
async function loadTexture(file) {
  if (!file || busy || !skinName || uploadStep.hidden) return;
  const ticket = ++operation;
  clearMessage(uploadStatus);
  fileInput.removeAttribute("aria-invalid");
  setBusy(true);
  message(uploadStatus, "正在读取图片…", "Reading image…");
  try {
    const result = await normalizePNG(file);
    if (ticket !== operation) { URL.revokeObjectURL(result.url); return; }
    texture = result.bytes;
    previewURL = result.url;
    preview.src = previewURL;
    nameInput.value = skinName;
    showStep("editor");
    clearMessage(uploadStatus);
    nameInput.focus();
  } catch (error) {
    if (ticket !== operation) return;
    fileInput.setAttribute("aria-invalid", "true");
    const [zh, en] = errors[error.message] || errors.decode;
    clearMessage(uploadStatus);
    uploadErrorMessage = [zh, en];
    uploadErrorDescription.textContent = translate(zh, en);
    fileInput.value = "";
    uploadErrorDialog.showModal();
    document.querySelector("#dismiss-upload-error").focus();
  } finally { if (ticket === operation) setBusy(false); }
}
fileInput.addEventListener("change", () => loadTexture(fileInput.files[0]));
const zone = document.querySelector("#upload-zone");
zone.addEventListener("dragover", event => { event.preventDefault(); zone.classList.add("is-dragging"); });
zone.addEventListener("dragleave", () => zone.classList.remove("is-dragging"));
zone.addEventListener("drop", event => {
  event.preventDefault();
  zone.classList.remove("is-dragging");
  loadTexture(event.dataTransfer.files[0]);
});
document.querySelector("#clear-skin").addEventListener("click", () => {
  ++operation;
  texture = undefined;
  preview.removeAttribute("src");
  desktopPreview.clear();
  if (previewURL) URL.revokeObjectURL(previewURL);
  previewURL = undefined;
  fileInput.value = "";
  fileInput.removeAttribute("aria-invalid");
  clearMessage(status);
  clearMessage(uploadStatus);
  skinName = nameInput.value.trim();
  updatePrompt();
  showStep(skinName ? "upload" : "name");
  setBusy(false);
  (skinName ? fileInput : initialName).focus();
});
form.addEventListener("submit", event => {
  event.preventDefault();
  if (busy || !texture) return;
  clearMessage(status);
  const name = nameInput.value.trim();
  if (!name || Array.from(name).length > 40) {
    message(status, "请填写 1 至 40 个字符的名字。", "Use a name between 1 and 40 characters.", "error");
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
      message(status, "作者主页地址无效，请检查后重试。", "Check the author website address and try again.", "error");
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
    importDialog.showModal();
    document.querySelector("#confirm-import").focus();
  } catch {
    message(status, "生成失败，请重试。", "Generation failed. Please try again.", "error");
  } finally { setBusy(false); }
});
for (const id of ["close-import", "confirm-import"]) {
  document.querySelector(`#${id}`).addEventListener("click", () => importDialog.close());
}
importDialog.addEventListener("click", event => {
  if (event.target !== importDialog) return;
  const box = importDialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) importDialog.close();
});
const promptText = document.querySelector("#paw-prompt-text");
function updatePrompt() {
  const chinesePrompt = `为鼠标猫爪特效生成一张写实的【${skinName}】前爪与前腿纹理。
输出 1024 × 1024 正方形 PNG，使用真实 alpha 透明通道。
俯视猫爪背面，爪尖朝上，前腿朝下，主体居中。
猫爪完整位于画面上半部分，前腿沿下半部分延伸到底边。
前腿宽度自然均匀，下半部分毛色和光照一致，便于重复延伸。
保留柔软绒毛边缘，左右留出透明空间，柔和均匀光照。
无投影、文字、水印或其他身体部位，不要画出透明棋盘格。`;
  const englishPrompt = `Create a photorealistic front paw and foreleg texture for a cat skin named "${skinName}".
Output a square 1024 × 1024 PNG with a real alpha-transparent background.
Top-down view of the back of the paw, toes pointing up and foreleg down, centered.
Place the whole paw in the upper half; extend the foreleg to the bottom edge.
Keep the foreleg naturally uniform in width, with consistent fur and lighting in the lower half so it can be repeated.
Preserve soft translucent fur edges and transparent space on both sides. Use soft, even lighting.
No shadow, text, watermark, or other body parts. Do not draw a checkerboard background.`;
  promptText.textContent = getLanguage() === "en" ? englishPrompt : chinesePrompt;
}
window.addEventListener("paw-language-change", () => { updatePrompt(); document.querySelector("#copy-status").textContent = ""; });
updatePrompt();
document.querySelector("#copy-prompt").addEventListener("click", async () => {
  const copyStatus = document.querySelector("#copy-status");
  try {
    await navigator.clipboard.writeText(promptText.textContent);
    copyStatus.hidden = false;
    copyStatus.textContent = translate("提示词已复制。", "Prompt copied.");
  } catch { copyStatus.hidden = false; copyStatus.textContent = translate("无法自动复制，请选中上方文字手动复制。", "Copy was unavailable. Select the prompt above and copy it manually."); }
});
window.addEventListener("pagehide", event => {
  if (!event.persisted) {
    if (previewURL) URL.revokeObjectURL(previewURL);
    desktopPreview.destroy();
  }
});
