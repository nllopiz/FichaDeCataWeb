// Cliente REST de Google Sheets v4 desde el navegador (skill sheets-api-navegador).
// Solo transporte + caché en memoria: el saneado y la fila armada los aportan
// serializacion.js y guardado.js. Los errores de Google se mapean a códigos de la
// app con mensajes claros: la UI nunca muestra datos técnicos de la API (CA-8).

import { COLUMNAS, parsearFila } from "./serializacion.js";

const BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const RANGO_HOJA = "A1:AZ1000";

const MENSAJES = {
  "no-disponible": "La app no está configurada todavía.",
  "no-autenticado":
    "Tu identificación venció. Identificate de nuevo para continuar.",
  "sin-acceso": "No tenés acceso a esta planilla.",
  cuota: "Google pide esperar un momento. Volvé a intentar en unos segundos.",
  google: "Google tuvo un problema momentáneo. Intentá de nuevo.",
  red: "Sin conexión a internet. Revisá la red y probá de nuevo.",
  encabezados:
    "La planilla no tiene los encabezados esperados. Revisá la guía de configuración.",
  "no-encontrada": "No se encontró la ficha a editar en la planilla.",
};

function fallo(codigo) {
  const error = new Error(MENSAJES[codigo]);
  error.codigo = codigo;
  return error;
}

function mapearEstado(estado) {
  if (estado === 401) {
    return "no-autenticado";
  }
  if (estado === 403) {
    return "sin-acceso";
  }
  if (estado === 429) {
    return "cuota";
  }
  return "google";
}

let configuracion = null;
let cache = null; // { filas: [{ numeroFila, celdas }] } en memoria de la página
let precargaEnCurso = null; // "Cargando…" único: una sola llamada concurrente

// T20: el ID de la planilla ya no se configura; se resuelve con planilla.js —
// `obtenerIdPlanilla` crea si no existe (guardar), `buscarIdPlanilla` solo localiza
// (precarga de la búsqueda: no crea planillas vacías).
export function configurarSheets({
  obtenerIdPlanilla,
  buscarIdPlanilla,
  obtenerToken,
}) {
  configuracion = { obtenerIdPlanilla, buscarIdPlanilla, obtenerToken };
  cache = null;
}

export function invalidarCache() {
  cache = null;
}

export function hayCache() {
  return cache !== null;
}

async function pedir(idPlanilla, ruta, opciones = {}) {
  if (!configuracion) {
    throw fallo("no-disponible");
  }
  const token = await configuracion.obtenerToken();
  let respuesta;
  try {
    respuesta = await fetch(`${BASE}/${idPlanilla}/${ruta}`, {
      ...opciones,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  } catch {
    throw fallo("red");
  }
  if (!respuesta.ok) {
    throw fallo(mapearEstado(respuesta.status));
  }
  return respuesta;
}

// Escrituras y ediciones: aquí sí hace falta que la planilla exista (la crea T20).
async function idParaEscribir() {
  if (!configuracion) {
    throw fallo("no-disponible");
  }
  const id = await configuracion.obtenerIdPlanilla();
  if (!id) {
    throw fallo("no-disponible");
  }
  return id;
}

async function realizarPrecarga() {
  if (!configuracion) {
    throw fallo("no-disponible");
  }
  const idPlanilla = await configuracion.buscarIdPlanilla();
  if (!idPlanilla) {
    // T20: todavía no hay planilla creada → no hay fichas, sin red y sin error.
    return [];
  }
  const respuesta = await pedir(
    idPlanilla,
    `values:batchGet?ranges=${RANGO_HOJA}`,
  );
  const datos = await respuesta.json().catch(() => null);
  const valores = datos?.valueRanges?.[0]?.values ?? [];
  const [encabezados = [], ...filas] = valores;

  const encabezadoCorrecto =
    encabezados.length === COLUMNAS.length &&
    COLUMNAS.every((columna, i) => encabezados[i] === columna);
  if (!encabezadoCorrecto) {
    // Sin escribir nunca: el plan prohíbe migraciones; se informa y se revisa la hoja.
    throw fallo("encabezados");
  }

  cache = { filas: filas.map((celdas, i) => ({ numeroFila: i + 2, celdas })) };
  return fichas();
}

export async function precargar() {
  if (cache) {
    return fichas();
  }
  if (precargaEnCurso) {
    return precargaEnCurso;
  }
  precargaEnCurso = realizarPrecarga().finally(() => {
    precargaEnCurso = null;
  });
  return precargaEnCurso;
}

export function fichas() {
  if (!cache) {
    return null;
  }
  return cache.filas.map(({ celdas }) => parsearFila(celdas));
}

export function filaDeId(id) {
  if (!cache) {
    return null;
  }
  const entrada = cache.filas.find(
    ({ celdas }) => String(celdas[0]) === String(id),
  );
  return entrada ? entrada.numeroFila : null;
}

export async function append(celdas) {
  await pedir(
    await idParaEscribir(),
    `values/A:Z:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      body: JSON.stringify({ range: "A:Z", values: [celdas] }),
    },
  );
  invalidarCache();
}

export async function batchUpdate(id, celdas) {
  const numeroFila = filaDeId(id);
  if (!numeroFila) {
    throw fallo("no-encontrada");
  }
  const rango = `A${numeroFila}:AZ${numeroFila}`;
  await pedir(await idParaEscribir(), `values:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({
      valueInputOption: "USER_ENTERED",
      data: [{ range: rango, values: [celdas] }],
    }),
  });
  invalidarCache();
}
