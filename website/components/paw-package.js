// ZIP "store" format: no runtime dependency, network service, or compression worker.
// The app accepts this archive layout: config.json + assets/paw.png (schema v1).
const encoder = new TextEncoder();
const crcTable = Uint32Array.from({ length: 256 }, (_, value) => {
  for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  return value >>> 0;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function header(size, values) {
  const bytes = new Uint8Array(size);
  const view = new DataView(bytes.buffer);
  for (const [offset, value, width] of values) {
    if (width === 2) view.setUint16(offset, value, true);
    else view.setUint32(offset, value, true);
  }
  return bytes;
}
export function buildSkinPackage(name, texture, about = {}) {
  name = name.trim();
  if (!name || Array.from(name).length > 40) throw new Error("invalid-name");
  if (!(texture instanceof Uint8Array) || texture.length === 0 || texture.length > 10 * 1024 * 1024) throw new Error("invalid-texture");
  const manifest = { schemaVersion: 1, name, assets: { texture: "assets/paw.png" } };
  const metadata = {};
  for (const key of ["author", "story"]) if (about[key]?.trim()) metadata[key] = about[key].trim();
  if (about.contact?.trim()) {
    const url = new URL(about.contact.trim());
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname) throw new Error("invalid-contact");
    metadata.contact = { url: url.href };
  }
  if (Object.keys(metadata).length) manifest.about = metadata;
  const files = [["config.json", encoder.encode(JSON.stringify(manifest, null, 2))], ["assets/paw.png", texture]];
  const local = [], central = [];
  let offset = 0, directorySize = 0;
  for (const [path, data] of files) {
    const filename = encoder.encode(path);
    const crc = crc32(data);
    const entry = header(30, [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [12, 33, 2], [14, crc, 4], [18, data.length, 4], [22, data.length, 4], [26, filename.length, 2]]);
    const directory = header(46, [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [14, 33, 2], [16, crc, 4], [20, data.length, 4], [24, data.length, 4], [28, filename.length, 2], [42, offset, 4]]);
    local.push(entry, filename, data);
    central.push(directory, filename);
    offset += entry.length + filename.length + data.length;
    directorySize += directory.length + filename.length;
  }
  const end = header(22, [[0, 0x06054b50, 4], [8, files.length, 2], [10, files.length, 2], [12, directorySize, 4], [16, offset, 4]]);
  const result = new Uint8Array(offset + directorySize + end.length);
  let position = 0;
  for (const part of [...local, ...central, end]) { result.set(part, position); position += part.length; }
  if (result.length > 10 * 1024 * 1024) throw new Error("package-too-large");
  return result;
}
