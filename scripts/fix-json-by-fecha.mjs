import fs from "node:fs";
import path from "node:path";

const argDir = process.argv[2];
const dataDir = argDir
  ? path.resolve(argDir)
  : path.resolve("public", "data");

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

const moved = [];

for (const [year, list] of dataByYear.entries()) {
  const keep = [];
  for (const item of list) {
    const itemYear = String(item?.fecha ?? "").trim();
    if (!/^\d{4}$/.test(itemYear)) {
      keep.push(item);
      continue;
    }
    if (itemYear !== year) {
      const target = dataByYear.get(itemYear) ?? [];
      target.push(item);
      dataByYear.set(itemYear, target);
      moved.push({
        name: item?.name ?? "(sin nombre)",
        from: year,
        to: itemYear,
      });
    } else {
      keep.push(item);
    }
  }
  dataByYear.set(year, keep);
}

const years = Array.from(dataByYear.keys()).sort();
for (const year of years) {
  const filePath = path.join(dataDir, `${year}.json`);
  const payload = { [year]: dataByYear.get(year) ?? [] };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
}

console.log("OK: archivos actualizados.");
console.log("Movidos:", moved.length);
if (moved.length) {
  console.log(
    moved
      .slice(0, 20)
      .map((m) => `- ${m.name} (${m.from} -> ${m.to})`)
      .join("\n")
  );
  if (moved.length > 20) {
    console.log(`... y ${moved.length - 20} más`);
  }
}
