// Identificación con Google Identity Services (RF-18, RF-19, RNF-1).
// Reglas de la skill seguridad-gis-sheets: scope mínimo de Sheets, el token vive
// SOLO en memoria (nunca localStorage/cookies/DOM/URL), se pide solo al guardar y
// cancelar el popup no es un error: es "sin token".

const SCOPE_MINIMO = "https://www.googleapis.com/auth/spreadsheets";

let cliente = null;
let tokenEnMemoria = null;
let promesaPendiente = null;
let resolverPendiente = null;

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
    callback: (respuesta) => {
      if (respuesta?.access_token) {
        tokenEnMemoria = respuesta.access_token;
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
  promesaPendiente = new Promise((resolve) => {
    resolverPendiente = resolve;
  });
  cliente.requestAccessToken();
  return promesaPendiente;
}

export function descartarToken() {
  const anterior = tokenEnMemoria;
  tokenEnMemoria = null;
  if (anterior) {
    // Mejor esfuerzo: revocar la sesión de Google; los borradores NO se borran (RF-6).
    oauth2()?.revoke?.(anterior, () => {});
  }
}
