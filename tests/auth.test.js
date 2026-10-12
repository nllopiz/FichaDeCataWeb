// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

const SCOPE_MINIMO = "https://www.googleapis.com/auth/spreadsheets";
const CLIENT_ID_FALSO = "falso-cliente.apps.googleusercontent.com";

let requestAccessToken;
let configCliente;
let revoke;

function instalarDobleGIS() {
  requestAccessToken = vi.fn();
  revoke = vi.fn();
  const initTokenClient = vi.fn((config) => {
    configCliente = config;
    return { requestAccessToken };
  });
  globalThis.google = { accounts: { oauth2: { initTokenClient, revoke } } };
  return initTokenClient;
}

async function nuevoAuth() {
  return import("../js/auth.js");
}

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  sessionStorage.clear();
  delete globalThis.google;
});

describe("configurarAuth (RF-18, skill seguridad-gis-sheets)", () => {
  it("usa token client con el scope mínimo de Sheets y el client ID dado", async () => {
    const initTokenClient = instalarDobleGIS();
    const { configurarAuth } = await nuevoAuth();

    configurarAuth({ clientId: CLIENT_ID_FALSO });

    expect(initTokenClient).toHaveBeenCalledOnce();
    expect(configCliente.client_id).toBe(CLIENT_ID_FALSO);
    expect(configCliente.scope).toBe(SCOPE_MINIMO);
  });

  it("al iniciar NO pide token: solo se pide al guardar (RF-18, RF-17)", async () => {
    instalarDobleGIS();
    const { configurarAuth } = await nuevoAuth();

    configurarAuth({ clientId: CLIENT_ID_FALSO });

    expect(requestAccessToken).not.toHaveBeenCalled();
  });
});

describe("obtenerToken (RF-18)", () => {
  it("resuelve el token cuando el popup de Google lo devuelve", async () => {
    instalarDobleGIS();
    const { configurarAuth, obtenerToken, hayToken } = await nuevoAuth();
    configurarAuth({ clientId: CLIENT_ID_FALSO });

    const promesa = obtenerToken();
    configCliente.callback({ access_token: "TOKEN_FALSO", expires_in: 3600 });

    await expect(promesa).resolves.toBe("TOKEN_FALSO");
    expect(hayToken()).toBe(true);
  });

  it("cancelar el popup devuelve 'sin token' sin error (RF-19)", async () => {
    instalarDobleGIS();
    const { configurarAuth, obtenerToken, hayToken } = await nuevoAuth();
    configurarAuth({ clientId: CLIENT_ID_FALSO });

    const promesa = obtenerToken();
    configCliente.callback({ error: "popup_closed_by_user" });

    await expect(promesa).resolves.toBeNull();
    expect(hayToken()).toBe(false);
  });

  it("el error_callback de GIS también cierra sin token ni excepción", async () => {
    instalarDobleGIS();
    const { configurarAuth, obtenerToken } = await nuevoAuth();
    configurarAuth({ clientId: CLIENT_ID_FALSO });

    const promesa = obtenerToken();
    configCliente.error_callback({ type: "popup_failed_to_open" });

    await expect(promesa).resolves.toBeNull();
  });

  it("reutiliza el token en memoria sin abrir otro popup", async () => {
    instalarDobleGIS();
    const { configurarAuth, obtenerToken } = await nuevoAuth();
    configurarAuth({ clientId: CLIENT_ID_FALSO });

    const primera = obtenerToken();
    configCliente.callback({ access_token: "TOKEN_FALSO" });
    await primera;

    await expect(obtenerToken()).resolves.toBe("TOKEN_FALSO");
    expect(requestAccessToken).toHaveBeenCalledOnce();
  });

  it("sin GIS configurado rechaza con mensaje claro (nada traba la app)", async () => {
    const { obtenerToken } = await nuevoAuth();
    await expect(obtenerToken()).rejects.toThrow(/no disponible/i);
  });
});

describe("el token vive solo en memoria (RNF-1, CL-7)", () => {
  it("nunca se escribe en localStorage, sessionStorage ni cookies", async () => {
    instalarDobleGIS();
    const { configurarAuth, obtenerToken } = await nuevoAuth();
    configurarAuth({ clientId: CLIENT_ID_FALSO });

    const promesa = obtenerToken();
    configCliente.callback({ access_token: "TOKEN_FALSO" });
    await promesa;

    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(document.cookie).toBe("");
  });

  it("el token no aparece en el DOM", async () => {
    instalarDobleGIS();
    const { configurarAuth, obtenerToken } = await nuevoAuth();
    configurarAuth({ clientId: CLIENT_ID_FALSO });

    const promesa = obtenerToken();
    configCliente.callback({ access_token: "TOKEN_FALSO" });
    await promesa;

    expect(document.documentElement.outerHTML).not.toContain("TOKEN_FALSO");
  });
});

describe("descartarToken (RNF-1, 401, salida de sesión)", () => {
  it("borra el token de memoria y revoca la sesión de Google", async () => {
    instalarDobleGIS();
    const { configurarAuth, obtenerToken, descartarToken, hayToken } =
      await nuevoAuth();
    configurarAuth({ clientId: CLIENT_ID_FALSO });

    const promesa = obtenerToken();
    configCliente.callback({ access_token: "TOKEN_FALSO" });
    await promesa;

    descartarToken();

    expect(hayToken()).toBe(false);
    expect(revoke).toHaveBeenCalledWith("TOKEN_FALSO", expect.any(Function));
  });

  it("tras descartar, el siguiente guardado pide identificación de nuevo", async () => {
    instalarDobleGIS();
    const { configurarAuth, obtenerToken, descartarToken } = await nuevoAuth();
    configurarAuth({ clientId: CLIENT_ID_FALSO });

    const primera = obtenerToken();
    configCliente.callback({ access_token: "TOKEN_FALSO" });
    await primera;
    descartarToken();

    const segunda = obtenerToken();
    expect(requestAccessToken).toHaveBeenCalledTimes(2);
    configCliente.callback({ access_token: "TOKEN_FALSO_2" });
    await expect(segunda).resolves.toBe("TOKEN_FALSO_2");
  });
});
