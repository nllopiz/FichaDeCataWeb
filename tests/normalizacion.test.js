import { describe, it, expect } from "vitest";
import { normalizarTexto, coincide } from "../js/normalizacion.js";

describe("normalizarTexto (RF-7)", () => {
  it("quita mayúsculas", () => {
    expect(normalizarTexto("Bodega Ejemplo")).toBe("bodega ejemplo");
  });

  it("quita acentos y la eñe", () => {
    expect(normalizarTexto("Línea Prueba Malbec")).toBe("linea prueba malbec");
    expect(normalizarTexto("Espumante Niñez")).toBe("espumante ninez");
  });

  it("recorta y colapsa espacios", () => {
    expect(normalizarTexto("  Bodega   Ejemplo  ")).toBe("bodega ejemplo");
  });
});

describe("coincide: búsqueda parcial (RF-7, CA-19)", () => {
  it("'ejemp' encuentra 'Bodega Ejemplo' y 'prueba' encuentra 'Línea Prueba Malbec'", () => {
    expect(coincide("ejemp", "Bodega Ejemplo")).toBe(true);
    expect(coincide("prueba", "Línea Prueba Malbec")).toBe(true);
  });

  it("ignora mayúsculas y acentos en los dos lados", () => {
    expect(coincide("EJEMP", "bodega ejempLO")).toBe(true);
    expect(coincide("linea", "Línea")).toBe(true);
  });

  it("coincidencia parcial en cualquier posición", () => {
    expect(coincide("malbec", "Línea Prueba Malbec")).toBe(true);
    expect(coincide("prue", "Línea Prueba Malbec")).toBe(true);
  });

  it("no coincide cuando no hay coincidencia parcial", () => {
    expect(coincide("borde", "Bodega Ejemplo")).toBe(false);
    expect(coincide("malbec rubí", "Línea Prueba Malbec")).toBe(false);
  });

  it("el término vacío no coincide con nada (la vista decide qué mostrar)", () => {
    expect(coincide("", "Bodega Ejemplo")).toBe(false);
  });
});
