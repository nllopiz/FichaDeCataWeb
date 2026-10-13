import { describe, it, expect, beforeEach, vi } from "vitest";
import { COLUMNAS, serializarFila } from "../js/serializacion.js";

const ID_PLANILLA = "PLANILLA_FALSA";
const TOKEN = "TOKEN_FALSO";

const fichaBase = () => ({
  id: 1728000000000,
  bodega: "Bodega Ejemplo",
  linea: "Línea Prueba Malbec",
  tipo: "Tinto",
  composicion: [{ varietal: "Malbec", porcentaje: 100 }],
  cosecha: 2022,
  graduacion: 14,
  autor: "dueno@ejemplo.test",
  fecha_creacion: "11/10/2026 19:00",
  fecha_modificacion: "11/10/2026 19:00",
});

function respuestaOk(json) {
  return { ok: true, status: 200, json: async () => json };
}

function respuestaError(estado) {
  return {
    ok: false,
    status: estado,
    json: async () => ({ error: { message: "secret de Google" } }),
  };
}

function hojaCon(fichas) {
  return {
    valueRanges: [{ values: [COLUMNAS, ...fichas.map(serializarFila)] }],
  };
}

async function nuevoSheets() {
  return import("../js/sheets.js");
}

async function sheetsConfigurado() {
  const sheets = await nuevoSheets();
  sheets.configurarSheets({
    spreadsheetId: ID_PLANILLA,
    obtenerToken: async () => TOKEN,
  });
  return sheets;
}

beforeEach(() => {
  vi.resetModules();
  globalThis.fetch = vi.fn(async () => respuestaOk(hojaCon([])));
});

describe("precargar: batchGet único y caché (RNF-3)", () => {
  it("lee toda la hoja con una sola llamada y cachea el resultado", async () => {
    globalThis.fetch.mockResolvedValue(respuestaOk(hojaCon([fichaBase()])));
    const sheets = await sheetsConfigurado();

    const primera = await sheets.precargar();
    const segunda = await sheets.precargar();

    expect(globalThis.fetch).toHaveBeenCalledOnce();
    expect(primera).toHaveLength(1);
    expect(segunda).toEqual(primera);
  });

  it("pide el rango único A1:AZ1000 con el token en la cabecera", async () => {
    const sheets = await sheetsConfigurado();

    await sheets.precargar();

    const [url, opciones] = globalThis.fetch.mock.calls[0];
    expect(url).toContain("values:batchGet");
    expect(url).toContain("ranges=A1:AZ1000");
    expect(url).toContain(ID_PLANILLA);
    expect(opciones.method).toBeUndefined(); // GET por defecto
    expect(opciones.headers.Authorization).toBe(`Bearer ${TOKEN}`);
  });

  it("devuelve las fichas parseadas (composición e id como datos, no texto)", async () => {
    globalThis.fetch.mockResolvedValue(respuestaOk(hojaCon([fichaBase()])));
    const sheets = await sheetsConfigurado();

    const fichas = await sheets.precargar();

    expect(fichas[0].id).toBe(1728000000000);
    expect(fichas[0].composicion).toEqual([
      { varietal: "Malbec", porcentaje: 100 },
    ]);
    expect(fichas[0].bodega).toBe("Bodega Ejemplo");
  });

  it("una hoja con solo encabezados cachea vacía", async () => {
    const sheets = await sheetsConfigurado();

    expect(await sheets.precargar()).toEqual([]);
    expect(sheets.hayCache()).toBe(true);
  });

  it("sin caché todavía, fichas() devuelve null (la vista muestra 'Cargando…')", async () => {
    const sheets = await sheetsConfigurado();
    expect(sheets.fichas()).toBeNull();
  });

  it("precargas concurrentes comparten una sola llamada (Cargando… único)", async () => {
    let resolverFetch;
    globalThis.fetch = vi.fn(
      () =>
        new Promise((resolver) => {
          resolverFetch = resolver;
        }),
    );
    const sheets = await sheetsConfigurado();

    const primera = sheets.precargar();
    const segunda = sheets.precargar();
    await new Promise((resolver) => setTimeout(resolver, 0)); // fetch se invoca en un microtask
    resolverFetch(respuestaOk(hojaCon([fichaBase()])));
    await primera;
    await segunda;

    expect(globalThis.fetch).toHaveBeenCalledOnce();
    expect(sheets.fichas()).toHaveLength(1);
  });

  it("encabezados distintos a los de la guía → error claro y NO se cachea (plan §2)", async () => {
    globalThis.fetch.mockResolvedValue(
      respuestaOk({
        valueRanges: [
          {
            values: [
              ["otra", "cabecera"],
              ["x", "y"],
            ],
          },
        ],
      }),
    );
    const sheets = await sheetsConfigurado();

    await expect(sheets.precargar()).rejects.toMatchObject({
      codigo: "encabezados",
    });
    expect(sheets.hayCache()).toBe(false);
    expect(sheets.fichas()).toBeNull();
  });
});

describe("filaDeId: la edición localiza la fila por id (grill-me p. 2)", () => {
  it("devuelve el número de fila real de la hoja (encabezado = fila 1)", async () => {
    const otra = {
      ...fichaBase(),
      id: 1728000999999,
      bodega: "Otra Bodega Test",
    };
    globalThis.fetch.mockResolvedValue(
      respuestaOk(hojaCon([fichaBase(), otra])),
    );
    const sheets = await sheetsConfigurado();
    await sheets.precargar();

    expect(sheets.filaDeId(1728000000000)).toBe(2);
    expect(sheets.filaDeId(1728000999999)).toBe(3);
  });

  it("id inexistente o sin caché → null", async () => {
    const sheets = await sheetsConfigurado();
    expect(sheets.filaDeId(1)).toBeNull();
    await sheets.precargar();
    expect(sheets.filaDeId(999)).toBeNull();
  });
});

