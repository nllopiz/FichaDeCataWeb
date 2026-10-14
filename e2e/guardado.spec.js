import { test, expect } from "@playwright/test";
import { COLUMNAS } from "../js/serializacion.js";
import { ID_TOKEN_E2E } from "./dobles.js";

// GIS simulado: el popup lo controla el test (nunca una cuenta real).
// Sheets simulado: se registran las llamadas para contar fichas (datos ficticios).
async function prepararPagina(page, { tokenAutomatico = false } = {}) {
  await page.route("https://accounts.google.com/**", (ruta) => ruta.abort());
  await page.addInitScript(
    ({ auto, idToken }) => {
      window.__solicitudesToken = 0;
      window.__callbackGIS = null;
      window.__errorGIS = null;
      window.__idTokenE2E = idToken;
      window.google = {
        accounts: {
          oauth2: {
            initTokenClient: (config) => ({
              requestAccessToken: () => {
                window.__solicitudesToken += 1;
                window.__callbackGIS = config.callback;
                window.__errorGIS = config.error_callback;
                if (auto) {
                  config.callback({
                    access_token: "TOKEN_E2E",
                    id_token: idToken,
                  });
                }
              },
            }),
            revoke: () => {},
          },
        },
      };
    },
    { auto: tokenAutomatico, idToken: ID_TOKEN_E2E },
  );

  const llamadas = { append: [], batchUpdate: [] };
  await page.route("https://sheets.googleapis.com/**", async (ruta) => {
    const url = new URL(ruta.request().url());
    if (url.pathname.includes(":batchGet")) {
      await ruta.fulfill({ json: { valueRanges: [{ values: [COLUMNAS] }] } });
    } else if (url.pathname.includes(":append")) {
      llamadas.append.push(JSON.parse(ruta.request().postData()));
      await ruta.fulfill({ json: {} });
    } else if (url.pathname.includes(":batchUpdate")) {
      llamadas.batchUpdate.push(JSON.parse(ruta.request().postData()));
      await ruta.fulfill({ json: { responses: [{}] } });
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

test("CA-20: guardar sin identificar pide identificación y, tras ella, registra", async ({
  page,
}) => {
  const llamadas = await prepararPagina(page);
  await completarObligatorios(page);

  await page.getByRole("button", { name: "Guardar" }).click();

  await expect
    .poll(() => page.evaluate(() => window.__solicitudesToken))
    .toBe(1);
  expect(llamadas.append).toHaveLength(0); // sin token no se escribe nada

  await page.evaluate(() =>
    window.__callbackGIS({
      access_token: "TOKEN_E2E",
      id_token: window.__idTokenE2E,
    }),
  );

  await expect.poll(() => llamadas.append.length).toBe(1);
  await expect(page.locator("#estado-guardado")).toHaveText("Ficha guardada.");

  const celdas = llamadas.append[0].values[0];
  expect(typeof celdas[0]).toBe("number"); // id de creación
  expect(celdas).toContain("dueno@ejemplo.test"); // autor = cuenta elegida (CA-9, T19)
  expect(celdas.join(" ")).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/); // auditoría
});

test("CA-3: un doble toque en Guardar produce exactamente una ficha", async ({
  page,
}) => {
  const llamadas = await prepararPagina(page, { tokenAutomatico: true });
  await completarObligatorios(page);

  await page.getByRole("button", { name: "Guardar" }).dblclick();

  await expect.poll(() => llamadas.append.length).toBe(1);
  await page.waitForTimeout(300); // ventana de los 2 s del doble toque
  expect(llamadas.append).toHaveLength(1);
  expect(llamadas.batchUpdate).toHaveLength(0);
});

test("CA-21: cancelar la identificación no registra nada y no se pierde lo escrito", async ({
  page,
}) => {
  const llamadas = await prepararPagina(page);
  await completarObligatorios(page);

  await page.getByRole("button", { name: "Guardar" }).click();
  await expect
    .poll(() => page.evaluate(() => window.__solicitudesToken))
    .toBe(1);
  await page.evaluate(() =>
    window.__errorGIS({ type: "popup_closed_by_user" }),
  );

  await page.waitForTimeout(300);
  expect(llamadas.append).toHaveLength(0);
  await expect(page.getByLabel("Bodega", { exact: true })).toHaveValue(
    "Bodega Ejemplo",
  );
  await expect(page.locator("#estado-guardado")).toContainText(
    "no se registró ninguna ficha",
  );
});

test("RF-11: guardar incompleto muestra el motivo sin registrar", async ({
  page,
}) => {
  const llamadas = await prepararPagina(page);

  await page.getByRole("button", { name: "Guardar" }).click();

  await expect(page.locator("#estado-guardado")).toContainText(
    "Faltan campos obligatorios",
  );
  await expect(page.locator("#estado-guardado")).toContainText("Bodega");
  expect(llamadas.append).toHaveLength(0);
  expect(llamadas.batchUpdate).toHaveLength(0);
});
