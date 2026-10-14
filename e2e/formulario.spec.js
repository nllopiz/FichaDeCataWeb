import { test, expect } from "@playwright/test";
import { COLUMNAS } from "../js/serializacion.js";
import { ID_TOKEN_E2E } from "./dobles.js";

// GIS simulado con token automático; Sheets con hoja vacía que acepta guardar
// (datos ficticios, nunca una planilla real).
async function prepararPagina(page) {
  const hoja = { filas: [] };
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
    } else {
      await ruta.fulfill({ json: {} });
    }
  });
  await page.goto("/");
  return hoja;
}

test("CA-1: se puede cargar una ficha completa con todos los campos", async ({
  page,
}) => {
  await prepararPagina(page);

  await page.getByLabel("Bodega", { exact: true }).fill("Bodega Ejemplo");
  await page.getByLabel("País").fill("Argentina");
  await page.getByLabel("Provincia").fill("Mendoza");
  await page.getByLabel("Zona").fill("Valle de Uco");
  await page.getByLabel("Tipo de vino").selectOption("Tinto");
  await page
    .getByLabel("Nombre de la línea de vino")
    .fill("Línea Prueba Malbec");
  await page.getByLabel("Varietal").first().fill("Malbec");
  await page.getByLabel("Porcentaje").first().fill("100");
  await page.getByLabel("Cosecha").selectOption("2022");
  await page.getByLabel("Graduación alcohólica").fill("13.5");

  await page.getByLabel("Tono o matiz").selectOption("granate");
  await page.getByLabel("Intensidad del color").selectOption("Alta");
  await page.getByLabel("Vivacidad y brillo").selectOption("Brillante");
  await page.getByLabel("Limpieza y transparencia").selectOption("Translúcido");
  await page.getByLabel("Evolución (color)").selectOption("Joven");

  await page.getByLabel("Limpieza o franqueza").selectOption("Franco");
  await page.getByLabel("Expresión-Intensidad").selectOption("Media+");
  await page.getByLabel("Equilibrio").selectOption("Equilibrado");
  await page.locator("#notas-aromaticas").getByLabel("Frutas rojas").check();
  await page.locator("#notas-aromaticas").getByLabel("Violeta").check();

  await page.getByLabel("Dulzor").selectOption("seco");
  await page.getByLabel("Acidez").selectOption("alta");
  await page.getByLabel("Taninos (cantidad)").selectOption("medios");
  await page.getByLabel("Taninos (calidad)").selectOption("redondos");
  await page.getByLabel("Alcohol (percepción en boca)").selectOption("medio");
  await page.getByLabel("Cuerpo").selectOption("pleno");
  await page.getByLabel("Entrada").selectOption("fresca");
  await page.getByLabel("Evolución o medio de boca").fill("media boca larga");
  await page.locator("#aromas-boca").getByLabel("Cuero").check();
  await page.getByLabel("Impresión final").selectOption("Muy bueno");
  await page.getByLabel("Postgusto").selectOption("Largo");

  await page
    .getByLabel("Apreciación personal")
    .fill("Muy buena para el precio.");

  await expect(page.getByLabel("Bodega", { exact: true })).toHaveValue(
    "Bodega Ejemplo",
  );
  await expect(page.getByLabel("Nombre de la línea de vino")).toHaveValue(
    "Línea Prueba Malbec",
  );
  await expect(page.getByLabel("Varietal").first()).toHaveValue("Malbec");
  await expect(page.getByLabel("Porcentaje").first()).toHaveValue("100");
  await expect(page.getByLabel("Cosecha")).toHaveValue("2022");
  await expect(page.getByLabel("Graduación alcohólica")).toHaveValue("13.5");
  await expect(page.getByLabel("Tono o matiz")).toHaveValue("granate");
  await expect(
    page.locator("#notas-aromaticas").getByLabel("Frutas rojas"),
  ).toBeChecked();
  await expect(page.locator("#aromas-boca").getByLabel("Cuero")).toBeChecked();
  await expect(page.getByLabel("Apreciación personal")).toHaveValue(
    "Muy buena para el precio.",
  );

  // CA-1: guarda y vuelve a encontrarla por bodega y por línea (RF-1, RF-2, RF-7).
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.locator("#estado-guardado")).toHaveText("Ficha guardada.");
  await page.getByRole("button", { name: "Buscar fichas" }).click();
  await page.getByLabel("Búsqueda por bodega o línea").fill("ejemp");
  await expect(page.locator("#resultados-busqueda")).toContainText(
    "Bodega Ejemplo",
  );
  await page.getByLabel("Búsqueda por bodega o línea").fill("prueba");
  await expect(page.locator("#resultados-busqueda")).toContainText(
    "Línea Prueba Malbec",
  );
});

