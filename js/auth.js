// Identificación con Google Identity Services (RF-18, RF-19, RNF-1).
// Reglas de la skill seguridad-gis-sheets: scopes mínimos (Sheets + `openid email`
// para el correo de la cuenta elegida → columna `autor`, T19), el token vive
// SOLO en memoria (nunca localStorage/cookies/DOM/URL), se pide solo al guardar y
// cancelar el popup no es un error: es "sin token".

const SCOPE_MINIMO =
  "openid email https://www.googleapis.com/auth/spreadsheets";

let cliente = null;
let tokenEnMemoria = null;
let correoEnMemoria = null;
let promesaPendiente = null;
let resolverPendiente = null;

// T19: el correo viene en el id_token (JWT firmado por Google) de la cuenta que la
// persona eligió en el selector. Si el token no llega o es ilegible → null.
function correoDeIdToken(idToken) {
  try {
    const [, payload] = idToken.split(".");
    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");
    return JSON.parse(atob(base64)).email ?? null;
  } catch {
    return null;
  }
}

function resolverCon(token) {
  if (resolverPendiente) {
    const resolver = resolverPendiente;
    promesaPendiente = null;
    resolverPendiente = null;
    resolver(token);
  }
}

function oauth2() {
  return globalThis.google?.accounts?.oauth2;
}

export function configurarAuth({ clientId }) {
  const api = oauth2();
  if (!api) {
    throw new Error("Identificación con Google no disponible.");
  }
  cliente = api.initTokenClient({
    client_id: clientId,
    scope: SCOPE_MINIMO,
    // T22: aunque haya una sesión de Google activa, mostrar siempre el selector
    // para que la persona elija con qué cuenta identificarse (dentro de RF-18).
    prompt: "select_account",
    callback: (respuesta) => {
      if (respuesta?.access_token) {
        tokenEnMemoria = respuesta.access_token;
        correoEnMemoria = correoDeIdToken(respuesta.id_token);
        resolverCon(tokenEnMemoria);
      } else {
        // Popup cancelado por el usuario: sin token, sin error (RF-19).
        resolverCon(null);
      }
    },
    error_callback: () => {
      // Popup bloqueado o cerrado: mismo tratamiento que cancelar.
      resolverCon(null);
    },
  });
}

export function hayToken() {
  return tokenEnMemoria !== null;
}

// T19: correo de la cuenta elegida en el selector (columna `autor`, CA-9).
export function obtenerCorreo() {
  return correoEnMemoria;
}

export function obtenerToken() {
  if (tokenEnMemoria) {
    return Promise.resolve(tokenEnMemoria);
  }
  if (!cliente) {
    return Promise.reject(
      new Error("Identificación con Google no disponible."),
    );
  }
  if (promesaPendiente) {
    return promesaPendiente;
  }
  // El objeto local se devuelve aunque un callback síncrono ya lo haya resuelto
  // (doble de GIS en pruebas); el popup real resuelve después, en otro turno.
  const promesa = new Promise((resolve) => {
    resolverPendiente = resolve;
  });
  promesaPendiente = promesa;
  cliente.requestAccessToken();
  return promesa;
}

export function descartarToken() {
  const anterior = tokenEnMemoria;
  tokenEnMemoria = null;
  correoEnMemoria = null;
  if (anterior) {
    // Mejor esfuerzo: revocar la sesión de Google; los borradores NO se borran (RF-6).
    oauth2()?.revoke?.(anterior, () => {});
  }
}
