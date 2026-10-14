import { test, expect } from "@playwright/test";
import { COLUMNAS, serializarFila } from "../js/serializacion.js";
import { ID_TOKEN_E2E } from "./dobles.js";

// GIS simulado con token automático; Sheets con hoja en memoria (datos ficticios).
async function prepararPagina(page, filas) {
  const hoja = { filas: filas.map(serializarFila) };
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

// RNF-6: nada oculto ni recortado. El scrolleo vertical está permitido; lo que no
// puede haber es scroll horizontal ni controles que salgan de la pantalla.
async function verificarSinRecortes(page) {
  const informe = await page.evaluate(() => {
    const anchoVentana = window.innerWidth;
    const recortados = [];
    for (const elemento of document.querySelectorAll("input, select, button")) {
      if (!elemento.offsetParent) {
        continue; // secciones ocultas por la navegación entre vistas
      }
      const caja = elemento.getBoundingClientRect();
      if (caja.width > 0 && (caja.right > anchoVentana + 1 || caja.left < -1)) {
        recortados.push(elemento.id || elemento.name || elemento.className);
      }
    }
    // Campos ocultos: solo se acepta lo que está dentro de un bloque condicional
    // ([hidden] = espumante, defecto); el resto debe ser visible en el teléfono.
    const ocultos = [
      ...document.querySelectorAll(
        "#form-ficha input, #form-ficha select, #form-ficha button",
      ),
    ]
      .filter(
        (elemento) => !elemento.offsetParent && !elemento.closest("[hidden]"),
      )
      .map((elemento) => elemento.id || elemento.name || elemento.className);
    return {
      anchoVentana,
      anchoDocumento: document.documentElement.scrollWidth,
      recortados,
      ocultos,
    };
  });
  expect(informe.anchoDocumento).toBeLessThanOrEqual(informe.anchoVentana + 1);
  expect(informe.recortados).toEqual([]);
  expect(informe.ocultos).toEqual([]);
}

const TAMANIOS_DE_TELEFONO = [
  { width: 390, height: 844 }, // teléfono estándar
  { width: 320, height: 568 }, // teléfono chico
];

for (const tamano of TAMANIOS_DE_TELEFONO) {
  test(`CA-7: desde un teléfono (${tamano.width}px) se completa cargar → buscar → editar sin campos ocultos`, async ({
    page,
  }) => {
    await page.setViewportSize(tamano);
    await prepararPagina(page, []);

    // Cargar: el formulario completo entra en la pantalla.
    await completarObligatorios(page);
    await expect(page.getByLabel("País")).toBeVisible();
    await expect(page.getByLabel("Tono o matiz")).toBeVisible();
    await expect(
      page.locator('input[name="notas_aromaticas"]').first(),
    ).toBeVisible();
    await verificarSinRecortes(page);

    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page.locator("#estado-guardado")).toHaveText(
      "Ficha guardada.",
    );

    // Buscar.
    await page.getByRole("button", { name: "Buscar fichas" }).click();
    await page.getByLabel("Búsqueda por bodega o línea").fill("ejemp");
    await expect(page.locator("#resultados-busqueda")).toContainText(
      "Bodega Ejemplo",
    );

    // Editar: se abren los datos completos y sigue sin haber recortes.
    await page.locator("#resultados-busqueda").getByRole("button").click();
    await expect(
      page.getByRole("heading", { name: "Editar ficha" }),
    ).toBeVisible();
    await expect(page.getByLabel("Bodega", { exact: true })).toHaveValue(
      "Bodega Ejemplo",
    );
    await expect(page.getByLabel("Varietal").first()).toHaveValue("Malbec");
    await expect(page.getByLabel("Porcentaje").first()).toHaveValue("100");
    await verificarSinRecortes(page);
  });
}
