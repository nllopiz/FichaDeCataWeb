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

async function prepararPagina(page, filas = []) {
  const hoja = { filas: filas.map(serializarFila) };
  await page.route("https://accounts.google.com/**", (ruta) => ruta.abort());
  await page.addInitScript((idToken) => {
    localStorage.setItem("ficha:id-planilla", "PLANILLA_E2E");
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

test("Fase 1: el escritorio muestra marca, riel y navegación por fases", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await prepararPagina(page);

  await expect(page.locator(".brand-name")).toHaveText("Ficha de Cata");
  await expect(page.locator(".rail")).toBeVisible();
  await expect(page.locator(".rail .phase-link")).toHaveCount(5);

  await page.locator('.rail .phase-link[href="#seccion-nariz"]').click();

  await expect(page.locator(".rail .phase.is-active")).toHaveAttribute(
    "data-fase",
    "seccion-nariz",
  );
  await expect(
    page.locator('.rail .phase-link[href="#seccion-nariz"]'),
  ).toHaveAttribute("aria-current", "step");
  await expect(page.getByRole("heading", { name: "Nariz" })).toBeVisible();
});

test("Fase 1: la tira móvil navega, se fija y se oculta al buscar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepararPagina(page);

  await expect(page.locator("#fases-movil")).toBeVisible();
  await expect(page.locator(".mobile-phase")).toHaveCount(5);

  await page.locator('.mobile-phase[href="#seccion-nariz"]').click();

  await expect(page.locator(".mobile-phase-name")).toHaveText("Nariz");
  await expect(
    page.locator('.mobile-phase[href="#seccion-nariz"]'),
  ).toHaveAttribute("aria-current", "step");
  await expect(page.getByRole("heading", { name: "Nariz" })).toBeVisible();

  await page.getByRole("button", { name: "Buscar fichas" }).click();
  await expect(page.locator("#fases-movil")).toBeHidden();

  await page.getByRole("button", { name: "Cargar ficha" }).click();
  await expect(page.locator("#fases-movil")).toBeVisible();
});

test("Fase 1: la confirmación de guardado sigue visible al pasar a búsqueda", async ({
  page,
}) => {
  await prepararPagina(page);
  await completarObligatorios(page);

  await page.locator("#guardar").click();

  await expect(page.locator("#vista-busqueda")).toBeVisible();
  await expect(page.locator("#estado-guardado")).toBeVisible();
  await expect(page.locator("#estado-guardado")).toHaveText("Ficha guardada.");
});

test("Fase 1: la composición se identifica como obligatoria", async ({
  page,
}) => {
  await prepararPagina(page);

  await expect(page.locator("#composicion")).toHaveAttribute(
    "aria-required",
    "true",
  );
  await expect(page.locator(".composition .req")).toBeVisible();
});

test("Fase 1: los resultados móviles ofrecen una acción visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepararPagina(page, [FICHA_EJEMPLO]);

  await page.getByRole("button", { name: "Buscar fichas" }).click();
  await page.getByLabel("Búsqueda por bodega o línea").fill("ejemp");

  await expect(page.locator(".result-action").first()).toBeVisible();
  await expect(page.locator(".result-main").first()).toContainText(
    "Bodega Ejemplo",
  );
});