describe("append (RF-2, CA-9)", () => {
  it("agrega una sola fila al final con USER_ENTERED e INSERT_ROWS", async () => {
    const sheets = await sheetsConfigurado();
    const celdas = serializarFila(fichaBase());

    await sheets.append(celdas);

    const [url, opciones] = globalThis.fetch.mock.calls[0];
    expect(url).toContain("values/A:Z:append");
    expect(url).toContain("valueInputOption=USER_ENTERED");
    expect(url).toContain("insertDataOption=INSERT_ROWS");
    expect(opciones.method).toBe("POST");
    expect(JSON.parse(opciones.body).values).toEqual([celdas]);
  });

  it("la fila escrita conserva id, autor y fechas en su posición (CA-9)", async () => {
    const sheets = await sheetsConfigurado();
    const celdas = serializarFila(fichaBase());

    await sheets.append(celdas);

    const escrita = JSON.parse(globalThis.fetch.mock.calls[0][1].body)
      .values[0];
    expect(escrita[0]).toBe(1728000000000);
    expect(escrita[COLUMNAS.indexOf("autor")]).toBe("dueno@ejemplo.test");
    expect(escrita[COLUMNAS.indexOf("fecha_creacion")]).toBe(
      "11/10/2026 19:00",
    );
    expect(escrita).toHaveLength(COLUMNAS.length);
  });

  it("un guardado exitoso invalida la caché (la próxima lectura refresca)", async () => {
    const sheets = await sheetsConfigurado();
    await sheets.precargar();
    expect(sheets.hayCache()).toBe(true);

    await sheets.append(serializarFila(fichaBase()));

    expect(sheets.hayCache()).toBe(false);
  });
});

describe("batchUpdate por id (RF-8)", () => {
  it("escribe exactamente el rango A{n}:AZ{n} de esa ficha", async () => {
    globalThis.fetch.mockResolvedValueOnce(respuestaOk(hojaCon([fichaBase()])));
    const sheets = await sheetsConfigurado();
    await sheets.precargar();
    const corregida = serializarFila({ ...fichaBase(), graduacion: 13.5 });

    await sheets.batchUpdate(1728000000000, corregida);

    const [url, opciones] = globalThis.fetch.mock.calls[1];
    expect(url).toContain("values:batchUpdate");
    const cuerpo = JSON.parse(opciones.body);
    expect(cuerpo.valueInputOption).toBe("USER_ENTERED");
    expect(cuerpo.data[0].range).toBe("A2:AZ2");
    expect(cuerpo.data[0].values).toEqual([corregida]);
  });

  it("invalida la caché tras editar", async () => {
    globalThis.fetch.mockResolvedValueOnce(respuestaOk(hojaCon([fichaBase()])));
    const sheets = await sheetsConfigurado();
    await sheets.precargar();

    await sheets.batchUpdate(1728000000000, serializarFila(fichaBase()));

    expect(sheets.hayCache()).toBe(false);
  });

  it("id que no está en la caché → 'no-encontrada' sin escribir", async () => {
    globalThis.fetch.mockResolvedValueOnce(respuestaOk(hojaCon([fichaBase()])));
    const sheets = await sheetsConfigurado();
    await sheets.precargar();

    await expect(
      sheets.batchUpdate(999, serializarFila(fichaBase())),
    ).rejects.toMatchObject({
      codigo: "no-encontrada",
    });
    expect(globalThis.fetch).toHaveBeenCalledOnce(); // solo la lectura inicial
  });
});

describe("errores mapeados a estados de la app (skill sheets-api-navegador §6)", () => {
  it("403 → 'sin-acceso' con mensaje claro y sin datos técnicos (CA-8)", async () => {
    globalThis.fetch.mockResolvedValue(respuestaError(403));
    const sheets = await sheetsConfigurado();

    const error = await sheets.precargar().catch((e) => e);

    expect(error.codigo).toBe("sin-acceso");
    expect(error.message.toLowerCase()).toContain("no tenés acceso");
    expect(error.message).not.toMatch(
      /403|https?:|permission|secret|spreadsheet/i,
    );
  });

  it("401 → 'no-autenticado' para re-identificar (RF-18)", async () => {
    globalThis.fetch.mockResolvedValue(respuestaError(401));
    const sheets = await sheetsConfigurado();
    await expect(sheets.precargar()).rejects.toMatchObject({
      codigo: "no-autenticado",
    });
  });

  it("429 → 'cuota' y 5xx → 'google' (ambos con reintento posible)", async () => {
    globalThis.fetch.mockResolvedValue(respuestaError(429));
    const sheetsCuota = await sheetsConfigurado();
    await expect(sheetsCuota.precargar()).rejects.toMatchObject({
      codigo: "cuota",
    });

    vi.resetModules();
    globalThis.fetch = vi.fn(async () => respuestaError(503));
    const sheetsGoogle = await sheetsConfigurado();
    await expect(sheetsGoogle.precargar()).rejects.toMatchObject({
      codigo: "google",
    });
  });

  it("sin red → 'red' sin lanzar el error crudo de fetch", async () => {
    globalThis.fetch.mockRejectedValue(new TypeError("Failed to fetch"));
    const sheets = await sheetsConfigurado();
    await expect(sheets.precargar()).rejects.toMatchObject({ codigo: "red" });
  });
});
