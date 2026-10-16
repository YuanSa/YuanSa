// Match PawOverlay.swift drawTextures: full 180×180 paw, then alternating
// vertically mirrored 180×90 tiles cropped from the lower 512×256 half.
// Assemble at source resolution before rotating to avoid translucent tile seams.
export function createPawPreview(canvas, image) {
  const context = canvas.getContext("2d");
  let strip, frame;
  function makeStrip() {
    if (!image.complete || !image.naturalWidth) return;
    strip = document.createElement("canvas");
    strip.width = 512;
    strip.height = 512 + 256 * 8;
    const bitmap = strip.getContext("2d");
    bitmap.imageSmoothingEnabled = true;
    bitmap.imageSmoothingQuality = "high";
    bitmap.drawImage(image, 0, 0, 512, 512);
    for (let tile = 0; tile < 8; tile++) {
      bitmap.save();
      bitmap.translate(0, 512 + tile * 256);
      if (tile % 2 === 0) { bitmap.translate(0, 256); bitmap.scale(1, -1); }
      bitmap.drawImage(image, 0, image.naturalHeight / 2, image.naturalWidth, image.naturalHeight / 2, 0, 0, 512, 256);
      bitmap.restore();
    }
    render();
  }
  function render() {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height || !context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(bounds.width * ratio);
    canvas.height = Math.round(bounds.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, bounds.width, bounds.height);
    if (!strip) return;
    const cursor = { x: bounds.width * .40, y: bounds.height * .32 };
    const anchor = { x: bounds.width + 32, y: bounds.height + 32 };
    const angle = Math.atan2(anchor.y - cursor.y, anchor.x - cursor.x) - Math.PI / 2;
    // The native app uses standardTextureScale = 1.5 at its default paw size.
    const scale = bounds.width / 422 * 1.5;
    context.save();
    context.translate(cursor.x, cursor.y);
    context.rotate(angle);
    context.scale(scale, scale);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.shadowColor = "rgba(20, 15, 25, .18)";
    context.shadowBlur = 8;
    context.shadowOffsetY = 3;
    // Native y-up rect (-90,-120,180,180) plus its -18 offset,
    // converted to the browser's y-down coordinate system.
    context.drawImage(strip, -90, -42, 180, strip.height * 180 / 512);
    context.restore();
  }
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(render);
  });
  observer.observe(canvas);
  image.addEventListener("load", makeStrip);
  return {
    clear() { strip = undefined; context?.clearRect(0, 0, canvas.width, canvas.height); },
    destroy() { observer.disconnect(); cancelAnimationFrame(frame); image.removeEventListener("load", makeStrip); },
  };
}
