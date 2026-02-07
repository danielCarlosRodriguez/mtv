import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "..", ".env");

try {
  const raw = fs.readFileSync(envPath);
  const hasUtf8Bom =
    raw.length >= 3 && raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf;
  const hasUtf16LeBom = raw.length >= 2 && raw[0] === 0xff && raw[1] === 0xfe;
  const hasUtf16BeBom = raw.length >= 2 && raw[0] === 0xfe && raw[1] === 0xff;

  console.log("Info: .env bytes =", raw.length);
  if (hasUtf8Bom) {
    console.warn("Aviso: .env tiene BOM UTF-8.");
  }
  if (hasUtf16LeBom || hasUtf16BeBom) {
    console.warn("Aviso: .env parece estar en UTF-16.");
    console.warn("Sugerencia: guarda el archivo como UTF-8 sin BOM.");
  }
} catch (error) {
  console.warn("Aviso: no se pudo leer .env desde:", envPath);
  console.warn("Detalle:", error?.message ?? error);
}

const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  console.warn("Aviso: no se pudo leer .env desde:", envPath);
  console.warn("Detalle:", envResult.error.message);
}
if (envResult.parsed) {
  console.log("Info: variables cargadas desde .env =", Object.keys(envResult.parsed).length);
}

const rawApiKey = process.env.OPENAI_API_KEY;
const apiKey = rawApiKey?.trim();

if (!apiKey) {
  console.error("ERROR: No se encontró OPENAI_API_KEY en el entorno.");
  console.error("Asegúrate de tenerlo en el archivo .env en la raíz.");
  process.exit(1);
}

if (rawApiKey !== apiKey) {
  console.warn("Aviso: OPENAI_API_KEY tenía espacios y fue recortada.");
}

if (/\s/.test(apiKey)) {
  console.warn(
    "Aviso: OPENAI_API_KEY contiene espacios o saltos de línea internos."
  );
}

console.log("Info: longitud de OPENAI_API_KEY =", apiKey.length);

const url = "https://api.openai.com/v1/models";

try {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`ERROR: ${response.status} ${response.statusText}`);
    console.error("Detalle:", data);
    process.exit(1);
  }

  const firstModel = Array.isArray(data?.data) ? data.data[0]?.id : null;
  console.log("OK: La API key funciona.");
  if (firstModel) {
    console.log("Ejemplo de modelo disponible:", firstModel);
  }
} catch (error) {
  console.error("ERROR: Falló la llamada a la API.");
  console.error(error);
  process.exit(1);
}
