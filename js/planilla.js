// Planilla autogestionada (T20: RF-2, RF-3, RNF-4): la app busca en el Drive de la
// cuenta una planilla llamada "FichaCataWeb"; si no existe, la crea con los 35
// encabezados y recuerda el ID en el navegador (dato no sensible: quien decide el
// acceso es Google, no el ID). Scope: drive.file —solo ve archivos creados por la
// app— + spreadsheets. Reglas: skills seguridad-gis-sheets y sheets-api-navegador.

import { COLUMNAS } from "./serializacion.js";

export const NOMBRE_PLANILLA = "FichaCataWeb";

const CLAVE_ID = "ficha:id-planilla";
const DRIVE = "https://www.googleapis.com/drive/v3";
const BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const RANGO_ENCABEZADOS = "A1:AI1"; // 35 columnas: A..Z + AA..AI

const MENSAJES = {
  "no-autenticado":
    "Tu identificación venció. Identificate de nuevo para continuar.",
  "sin-acceso": "No tenés acceso a tu Google Drive.",
  cuota: "Google pide esperar un momento. Volvé a intentar en unos segundos.",
  google: "Google tuvo un problema momentáneo. Intentá de nuevo.",
  red: "Sin conexión a internet. Revisá la red y probá de nuevo.",
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

let enCurso = null; // un solo buscar/crear aunque llegue concurrente

export function hayIdEnNavegador() {
  try {
    return Boolean(localStorage.getItem(CLAVE_ID));
  } catch {
    return false;
  }
}

// Devuelve el ID de la planilla, creándola si hace falta (crear: true por defecto;
// la búsqueda usa crear: false para no dejar planillas vacías por gusto).
export function asegurarPlanilla({ obtenerToken, crear = true } = {}) {
  if (!enCurso) {
    enCurso = resolver({ obtenerToken, crear }).finally(() => {
      enCurso = null;
    });
  }
  return enCurso;
}

async function resolver({ obtenerToken, crear }) {
  try {
    const guardado = localStorage.getItem(CLAVE_ID);
    if (guardado) {
      return guardado;
    }
  } catch {
    // Sin almacenamiento (modo incógnito): se vuelve a localizar en Drive.
  }

  const token = await obtenerToken();

  // 1) Buscar por nombre en el Drive de la cuenta (drive.file: solo archivos de la app).
  const consulta =
    `name='${NOMBRE_PLANILLA}' and ` +
    `mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
  const url =
    `${DRIVE}/files?q=${encodeURIComponent(consulta)}` +
    `&fields=files(id)&orderBy=createdTime`;
  const buscada = await pedirConToken(url, token);
  const archivos = (await buscada.json().catch(() => ({})))?.files ?? [];
  if (archivos.length > 0) {
    return recordar(archivos[0].id);
  }
  if (!crear) {
    return null;
  }

  // 2) Crear la planilla y escribir los encabezados en la fila 1 (una sola vez).
  const creada = await pedirConToken(BASE, token, {
    method: "POST",
    body: JSON.stringify({ properties: { title: NOMBRE_PLANILLA } }),
  });
  const datos = await creada.json().catch(() => ({}));
  if (!datos.spreadsheetId) {
    throw fallo("google");
  }
  await pedirConToken(
    `${BASE}/${datos.spreadsheetId}/values/${RANGO_ENCABEZADOS}?valueInputOption=RAW`,
    token,
    {
      method: "PUT",
      body: JSON.stringify({ range: RANGO_ENCABEZADOS, values: [COLUMNAS] }),
    },
  );
  return recordar(datos.spreadsheetId);
}

async function pedirConToken(url, token, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(url, {
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

function recordar(id) {
  try {
    localStorage.setItem(CLAVE_ID, id);
  } catch {
    // Sin almacenamiento: no pasa nada, se localiza de nuevo la próxima.
  }
  return id;
}
