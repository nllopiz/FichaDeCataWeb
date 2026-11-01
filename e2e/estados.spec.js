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

function diferido() {
  let resolver;
  const promesa = new Promise((listo) => {
    resolver = listo;
  });
  return { promesa, resolver };
}

// GIS simulado: con `tokenManual` el test decide cuándo responde el popup.
async function prepararPagina(
  page,
  { planilla = true, tokenManual = false } = {},
) {
  await page.route("https://accounts.google.com/**", (ruta) => ruta.abort());
  await page.addInitScript(
    ({ idToken, conPlanilla, manual }) => {
      if (conPlanilla) {
        localStorage.setItem("ficha:id-planilla", "PLANILLA_E2E");
      }
      window.__solicitudesToken = 0;
      window.__errorGIS = null;
      window.google = {
        accounts: {
          oauth2: {
            initTokenClient: (config) => ({
              requestAccessToken: () => {
                window.__solicitudesToken += 1;
                window.__errorGIS = config.error_callback;
                if (!manual) {
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
    { idToken: ID_TOKEN_E2E, conPlanilla: planilla, manual: tokenManual },
  );
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

test("RNF-5/CA-11: guardar anuncia la preparación y deja el formulario ocupado", async ({
  page,
}) => {
  const drive = diferido();
  const append = diferido();
  let appendPedido = false;

  await prepararPagina(page, { planilla: false });
  await page.route("https://www.googleapis.com/drive/v3/**", async (ruta) => {
    await drive.promesa;
    await ruta.fulfill({ json: { files: [{ id: "PLANILLA_E2E" }] } });
  });
  await page.route("https://sheets.googleapis.com/**", async (ruta) => {
    const url = ruta.request().url();
    if (url.includes(":append")) {
      appendPedido = true;
      await append.promesa;
      await ruta.fulfill({ json: {} });
      return;
    }
    if (url.includes(":batchGet")) {
      await ruta.fulfill({ json: { valueRanges: [{ values: [COLUMNAS] }] } });
      return;
    }
    await ruta.fulfill({ json: {} });
  });

  await page.goto("/");
  await completarObligatorios(page);
  await page.getByRole("button", { name: "Guardar" }).click();

  await expect(page.locator("#estado-guardado")).toHaveText(
    "Preparando tu planilla…",
  );
  await expect(page.locator("#estado-guardado")).toHaveAttribute(
    "role",
    "status",
  );
  await expect(page.locator("#estado-guardado")).toHaveAttribute(
    "aria-live",
    "polite",
  );
  await expect(page.locator("#form-ficha")).toHaveAttribute(
    "aria-busy",
    "true",
  );
  await expect(page.locator("#guardar")).toBeDisabled();

  drive.resolver();
  await expect.poll(() => appendPedido).toBe(true);
  await expect(page.locator("#form-ficha")).toHaveAttribute(
    "aria-busy",
    "true",
  );
  await expect(page.locator("#guardar")).toBeDisabled();

  append.resolver();
  await expect(page.locator("#estado-guardado")).toHaveText("Ficha guardada.");
  await expect(page.locator("#form-ficha")).not.toHaveAttribute(
    "aria-busy",
    "true",
  );
  await expect(page.locator("#guardar")).toBeEnabled();
});

test("RNF-5/CA-11: buscar anuncia Cargando… y marca la región de resultados", async ({
  page,
}) => {
  const batch = diferido();

  await prepararPagina(page);
  await page.route("https://sheets.googleapis.com/**", async (ruta) => {
    const url = ruta.request().url();
    if (url.includes(":batchGet")) {
      await batch.promesa;
      await ruta.fulfill({
        json: {
          valueRanges: [{ values: [COLUMNAS, serializarFila(FICHA_EJEMPLO)] }],
        },
      });
      return;
    }
    await ruta.fulfill({ json: {} });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Buscar fichas" }).click();
  await page.getByLabel("Búsqueda por bodega o línea").fill("ejemp");

  await expect(page.locator("#estado-busqueda")).toHaveText("Cargando…");
  await expect(page.locator("#estado-busqueda")).toHaveAttribute(
    "role",
    "status",
  );
  await expect(page.locator("#estado-busqueda")).toHaveAttribute(
    "aria-live",
    "polite",
  );
  await expect(page.locator("#resultados-busqueda")).toHaveAttribute(
    "aria-busy",
    "true",
  );

  batch.resolver();
  await expect(page.locator("#resultados-busqueda")).toContainText(
    "Bodega Ejemplo",
  );
  await expect(page.locator("#resultados-busqueda")).not.toHaveAttribute(
    "aria-busy",
    "true",
  );
  await expect(page.locator("#estado-busqueda")).toHaveText("");
});

test("RNF-5/CA-11: cancelar la identificación se anuncia sin mover el foco", async ({
  page,
}) => {
  await prepararPagina(page, { tokenManual: true });
  await page.goto("/");
  await completarObligatorios(page);
  await page.getByRole("button", { name: "Guardar" }).click();

  await expect
    .poll(() => page.evaluate(() => window.__solicitudesToken))
    .toBe(1);
  await expect(page.locator("#form-ficha")).toHaveAttribute(
    "aria-busy",
    "true",
  );
  await expect(page.locator("#guardar")).toBeDisabled();
  expect(
    await page.evaluate(() =>
      ["guardar", ""].includes(document.activeElement.id),
    ),
  ).toBe(true);

  await page.evaluate(() =>
    window.__errorGIS({ type: "popup_closed_by_user" }),
  );

  await expect(page.locator("#estado-guardado")).toContainText(
    "Identificación cancelada: no se registró ninguna ficha.",
  );
  await expect(page.locator("#form-ficha")).not.toHaveAttribute(
    "aria-busy",
    "true",
  );
  await expect(page.locator("#guardar")).toBeEnabled();
  expect(
    await page.evaluate(() =>
      ["guardar", ""].includes(document.activeElement.id),
    ),
  ).toBe(true);
});

test("RNF-5/CA-11: un error de Google se anuncia y libera el formulario", async ({
  page,
}) => {
  const append = diferido();

  await prepararPagina(page);
  await page.route("https://sheets.googleapis.com/**", async (ruta) => {
    if (ruta.request().url().includes(":append")) {
      await append.promesa;
      await ruta.fulfill({ status: 500, json: {} });
      return;
    }
    await ruta.fulfill({ json: {} });
  });

  await page.goto("/");
  await completarObligatorios(page);
  await page.getByRole("button", { name: "Guardar" }).click();

  await expect(page.locator("#form-ficha")).toHaveAttribute(
    "aria-busy",
    "true",
  );
  await expect(page.locator("#guardar")).toBeDisabled();

  append.resolver();
  await expect(page.locator("#estado-guardado")).toHaveText(
    "Google tuvo un problema momentáneo. Intentá de nuevo.",
  );
  await expect(page.locator("#form-ficha")).not.toHaveAttribute(
    "aria-busy",
    "true",
  );
  await expect(page.locator("#guardar")).toBeEnabled();
  await expect(page.getByLabel("Bodega", { exact: true })).toHaveValue(
    "Bodega Ejemplo",
  );
});
