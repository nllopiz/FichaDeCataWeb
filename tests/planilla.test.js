// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { COLUMNAS } from "../js/serializacion.js";

// T20: planilla autogestionada — buscar en Drive → crear con encabezados →
// recordar el ID en el navegador. Scope drive.file (solo archivos de la app).
// Doble de fetch: nunca se toca Drive ni Sheets de verdad (skill datos-sensibles).

const TOKEN = "TOKEN_FALSO";
const CLAVE_ID = "ficha:id-planilla";

function respuestaOk(json = {}) {
  return { ok: true, status: 200, json: async () => json };
}

function respuestaError(estado) {
  return { ok: false, status: estado, json: async () => ({}) };
}

function registrarLlamadas(archivos = []) {
  const llamadas = { drive: [], crear: [], encabezados: [] };
  globalThis.fetch = vi.fn(async (url, opciones = {}) => {
    if (url.includes("drive/v3/files")) {
      llamadas.drive.push(url);
      return respuestaOk({ files: archivos });
    }
    if (url.endsWith("/spreadsheets") && opciones.method === "POST") {
      llamadas.crear.push(JSON.parse(opciones.body));
      return respuestaOk({ spreadsheetId: "PLANILLA_NUEVA" });
    }
    if (url.includes("/values/")) {
      llamadas.encabezados.push(JSON.parse(opciones.body));
      return respuestaOk({});
    }
    throw new Error(`URL inesperada: ${url}`);
  });
  return llamadas;
}

const obtenerToken = async () => TOKEN;

async function nuevaPlanilla() {
  return import("../js/planilla.js");
}

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

describe("asegurarPlanilla (T20: buscar → crear → recordar)", () => {
  it("con el ID ya en el navegador no toca la red", async () => {
    localStorage.setItem(CLAVE_ID, "PLANILLA_EXISTENTE");
    globalThis.fetch = vi.fn();
    const planilla = await nuevaPlanilla();

    await expect(planilla.asegurarPlanilla({ obtenerToken })).resolves.toBe(
      "PLANILLA_EXISTENTE",
    );
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("sin ID: busca en Drive, no encuentra, crea FichaCataWeb y escribe los 35 encabezados", async () => {
    const llamadas = registrarLlamadas();
    const planilla = await nuevaPlanilla();

    const id = await planilla.asegurarPlanilla({ obtenerToken });

    expect(id).toBe("PLANILLA_NUEVA");
    expect(llamadas.drive).toHaveLength(1);
    expect(llamadas.drive[0]).toContain("FichaCataWeb");
    expect(llamadas.drive[0]).toContain("files?");
    expect(llamadas.crear).toEqual([{ properties: { title: "FichaCataWeb" } }]);
    expect(llamadas.encabezados).toHaveLength(1);
    expect(llamadas.encabezados[0].values[0]).toEqual(COLUMNAS);
    expect(localStorage.getItem(CLAVE_ID)).toBe("PLANILLA_NUEVA");
  });

  it("si Drive ya tiene una FichaCataWeb, la reutiliza y no crea otra", async () => {
    const llamadas = registrarLlamadas([{ id: "PLANILLA_VIEJA" }]);
    const planilla = await nuevaPlanilla();

    const id = await planilla.asegurarPlanilla({ obtenerToken });

    expect(id).toBe("PLANILLA_VIEJA");
    expect(llamadas.crear).toHaveLength(0);
    expect(llamadas.encabezados).toHaveLength(0);
    expect(localStorage.getItem(CLAVE_ID)).toBe("PLANILLA_VIEJA");
  });

  it("crear:false (la búsqueda no crea planillas vacías) devuelve null", async () => {
    const llamadas = registrarLlamadas();
    const planilla = await nuevaPlanilla();

    await expect(
      planilla.asegurarPlanilla({ obtenerToken, crear: false }),
    ).resolves.toBeNull();
    expect(llamadas.drive).toHaveLength(1);
    expect(llamadas.crear).toHaveLength(0);
    expect(localStorage.getItem(CLAVE_ID)).toBeNull();
  });

  it("dos llamadas concurrentes hacen UNA sola búsqueda y UNA sola creación", async () => {
    const llamadas = registrarLlamadas();
    const planilla = await nuevaPlanilla();

    const [a, b] = await Promise.all([
      planilla.asegurarPlanilla({ obtenerToken }),
      planilla.asegurarPlanilla({ obtenerToken }),
    ]);

    expect(a).toBe("PLANILLA_NUEVA");
    expect(b).toBe("PLANILLA_NUEVA");
    expect(llamadas.drive).toHaveLength(1);
    expect(llamadas.crear).toHaveLength(1);
  });

  it("errores mapeados como en el resto de la app (skill sheets-api-navegador §6)", async () => {
    const planilla = await nuevaPlanilla();

    globalThis.fetch = vi.fn(async () => respuestaError(401));
    await expect(planilla.asegurarPlanilla({ obtenerToken })).rejects.toThrow(
      /venció/,
    );

    const planilla2 = await nuevaPlanilla();
    globalThis.fetch = vi.fn(async () => respuestaError(403));
    await expect(planilla2.asegurarPlanilla({ obtenerToken })).rejects.toThrow(
      /acceso/,
    );

    const planilla3 = await nuevaPlanilla();
    globalThis.fetch = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    await expect(planilla3.asegurarPlanilla({ obtenerToken })).rejects.toThrow(
      /Sin conexión/,
    );
  });

  it("lo único que se recuerda es el ID de la planilla, nunca el token (RNF-1)", async () => {
    registrarLlamadas();
    const planilla = await nuevaPlanilla();

    await planilla.asegurarPlanilla({ obtenerToken });

    expect(localStorage.length).toBe(1);
    expect(localStorage.getItem(CLAVE_ID)).toBe("PLANILLA_NUEVA");
    expect(localStorage.getItem(CLAVE_ID)).not.toContain(TOKEN);
  });
});
