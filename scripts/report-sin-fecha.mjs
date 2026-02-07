import fs from "node:fs";
import path from "node:path";

const dataDir = path.resolve("public", "data");
const reportDir = path.resolve("reports");
const reportPath = path.join(reportDir, "canciones-sin-fecha.md");

if (!fs.existsSync(dataDir)) {
  console.error("ERROR: No existe la carpeta:", dataDir);
  process.exit(1);
}

const files = fs
  .readdirSync(dataDir)
  .filter((name) => /^\d{4}\.json$/i.test(name))
  .sort();

const rows = [];

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

  for (const item of list) {
    const fecha = item?.fecha;
    if (fecha === undefined || fecha === null || String(fecha).trim() === "") {
      rows.push({
        file,
        name: item?.name ?? "(sin nombre)",
      });
    }
  }
}

fs.mkdirSync(reportDir, { recursive: true });

const lines = [];
lines.push("# Canciones sin fecha");
lines.push("");
lines.push("| nombre de archivo | name |");
lines.push("| --- | --- |");
for (const row of rows) {
  lines.push(`| ${row.file} | ${row.name} |`);
}
lines.push("");

fs.writeFileSync(reportPath, lines.join("\n"), "utf8");
console.log("OK: reporte generado en", reportPath);
console.log("Total sin fecha:", rows.length);
