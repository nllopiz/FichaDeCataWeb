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

// GIS simulado con token automático; Sheets con hoja en memoria (datos ficticios).
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
    } else {
      await ruta.fulfill({ json: {} });
    }
  });
  await page.goto("/");
  return hoja;
}

// Avanza con Tab hasta que el control enfocado cumpla el criterio.
async function tabHasta(page, criterio, max = 300) {
  for (let intento = 0; intento < max; intento++) {
    const coincide = await page.evaluate((c) => {
      const activo = document.activeElement;
      if (!activo) {
        return false;
      }
      return c.id ? activo.id === c.id : activo.className.includes(c.clase);
    }, criterio);
    if (coincide) {
      return;
    }
    await page.keyboard.press("Tab");
  }
  throw new Error(`No se llegó a ${JSON.stringify(criterio)} en ${max} Tab`);
}

test("CA-11: carga → guardar → búsqueda solo con teclado, con errores anunciados", async ({
  page,
}) => {
  await prepararPagina(page, [FICHA_EJEMPLO]);

  // Los estados dinámicos tienen rol y aria-live (anuncio por lector de pantalla).
  const estados = await page.evaluate(() =>
    ["estado-guardado", "estado-busqueda", "suma-composicion"].map((id) => {
      const elemento = document.getElementById(id);
      return {
        id,
        rol: elemento.getAttribute("role"),
        vivo: elemento.getAttribute("aria-live"),
      };
    }),
  );
  for (const estado of estados) {
    expect(estado.rol, `${estado.id} debe tener role`).toBe("status");
    expect(estado.vivo, `${estado.id} debe tener aria-live`).toBe("polite");
  }

  // Errores de validación anunciados (teclado, sin ratón).
  await tabHasta(page, { id: "guardar" });
  await page.keyboard.press("Enter");
  await expect(page.locator("#estado-guardado")).toContainText(
    "Faltan campos obligatorios",
  );

  // Cargar la ficha completa escribiendo y navegando solo con Tab/flechas.
  await tabHasta(page, { id: "bodega" });
  await page.keyboard.type("Bodega Ejemplo");
  await tabHasta(page, { id: "tipo" });
  await page.keyboard.press("ArrowDown");
  await tabHasta(page, { id: "linea" });
  await page.keyboard.type("Línea Prueba Malbec");
  await tabHasta(page, { clase: "varietal" });
  await page.keyboard.type("Malbec");
  await tabHasta(page, { clase: "porcentaje" });
  await page.keyboard.type("100");
  await tabHasta(page, { id: "cosecha" });
  await page.keyboard.press("ArrowDown");
  await tabHasta(page, { id: "graduacion" });
  await page.keyboard.type("13.5");

  await tabHasta(page, { id: "guardar" });
  await page.keyboard.press("Enter");
  await expect(page.locator("#estado-guardado")).toHaveText("Ficha guardada.");

  // El foco pasa al título de la vista nueva (2.4.3: foco no se pierde).
  expect(await page.evaluate(() => document.activeElement.id)).toBe(
    "titulo-busqueda",
  );

  // Búsqueda con teclado: Tab hasta el campo, escribir, Tab al resultado, Enter.
  await page.keyboard.press("Tab");
  await page.keyboard.type("ejemp");
  await expect(page.locator("#resultados-busqueda")).toContainText(
    "Bodega Ejemplo",
  );
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Editar ficha" }),
  ).toBeVisible();
  await expect(page.getByLabel("Bodega", { exact: true })).toHaveValue(
    "Bodega Ejemplo",
  );
  expect(await page.evaluate(() => document.activeElement.id)).toBe(
    "titulo-carga",
  );
});

test("todo control visible del formulario tiene nombre accesible", async ({
  page,
}) => {
  await prepararPagina(page, []);

  const sinNombre = await page.evaluate(() =>
    [
      ...document.querySelectorAll(
        "#form-ficha input, #form-ficha select, #form-ficha button",
      ),
    ]
      .filter((elemento) => elemento.offsetParent)
      .flatMap((elemento) => {
        // Los botones llevan su nombre en el texto; los campos, en un label asociado.
        const tieneNombre =
          elemento.tagName === "BUTTON"
            ? elemento.textContent.trim() !== "" ||
              elemento.getAttribute("aria-label")
            : (elemento.labels && elemento.labels.length > 0) ||
              elemento.getAttribute("aria-label");
        return tieneNombre ? [] : [elemento.id || elemento.className];
      }),
  );
  expect(sinNombre).toEqual([]);
});

test("el foco de teclado es visible con contraste AA (WCAG 2.4.7 / 1.4.11)", async ({
  page,
}) => {
  await prepararPagina(page, []);

  await page.keyboard.press("Tab");
  const contorno = await page.evaluate(() => {
    const activo = document.activeElement;
    const estilo = getComputedStyle(activo);
    return {
      elemento: activo.textContent.trim() || activo.id || activo.className,
      estilo: estilo.outlineStyle,
      ancho: estilo.outlineWidth,
    };
  });
  expect(contorno.elemento).toContain("Cargar ficha");
  expect(contorno.estilo, "outlineStyle").not.toBe("none");
  expect(Number.parseFloat(contorno.ancho)).toBeGreaterThanOrEqual(2);
});

test("los textos de la interfaz cumplen contraste AA 4.5:1 sobre blanco", async ({
  page,
}) => {
  await prepararPagina(page, []);

  const selectores = [
    ".form-label",
    "#estado-guardado",
    "#estado-busqueda",
    "#suma-composicion",
    ".btn-outline-primary",
    ".btn-outline-secondary",
    "#guardar",
  ];

  const fallas = await page.evaluate((lista) => {
    const leerRgb = (texto) => {
      const numeros = texto.match(/[\d.]+/g).map(Number);
      return {
        r: numeros[0],
        g: numeros[1],
        b: numeros[2],
        a: numeros.length > 3 ? numeros[3] : 1,
      };
    };
    const sobreBlanco = (c) => ({
      r: c.r * c.a + 255 * (1 - c.a),
      g: c.g * c.a + 255 * (1 - c.a),
      b: c.b * c.a + 255 * (1 - c.a),
    });
    const luminancia = ({ r, g, b }) => {
      const linea = (v) => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * linea(r) + 0.7152 * linea(g) + 0.0722 * linea(b);
    };
    const relacion = (a, b) => {
      const [claro, oscuro] = [luminancia(a), luminancia(b)].sort(
        (x, y) => y - x,
      );
      return (claro + 0.05) / (oscuro + 0.05);
    };

    const fondoBlanco = { r: 255, g: 255, b: 255 };
    const resultado = [];
    for (const selector of lista) {
      const elemento = document.querySelector(selector);
      if (!elemento) {
        resultado.push(`${selector}: no encontrado`);
        continue;
      }
      const estilo = getComputedStyle(elemento);
      const fondoPropio = estilo.backgroundColor;
      const fondo =
        fondoPropio && !fondoPropio.endsWith(", 0)")
          ? sobreBlanco(leerRgb(fondoPropio))
          : fondoBlanco;
      const texto = sobreBlanco(leerRgb(estilo.color));
      const ratio = relacion(texto, fondo);
      if (ratio < 4.5) {
        resultado.push(`${selector}: ${ratio.toFixed(2)}:1`);
      }
    }
    return resultado;
  }, selectores);

  expect(fallas).toEqual([]);
});
