import fs from "node:fs";
import path from "node:path";

const dataDir = path.resolve("public", "data");
const reportDir = path.resolve("reports");
const reportPath = path.join(reportDir, "canciones-por-anio.md");

if (!fs.existsSync(dataDir)) {
  console.error("ERROR: No existe la carpeta:", dataDir);
  process.exit(1);
}

const files = fs
  .readdirSync(dataDir)
  .filter((name) => /^\d{4}\.json$/i.test(name))
  .sort();

const rows = [];
let total = 0;

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
  const list = Array.isArray(json[yearKey]) ? json[yearKey] : [];
  rows.push({ year: yearKey, count: list.length });
  total += list.length;
}

rows.sort((a, b) => a.year.localeCompare(b.year));

fs.mkdirSync(reportDir, { recursive: true });

const lines = [];
lines.push("# Canciones por año");
lines.push("");
lines.push(`Total de canciones: ${total}`);
lines.push("");
lines.push("| Año | Canciones |");
lines.push("| --- | --------- |");
for (const row of rows) {
  lines.push(`| ${row.year} | ${row.count} |`);
}
lines.push("");

fs.writeFileSync(reportPath, lines.join("\n"), "utf8");
console.log("OK: reporte generado en", reportPath);
