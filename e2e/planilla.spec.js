import { test, expect } from "@playwright/test";
import { COLUMNAS } from "../js/serializacion.js";
import { ID_TOKEN_E2E } from "./dobles.js";

// T20: la planilla "FichaCataWeb" se busca o crea sola. Drive y Sheets simulados
// siempre (nunca una planilla real; skill datos-sensibles).

async function prepararPrimeraVez(page, archivos = []) {
  const llamadas = { drive: 0, crear: 0, encabezados: [], append: [] };
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
  await page.route("https://www.googleapis.com/**", async (ruta) => {
    llamadas.drive += 1;
    await ruta.fulfill({ json: { files: archivos } });
  });
  await page.route("https://sheets.googleapis.com/**", async (ruta) => {
    const url = new URL(ruta.request().url());
    if (
      url.pathname === "/v4/spreadsheets" &&
      ruta.request().method() === "POST"
    ) {
      llamadas.crear += 1;
      await ruta.fulfill({ json: { spreadsheetId: "PLANILLA_NUEVA" } });
    } else if (ruta.request().method() === "PUT") {
      llamadas.encabezados.push(JSON.parse(ruta.request().postData()));
      await ruta.fulfill({ json: {} });
    } else if (url.pathname.includes(":batchGet")) {
      await ruta.fulfill({ json: { valueRanges: [{ values: [COLUMNAS] }] } });
    } else if (url.pathname.includes(":append")) {
      llamadas.append.push({
        ruta: url.pathname,
        celdas: JSON.parse(ruta.request().postData()).values[0],
      });
      await ruta.fulfill({ json: {} });
    } else {
      await ruta.fulfill({ json: {} });
    }
  });
  await page.goto("/");
  return llamadas;
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

test("T20: la primera guardada crea FichaCataWeb con los 35 encabezados y registra", async ({
  page,
}) => {
  const llamadas = await prepararPrimeraVez(page);
  await completarObligatorios(page);

  await page.getByRole("button", { name: "Guardar" }).click();

  await expect(page.locator("#estado-guardado")).toHaveText("Ficha guardada.");
  expect(llamadas.drive).toBe(1); // una sola búsqueda por nombre
  expect(llamadas.crear).toBe(1); // una sola creación
  expect(llamadas.encabezados).toHaveLength(1);
  expect(llamadas.encabezados[0].values[0]).toEqual(COLUMNAS); // fila 1 exacta
  expect(llamadas.append).toHaveLength(1);
  expect(llamadas.append[0].ruta).toContain("PLANILLA_NUEVA");
  expect(llamadas.append[0].celdas).toContain("Bodega Ejemplo");
  // El ID queda recordado en el navegador.
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("ficha:id-planilla")))
    .toBe("PLANILLA_NUEVA");
});

test("T20: buscar sin planilla todavía no crea ninguna (solo dice sin resultados)", async ({
  page,
}) => {
  const llamadas = await prepararPrimeraVez(page);
  await page.getByRole("button", { name: "Buscar fichas" }).click();
  await page.getByLabel("Búsqueda por bodega o línea").fill("ejemp");

  await expect(page.locator("#estado-busqueda")).toContainText(
    "Sin resultados",
  );
  expect(llamadas.drive).toBe(1); // localizó (y no encontró) la planilla
  expect(llamadas.crear).toBe(0); // la búsqueda no crea
});

test("T20: si Drive ya tiene una FichaCataWeb, la reutiliza sin crear otra", async ({
  page,
}) => {
  const llamadas = await prepararPrimeraVez(page, [{ id: "PLANILLA_VIEJA" }]);
  await completarObligatorios(page);

  await page.getByRole("button", { name: "Guardar" }).click();

  await expect(page.locator("#estado-guardado")).toHaveText("Ficha guardada.");
  expect(llamadas.crear).toBe(0);
  expect(llamadas.encabezados).toHaveLength(0); // no reescribe encabezados ajenos
  expect(llamadas.append[0].ruta).toContain("PLANILLA_VIEJA");
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("ficha:id-planilla")))
    .toBe("PLANILLA_VIEJA");
});
