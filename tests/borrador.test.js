// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  guardarBorrador,
  recuperarBorrador,
  borrarBorrador,
  CLAVE_NUEVA,
} from "../js/borrador.js";

const contenido = () => ({
  bodega: "Bodega Ejemplo",
  linea: "Línea Prueba Malbec",
  composicion: [{ varietal: "Malbec", porcentaje: 100 }],
});

beforeEach(() => {
  localStorage.clear();
});

describe("borrador en localStorage (RF-6, CL-2, CA-4)", () => {
  it("persistir y recuperar devuelve el mismo contenido", () => {
    guardarBorrador(CLAVE_NUEVA, contenido());
    expect(recuperarBorrador(CLAVE_NUEVA)).toEqual(contenido());
  });

  it("sin borrador devuelve null", () => {
    expect(recuperarBorrador(CLAVE_NUEVA)).toBeNull();
  });

  it("borrar elimina el borrador (tras guardado exitoso o 'Nueva ficha')", () => {
    guardarBorrador(CLAVE_NUEVA, contenido());
    borrarBorrador(CLAVE_NUEVA);
    expect(recuperarBorrador(CLAVE_NUEVA)).toBeNull();
  });

  it("la ficha nueva y cada ficha en edición tienen borradores independientes", () => {
    guardarBorrador(CLAVE_NUEVA, contenido());
    guardarBorrador("1728000000000", { ...contenido(), bodega: "Otra Bodega" });
    expect(recuperarBorrador(CLAVE_NUEVA).bodega).toBe("Bodega Ejemplo");
    expect(recuperarBorrador("1728000000000").bodega).toBe("Otra Bodega");
    borrarBorrador(CLAVE_NUEVA);
    expect(recuperarBorrador("1728000000000")).not.toBeNull();
  });

  it("nunca persiste datos de sesión (token) aunque lleguen por error (skill seguridad-gis-sheets)", () => {
    guardarBorrador(CLAVE_NUEVA, {
      ...contenido(),
      token: "SECRETO",
      accessToken: "SECRETO2",
    });
    const leido = recuperarBorrador(CLAVE_NUEVA);
    expect(leido).toEqual(contenido());
    expect(localStorage.getItem("ficha-borrador:nueva")).not.toContain(
      "SECRETO",
    );
  });

  it("un borrador corrupto no rompe la app: devuelve null (nada se pierde, nada traba)", () => {
    localStorage.setItem("ficha-borrador:nueva", "{corrupto");
    expect(recuperarBorrador(CLAVE_NUEVA)).toBeNull();
  });

  it("si localStorage falla (cuota llena), guardarBorrador no lanza y devuelve false", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceeded");
    });
    expect(guardarBorrador(CLAVE_NUEVA, contenido())).toBe(false);
  });
});
