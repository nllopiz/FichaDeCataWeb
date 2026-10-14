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

// Una única hoja en memoria, compartida por los dos contextos: es la planilla.
function hojaCompartida() {
  return {
    filas: [serializarFila(FICHA_EJEMPLO)],
    apendices: 0,
    actualizaciones: 0,
  };
}

// GIS simulado con token automático; Sheets simulado sobre la hoja compartida.
async function prepararPagina(page, hoja) {
  await page.route("https://accounts.google.com/**", (ruta) => ruta.abort());
  await page.addInitScript((idToken) => {
    // T20: con el ID ya en el navegador, el flujo de buscar/crear no hace falta.
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
      hoja.apendices += 1;
      hoja.filas.push(JSON.parse(ruta.request().postData()).values[0]);
      await ruta.fulfill({ json: {} });
    } else if (url.pathname.includes(":batchUpdate")) {
      const cuerpo = JSON.parse(ruta.request().postData());
      const numeroFila = Number(cuerpo.data[0].range.match(/A(\d+):/)[1]);
      hoja.actualizaciones += 1;
      hoja.filas[numeroFila - 2] = cuerpo.data[0].values[0];
      await ruta.fulfill({ json: { responses: [{}] } });
    } else {
      await ruta.fulfill({ json: {} });
    }
  });
  await page.goto("/");
}

// Busca "ejemp" y abre la ficha para editarla.
async function abrirFicha(page) {
  await page.getByRole("button", { name: "Buscar fichas" }).click();
  await page.getByLabel("Búsqueda por bodega o línea").fill("ejemp");
  await page.locator("#resultados-busqueda").getByRole("button").click();
  await expect(
    page.getByRole("heading", { name: "Editar ficha" }),
  ).toBeVisible();
}

test("CA-14: dos dispositivos guardan la misma ficha y gana el último guardado", async ({
  browser,
}) => {
  const hoja = hojaCompartida();
  const contextoA = await browser.newContext();
  const contextoB = await browser.newContext();
  const dispositivoA = await contextoA.newPage();
  const dispositivoB = await contextoB.newPage();

  try {
    await prepararPagina(dispositivoA, hoja);
    await prepararPagina(dispositivoB, hoja);

    // Ambos abren la misma ficha para editarla.
    await abrirFicha(dispositivoA);
    await dispositivoA.getByLabel("Graduación alcohólica").fill("13");
    await abrirFicha(dispositivoB);
    await dispositivoB.getByLabel("Graduación alcohólica").fill("12.5");

    // El segundo dispositivo guarda primero…
    await dispositivoB.getByRole("button", { name: "Guardar" }).click();
    await expect(dispositivoB.locator("#estado-guardado")).toHaveText(
      "Ficha guardada.",
    );
    expect(hoja.filas).toHaveLength(1);

    // …y el primero guarda al final: esa es la versión vigente (RF-15).
    await dispositivoA.getByRole("button", { name: "Guardar" }).click();
    await expect(dispositivoA.locator("#estado-guardado")).toHaveText(
      "Ficha guardada.",
    );

    // El total no cambia: se corrigió por id, sin duplicar ni agregar filas.
    expect(hoja.filas).toHaveLength(1);
    expect(hoja.apendices).toBe(0);
    expect(hoja.actualizaciones).toBe(2);

    // La búsqueda en el dispositivo que guardó al final da la versión final.
    await expect(dispositivoA.locator("#resultados-busqueda")).toContainText(
      "Bodega Ejemplo",
    );
    await dispositivoA
      .locator("#resultados-busqueda")
      .getByRole("button")
      .click();
    await expect(dispositivoA.getByLabel("Graduación alcohólica")).toHaveValue(
      "13",
    );

    // El otro dispositivo, al recargar (memoria nueva), también la ve.
    await dispositivoB.reload();
    await abrirFicha(dispositivoB);
    await expect(dispositivoB.getByLabel("Graduación alcohólica")).toHaveValue(
      "13",
    );
  } finally {
    await contextoA.close();
    await contextoB.close();
  }
});
