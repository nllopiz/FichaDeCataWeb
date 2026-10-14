import { test, expect } from "@playwright/test";
import { COLUMNAS, serializarFila } from "../js/serializacion.js";
import { ID_TOKEN_E2E } from "./dobles.js";

const FICHA_EJEMPLO = {
  id: 1728000000001,
  bodega: "Bodega Ejemplo",
  linea: "Línea Prueba Malbec",
  tipo: "Tinto",
  composicion: [{ varietal: "Malbec", porcentaje: 100 }],
  cosecha: 2022,
  graduacion: 14,
  autor: "dueno@ejemplo.test",
  fecha_creacion: "01/10/2026 10:00",
  fecha_modificacion: "01/10/2026 10:00",
};

// GIS simulado con token automático; Sheets con hoja en memoria (datos ficticios).
async function prepararPagina(page, filas) {
  const hoja = { filas: filas.map(serializarFila), lecturas: 0 };
  await page.route("https://accounts.google.com/**", (ruta) => ruta.abort());
  await page.addInitScript((idToken) => {
    window.google = {
      accounts: {
        oauth2: {
          initTokenClient: (config) => ({
            requestAccessToken: () =>
              config.callback({
                access_token: "TOKEN_E2E",
                id_token: idToken,
              }),
          }),
          revoke: () => {},
        },
      },
    };
  }, ID_TOKEN_E2E);
  await page.route("https://sheets.googleapis.com/**", async (ruta) => {
    const url = new URL(ruta.request().url());
    if (url.pathname.includes(":batchGet")) {
      hoja.lecturas += 1;
      await ruta.fulfill({
        json: { valueRanges: [{ values: [COLUMNAS, ...hoja.filas] }] },
      });
    } else if (url.pathname.includes(":append")) {
      hoja.filas.push(JSON.parse(ruta.request().postData()).values[0]);
      await ruta.fulfill({ json: {} });
    } else if (url.pathname.includes(":batchUpdate")) {
      await ruta.fulfill({ json: { responses: [{}] } });
    } else {
      await ruta.fulfill({ json: {} });
    }
  });
  await page.goto("/");
  return hoja;
}

async function completarObligatorios(page) {
  await page.getByLabel("Bodega", { exact: true }).fill("Bodega Ejemplo");
  await page.getByLabel("Tipo de vino").selectOption("Tinto");
  await page
    .getByLabel("Nombre de la línea de vino")
    .fill("Línea Prueba Malbec");
  await page.getByLabel("Varietal").first().fill("Malbec");
  await page.getByLabel("Porcentaje").first().fill("100");
  await page.getByLabel("Cosecha").selectOption("2022");
  await page.getByLabel("Graduación alcohólica").fill("13.5");
}

test("CA-4: con la conexión cortada, la recarga muestra el avance restaurado", async ({
  page,
}) => {
  await prepararPagina(page, [FICHA_EJEMPLO]);

  await page.getByLabel("Bodega", { exact: true }).fill("Bodega Ejemplo");
  await page
    .getByLabel("Nombre de la línea de vino")
    .fill("Línea Prueba Malbec");

  // Se corta la conexión a mitad de todo: ni Sheets ni Google responden.
  await page.route("https://sheets.googleapis.com/**", (ruta) => ruta.abort());
  await page.route("https://accounts.google.com/**", (ruta) => ruta.abort());
  await page.reload();

  await expect(page.getByLabel("Bodega", { exact: true })).toHaveValue(
    "Bodega Ejemplo",
  );
  await expect(page.getByLabel("Nombre de la línea de vino")).toHaveValue(
    "Línea Prueba Malbec",
  );
  await expect(page.locator("#estado-guardado")).toHaveText(
    "Recuperamos lo que habías cargado.",
  );
});

test("CA-10: la búsqueda con caché precargada responde en menos de 2 s con 500 fichas", async ({
  page,
}) => {
  const fichas = Array.from({ length: 500 }, (_, i) => ({
    ...FICHA_EJEMPLO,
    id: 1728000001000 + i,
    bodega: `Bodega Ficticia ${i}`,
    linea: `Línea Ficticia ${i}`,
  }));
  const hoja = await prepararPagina(page, fichas);

  // Identificar al guardar dispara la precarga en segundo plano (RNF-3).
  await completarObligatorios(page);
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.locator("#estado-guardado")).toHaveText("Ficha guardada.");
  await expect.poll(() => hoja.lecturas).toBeGreaterThanOrEqual(1);

  // Primera búsqueda con la caché precargada: medido de punta a punta.
  await page.getByRole("button", { name: "Buscar fichas" }).click();
  const inicio = Date.now();
  await page.getByLabel("Búsqueda por bodega o línea").fill("ficticia 42");
  await expect(page.locator("#resultados-busqueda")).toContainText(
    "Bodega Ficticia 42",
  );
  const demora = Date.now() - inicio;

  expect(demora).toBeLessThan(2000);
});
