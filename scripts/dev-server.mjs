// Servidor estático mínimo para desarrollo (T1): node:http, cero dependencias.
// Uso: npm run dev → http://localhost:4173
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const PUERTO = 4173;
const RAIZ = fileURLToPath(new URL("..", import.meta.url));

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const servidor = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PUERTO}`);
    let ruta = decodeURIComponent(url.pathname);
    if (ruta.endsWith("/")) {
      ruta += "index.html";
    }
    const archivo = normalize(join(RAIZ, ruta));
    if (!archivo.startsWith(RAIZ)) {
      res.writeHead(403).end("Prohibido");
      return;
    }
    const datos = await readFile(archivo);
    res
      .writeHead(200, { "Content-Type": TIPOS[extname(archivo)] ?? "application/octet-stream" })
      .end(datos);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("No encontrado");
  }
});

servidor.listen(PUERTO, () => {
  console.log(`Servidor de desarrollo en http://localhost:${PUERTO}`);
});
