import fs from "node:fs";
import path from "node:path";

const dataDir = path.resolve("public", "data");

if (!fs.existsSync(dataDir)) {
  console.error("ERROR: No existe la carpeta:", dataDir);
  process.exit(1);
}

const files = fs
  .readdirSync(dataDir)
  .filter((name) => /^\d{4}\.json$/i.test(name))
  .sort();

const dataByYear = new Map();

for (const file of files) {
  const filePath = path.join(dataDir, file);
  const content = fs.readFileSync(filePath, "utf8");
  let json;
  try {
    json = JSON.parse(content);
  } catch (error) {
    console.error("ERROR: JSON inválido en", filePath);
    console.error(error?.message ?? error);
    process.exit(1);
  }

  const yearKey = Object.keys(json)[0];
  if (!/^\d{4}$/.test(yearKey)) {
    console.error("ERROR: clave de año inválida en", filePath, "=>", yearKey);
    process.exit(1);
  }

  const list = Array.isArray(json[yearKey]) ? json[yearKey] : [];
  dataByYear.set(yearKey, list);
}

const seen = new Set();
const duplicates = [];
let totalBefore = 0;
let totalAfter = 0;

function buildKey(item) {
  const youtubeId = String(item?.youtubeId ?? "").trim();
  if (youtubeId) return `youtubeId:${youtubeId}`;

  const youtubeUrl = String(item?.youtubeUrl ?? "").trim();
  if (youtubeUrl) return `youtubeUrl:${youtubeUrl}`;

  const url = String(item?.url ?? "").trim();
  if (url) return `url:${url}`;

  const name = String(item?.name ?? "").trim();
  const fecha = String(item?.fecha ?? "").trim();
  return `nameFecha:${name}|${fecha}`;
}

for (const [year, list] of dataByYear.entries()) {
  totalBefore += list.length;
  const keep = [];
  for (const item of list) {
    const key = buildKey(item);
    if (seen.has(key)) {
      duplicates.push({
        name: item?.name ?? "(sin nombre)",
        year,
        key,
      });
      continue;
    }
    seen.add(key);
    keep.push(item);
  }
  dataByYear.set(year, keep);
  totalAfter += keep.length;
}

const years = Array.from(dataByYear.keys()).sort();
for (const year of years) {
  const filePath = path.join(dataDir, `${year}.json`);
  const payload = { [year]: dataByYear.get(year) ?? [] };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
}

console.log("OK: duplicados eliminados.");
console.log("Antes:", totalBefore, "Después:", totalAfter);
console.log("Duplicados removidos:", duplicates.length);
if (duplicates.length) {
  console.log(
    duplicates
      .slice(0, 20)
      .map((d) => `- ${d.name} (${d.year})`)
      .join("\n")
  );
  if (duplicates.length > 20) {
    console.log(`... y ${duplicates.length - 20} más`);
  }
}
