import { test, expect } from "@playwright/test";
import { COLUMNAS, serializarFila } from "../js/serializacion.js";

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

const FICHA_DISTRITA = {
  id: 1728000000002,
  bodega: "Bodega Distinta Test",
  linea: "Etiqueta Cabernet",
  tipo: "Tinto",
  composicion: [{ varietal: "Cabernet", porcentaje: 100 }],
  cosecha: 2021,
  graduacion: 13,
  autor: "dueno@ejemplo.test",
  fecha_creacion: "02/10/2026 11:00",
  fecha_modificacion: "02/10/2026 11:00",
};

// GIS simulado con token automático; Sheets simulado con una hoja en memoria:
// leer, agregar y corregir por id (CA-5). Nunca una planilla real.
async function prepararPagina(page, filas) {
  const hoja = { filas: filas.map(serializarFila) };
  await page.route("https://accounts.google.com/**", (ruta) => ruta.abort());
  await page.addInitScript(() => {
    window.google = {
      accounts: {
        oauth2: {
          initTokenClient: (config) => ({
            requestAccessToken: () =>
              config.callback({ access_token: "TOKEN_E2E" }),
          }),
          revoke: () => {},
        },
      },
    };
  });
  await page.route("https://sheets.googleapis.com/**", async (ruta) => {
    const url = new URL(ruta.request().url());
    if (url.pathname.includes(":batchGet")) {
      await ruta.fulfill({
        json: { valueRanges: [{ values: [COLUMNAS, ...hoja.filas] }] },
      });
    } else if (url.pathname.includes(":append")) {
      hoja.filas.push(JSON.parse(ruta.request().postData()).values[0]);
      await ruta.fulfill({ json: {} });
    } else if (url.pathname.includes(":batchUpdate")) {
      const cuerpo = JSON.parse(ruta.request().postData());
      const numeroFila = Number(cuerpo.data[0].range.match(/A(\d+):/)[1]);
      hoja.filas[numeroFila - 2] = cuerpo.data[0].values[0];
      await ruta.fulfill({ json: { responses: [{}] } });
    } else {
      await ruta.fulfill({ json: {} });
    }
  });
  await page.goto("/");
  return hoja;
}

test("CA-19: la búsqueda encuentra por bodega y por línea con texto parcial", async ({
  page,
}) => {
  await prepararPagina(page, [FICHA_EJEMPLO, FICHA_DISTRITA]);

  await page.getByRole("button", { name: "Buscar fichas" }).click();
  await page.getByLabel("Búsqueda por bodega o línea").fill("ejemp");

  await expect(page.locator("#resultados-busqueda")).toContainText(
    "Bodega Ejemplo",
  );

  await page.getByLabel("Búsqueda por bodega o línea").fill("PRUEB");
  await expect(page.locator("#resultados-busqueda")).toContainText(
    "Línea Prueba Malbec",
  );

  await page.getByLabel("Búsqueda por bodega o línea").fill("cabernet");
  await expect(page.locator("#resultados-busqueda")).toContainText(
    "Etiqueta Cabernet",
  );
  await expect(page.locator("#resultados-busqueda")).not.toContainText(
    "Bodega Ejemplo",
  );
});

test("CA-16: sin coincidencias aparece el mensaje exacto, anunciado por aria-live", async ({
  page,
}) => {
  await prepararPagina(page, [FICHA_EJEMPLO]);

  await page.getByRole("button", { name: "Buscar fichas" }).click();
  await page.getByLabel("Búsqueda por bodega o línea").fill("zzz");

  await expect(page.locator("#estado-busqueda")).toHaveText(
    "Sin resultados para zzz",
  );
  await expect(page.locator("#resultados-busqueda")).toBeEmpty();
});

test("CA-5: editar desde la búsqueda corrige la ficha sin duplicarla", async ({
  page,
}) => {
  const hoja = await prepararPagina(page, [FICHA_EJEMPLO, FICHA_DISTRITA]);

  await page.getByRole("button", { name: "Buscar fichas" }).click();
  await page.getByLabel("Búsqueda por bodega o línea").fill("ejemp");
  await page.locator("#resultados-busqueda").getByRole("button").click();

  // Se abrió para editar con los datos cargados.
  await expect(
    page.getByRole("heading", { name: "Editar ficha" }),
  ).toBeVisible();
  await expect(page.getByLabel("Bodega", { exact: true })).toHaveValue(
    "Bodega Ejemplo",
  );
  await expect(page.getByLabel("Graduación alcohólica")).toHaveValue("14");

  await page.getByLabel("Graduación alcohólica").fill("13.5");
  await page.getByRole("button", { name: "Guardar" }).click();

  await expect(page.locator("#estado-guardado")).toHaveText("Ficha guardada.");
  // Sin duplicar: sigue habiendo dos fichas y la corregida es la vigente.
  expect(hoja.filas).toHaveLength(2);
  await page.getByLabel("Búsqueda por bodega o línea").fill("ejemp");
  await page.locator("#resultados-busqueda").getByRole("button").click();
  await expect(page.getByLabel("Graduación alcohólica")).toHaveValue("13.5");
});

test("Nueva ficha resetea el formulario y sale del modo edición", async ({
  page,
}) => {
  await prepararPagina(page, [FICHA_EJEMPLO]);

  await page.getByRole("button", { name: "Buscar fichas" }).click();
  await page.getByLabel("Búsqueda por bodega o línea").fill("ejemp");
  await page.locator("#resultados-busqueda").getByRole("button").click();
  await expect(
    page.getByRole("heading", { name: "Editar ficha" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Nueva ficha", exact: true }).click();

  await expect(
    page.getByRole("heading", { name: "Nueva ficha" }),
  ).toBeVisible();
  await expect(page.getByLabel("Bodega", { exact: true })).toHaveValue("");
});
