import fs from "node:fs";
import path from "node:path";

const reportPath = path.resolve("reports", "canciones-sin-fecha.md");
const dataPath = path.resolve("public", "data", "2006.json");

if (!fs.existsSync(reportPath)) {
  console.error("ERROR: No existe el reporte:", reportPath);
  process.exit(1);
}

if (!fs.existsSync(dataPath)) {
  console.error("ERROR: No existe el archivo:", dataPath);
  process.exit(1);
}

const report = fs.readFileSync(reportPath, "utf8");
const lines = report.split(/\r?\n/);

const fechaByName = new Map();
const fechaBySong = new Map();
const fechaBySongNorm = new Map();
const fechaByArtistSongNorm = new Map();

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

for (const line of lines) {
  if (!line.startsWith("|")) continue;
  const cols = line
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
  if (cols.length !== 4) continue;
  const [file, artist, song, fecha] = cols;
  if (file.toLowerCase() === "nombre de archivo") continue;
  if (file !== "2006.json") continue;
  if (!fecha) continue;
  const artistKey = String(artist ?? "").trim();
  const songKey = String(song ?? "").trim();
  const name = `${artistKey} | ${songKey}`.trim();
  fechaByName.set(name, fecha.trim());
  if (songKey) {
    fechaBySong.set(songKey, fecha.trim());
    const songNorm = normalizeText(songKey);
    if (songNorm) {
      fechaBySongNorm.set(songNorm, fecha.trim());
    }
  }
  const artistSongNorm = `${normalizeText(artistKey)}|${normalizeText(songKey)}`;
  if (artistSongNorm !== "|") {
    fechaByArtistSongNorm.set(artistSongNorm, fecha.trim());
  }
}

if (fechaByName.size === 0) {
  console.error("ERROR: No se encontraron filas para 2006.json en el reporte.");
  process.exit(1);
}

const raw = fs.readFileSync(dataPath, "utf8");
let json;
try {
  json = JSON.parse(raw);
} catch (error) {
  console.error("ERROR: JSON inválido en", dataPath);
  console.error(error?.message ?? error);
  process.exit(1);
}

const yearKey = Object.keys(json)[0];
const list = Array.isArray(json[yearKey]) ? json[yearKey] : [];

let updated = 0;
let updatedBySong = 0;
let updatedBySongNorm = 0;
let updatedByArtistSongNorm = 0;
let already = 0;
const missing = [];

for (const item of list) {
  const name = String(item?.name ?? "").trim();
  const [artistPart, songPart] = name.split("|").map((part) => part.trim());
  const fechaByFull = fechaByName.get(name);
  const fechaByTitle = songPart ? fechaBySong.get(songPart) : undefined;
  const fechaByTitleNorm = songPart
    ? fechaBySongNorm.get(normalizeText(songPart))
    : undefined;
  const artistSongNorm =
    artistPart && songPart
      ? `${normalizeText(artistPart)}|${normalizeText(songPart)}`
      : "";
  const fechaByArtistSong = artistSongNorm
    ? fechaByArtistSongNorm.get(artistSongNorm)
    : undefined;
  const fecha =
    fechaByFull ?? fechaByTitle ?? fechaByTitleNorm ?? fechaByArtistSong;
  if (!fecha) continue;
  if (String(item?.fecha ?? "").trim()) {
    already += 1;
    continue;
  }
  item.fecha = fecha;
  updated += 1;
  if (!fechaByFull && fechaByTitle) {
    updatedBySong += 1;
  }
  if (!fechaByFull && !fechaByTitle && fechaByTitleNorm) {
    updatedBySongNorm += 1;
  }
  if (!fechaByFull && !fechaByTitle && !fechaByTitleNorm && fechaByArtistSong) {
    updatedByArtistSongNorm += 1;
  }
}

for (const [name, fecha] of fechaByName.entries()) {
  const found = list.some((item) => String(item?.name ?? "").trim() === name);
  if (!found) {
    missing.push({ name, fecha });
  }
}

fs.writeFileSync(dataPath, JSON.stringify({ [yearKey]: list }, null, 2), "utf8");

console.log("OK: fechas aplicadas en 2006.json");
console.log("Actualizadas:", updated);
console.log("Actualizadas por título:", updatedBySong);
console.log("Actualizadas por título normalizado:", updatedBySongNorm);
console.log(
  "Actualizadas por artista+título normalizado:",
  updatedByArtistSongNorm
);
console.log("Ya tenían fecha:", already);
console.log("Sin coincidencia:", missing.length);
if (missing.length) {
  console.log(
    missing
      .slice(0, 15)
      .map((m) => `- ${m.name} (${m.fecha})`)
      .join("\n")
  );
  if (missing.length > 15) {
    console.log(`... y ${missing.length - 15} más`);
  }
}