test("CA-12: el tono se acota al tipo y los descriptores son de varias familias", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByLabel("Tipo de vino").selectOption("Tinto");
  await expect(page.locator("#tono_matiz option")).toHaveText([
    "",
    "púrpura",
    "rubí",
    "granate",
    "teja",
  ]);
  await expect(
    page.getByLabel("Limpieza y transparencia").locator("option"),
  ).toHaveText([
    "",
    "Cristalino",
    "Limpio",
    "Velado",
    "Turbio",
    "Transparente",
    "Translúcido",
    "Opaco",
    "Cubierto",
  ]);

  await page.getByLabel("Tipo de vino").selectOption("Blanco");
  await expect(page.locator("#tono_matiz option")).toHaveText([
    "",
    "limón-verdoso",
    "limón",
    "dorado",
    "ámbar",
  ]);
  // Blanco: 4 valores base de RF-9 + la opción vacía del desplegable.
  await expect(
    page.getByLabel("Limpieza y transparencia").locator("option"),
  ).toHaveCount(5);

  await page.locator("#notas-aromaticas").getByLabel("Frutas rojas").check();
  await page.locator("#notas-aromaticas").getByLabel("Violeta").check();
  await page.locator("#notas-aromaticas").getByLabel("Pimienta").check();
  await expect(
    page.locator("#notas-aromaticas").getByLabel("Frutas rojas"),
  ).toBeChecked();
  await expect(
    page.locator("#notas-aromaticas").getByLabel("Violeta"),
  ).toBeChecked();
  await expect(
    page.locator("#notas-aromaticas").getByLabel("Pimienta"),
  ).toBeChecked();
});

test("CA-15: con Espumante aparecen color y método, y el tono depende del color", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator("#bloque-espumante")).toBeHidden();
  await page.getByLabel("Tipo de vino").selectOption("Espumante");
  await expect(page.locator("#bloque-espumante")).toBeVisible();
  await expect(page.locator("#metodo_espumante option")).toHaveText([
    "",
    "tradicional",
    "Charmat",
    "ancestral",
  ]);

  await page.getByLabel("Color del espumante").selectOption("Blanco");
  await expect(page.locator("#tono_matiz option")).toHaveText([
    "",
    "limón-verdoso",
    "limón",
    "dorado",
    "ámbar",
    "cobre",
  ]);

  await page.getByLabel("Color del espumante").selectOption("Rosado");
  await expect(page.locator("#tono_matiz option")).toHaveText([
    "",
    "rosa pálido",
    "salmón",
    "rosa",
    "frambuesa",
  ]);
});

test("el defecto se elige solo cuando la franqueza es Defectuoso", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator("#bloque-defecto")).toBeHidden();
  await page.getByLabel("Limpieza o franqueza").selectOption("Defectuoso");
  await expect(page.locator("#bloque-defecto")).toBeVisible();
  await expect(page.locator("#defecto option")).toHaveText([
    "",
    "TCA",
    "reducción",
    "acidez volátil",
    "oxidación",
    "Brett",
  ]);
});
