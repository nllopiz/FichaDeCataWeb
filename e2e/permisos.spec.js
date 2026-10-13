import { test, expect } from "@playwright/test";
import { COLUMNAS, serializarFila } from "../js/serializacion.js";

const TOKEN_DUEÑO = "TOKEN_DUEÑO_E2E";
const TOKEN_INTRUSO = "TOKEN_INTRUSO_E2E";

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

// Planilla privada: solo el token del dueño pasa; el resto recibe 403.
// opciones.cancelar simula el popup cerrado; opciones.intruso, otra cuenta.
async function prepararPagina(page, opciones = {}) {
  const { cancelar = false, intruso = false } = opciones;
  const hoja = {
    filas: [serializarFila(FICHA_EJEMPLO)],
    lecturas: 0,
    escrituras: 0,
    rechazos: 0,
  };

  await page.route("https://accounts.google.com/**", (ruta) => ruta.abort());
  await page.addInitScript(
    ({ cancelar, intruso, tokenDueno, tokenIntruso }) => {
      window.google = {
        accounts: {
          oauth2: {
            initTokenClient: (config) => ({
              requestAccessToken: () => {
                if (cancelar) {
                  config.callback({ error: "popup_closed" });
                } else {
                  config.callback({
                    access_token: intruso ? tokenIntruso : tokenDueno,
                  });
                }
              },
            }),
            revoke: () => {},
          },
        },
      };
    },
    { cancelar, intruso, tokenDueno: TOKEN_DUEÑO, tokenIntruso: TOKEN_INTRUSO },
  );

  await page.route("https://sheets.googleapis.com/**", async (ruta) => {
    const url = new URL(ruta.request().url());
    const autorizado =
      ruta.request().headers()["authorization"] === `Bearer ${TOKEN_DUEÑO}`;
    if (!autorizado) {
      hoja.rechazos += 1;
      await ruta.fulfill({
        status: 403,
        json: {
          error: { code: 403, message: "The caller does not have permission" },
        },
      });
      return;
    }
    if (url.pathname.includes(":batchGet")) {
      hoja.lecturas += 1;
      await ruta.fulfill({
        json: { valueRanges: [{ values: [COLUMNAS, ...hoja.filas] }] },
      });
    } else if (url.pathname.includes(":append")) {
      hoja.escrituras += 1;
      hoja.filas.push(JSON.parse(ruta.request().postData()).values[0]);
      await ruta.fulfill({ json: {} });
    } else if (url.pathname.includes(":batchUpdate")) {
      const cuerpo = JSON.parse(ruta.request().postData());
      const numeroFila = Number(cuerpo.data[0].range.match(/A(\d+):/)[1]);
      hoja.escrituras += 1;
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

test("CL-7 y CA-21: sin identificarse no se muestra contenido y cancelar no registra nada", async ({
  page,
}) => {
  const hoja = await prepararPagina(page, { cancelar: true });

  // Sin identificar: ni una ficha a la vista.
  await expect(page.locator("body")).not.toContainText("Bodega Ejemplo");

  // Buscar pide identificarse; el popup se cierra: sin contenido guardado.
  await page.getByRole("button", { name: "Buscar fichas" }).click();
  await page.getByLabel("Búsqueda por bodega o línea").fill("ejemp");
  await expect(page.locator("#estado-busqueda")).toHaveText(
    "Para buscar tus fichas necesitás identificarte con tu cuenta de Google.",
  );
  await expect(page.locator("#resultados-busqueda")).toBeEmpty();
  expect(hoja.lecturas).toBe(0); // jamás se leyó la planilla

  // RF-17: el formulario de carga nueva sigue disponible sin identificar.
  await page.getByRole("button", { name: "Cargar ficha" }).click();
  await completarObligatorios(page);
  await page.getByRole("button", { name: "Guardar" }).click();

  // CA-21: cancelar la identificación al guardar no registra nada y no pierde lo escrito.
  await expect(page.locator("#estado-guardado")).toContainText(
    "no se registró ninguna ficha",
  );
  expect(hoja.escrituras).toBe(0);
  expect(hoja.filas).toHaveLength(1);
  await expect(page.getByLabel("Bodega", { exact: true })).toHaveValue(
    "Bodega Ejemplo",
  );
});

test("CA-8: una cuenta distinta no ve ni edita las fichas, ni por enlace directo", async ({
  page,
}) => {
  const hoja = await prepararPagina(page, { intruso: true });

  // Enlace directo a una ficha: sin identificar no aparece contenido privado.
  await page.goto("/#ficha=1728000000001");
  await expect(page.locator("body")).not.toContainText("Bodega Ejemplo");
  await expect(page.getByLabel("Bodega", { exact: true })).toBeVisible();

  // Identificándose con otra cuenta, la lectura de la hoja es rechazada (403).
  await page.getByRole("button", { name: "Buscar fichas" }).click();
  await page.getByLabel("Búsqueda por bodega o línea").fill("ejemp");
  await expect(page.locator("#estado-busqueda")).toHaveText(
    "No tenés acceso a esta planilla.",
  );
  await expect(page.locator("#resultados-busqueda")).toBeEmpty();
  expect(hoja.lecturas).toBe(0);
  expect(hoja.rechazos).toBeGreaterThanOrEqual(1);

  // Intenta guardar una ficha nueva: la escritura también es rechazada.
  await page.getByRole("button", { name: "Cargar ficha" }).click();
  await completarObligatorios(page);
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.locator("#estado-guardado")).toHaveText(
    "No tenés acceso a esta planilla.",
  );

  // La planilla del dueño queda intacta.
  expect(hoja.filas).toHaveLength(1);
  expect(hoja.escrituras).toBe(0);
});
