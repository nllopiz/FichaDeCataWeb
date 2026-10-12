import { describe, it, expect } from "vitest";
import {
  COLUMNAS,
  saneado,
  serializarFila,
  parsearFila,
  generarId,
} from "../js/serializacion.js";

const ficha = () => ({
  id: 1728000000000,
  bodega: "Bodega Ejemplo",
  linea: "Línea Prueba Malbec",
  pais: "Argentina",
  provincia: "Mendoza",
  zona: "Valle de Uco",
  tipo: "Tinto",
  tono_matiz: "granate",
  intensidad_color: "Alta",
  composicion: [
    { varietal: "Malbec", porcentaje: 80 },
    { varietal: "Cabernet Franc", porcentaje: 20 },
  ],
  notas_aromaticas: ["cítricos", "violeta"],
  cosecha: 2022,
  graduacion: 14,
  apreciacion: "Muy buena para el precio.",
  autor: "dueno@ejemplo.test",
  fecha_creacion: "11/10/2026 19:00",
  fecha_modificacion: "11/10/2026 19:00",
});

describe("COLUMNAS", () => {
  it("tiene el orden del plan: id primero, auditoría al final", () => {
    expect(COLUMNAS[0]).toBe("id");
    expect(COLUMNAS.at(-1)).toBe("fecha_modificacion");
    expect(COLUMNAS).toContain("composicion");
    expect(COLUMNAS).toContain("graduacion");
    expect(COLUMNAS).toHaveLength(35);
  });
});

describe("saneado anti-fórmula (skill seguridad-gis-sheets)", () => {
  it("prefija comilla simple a texto que Sheets interpretaría como fórmula", () => {
    expect(saneado("=SUM(A1)")).toBe("'=SUM(A1)");
    expect(saneado("+381155551234")).toBe("'+381155551234");
    expect(saneado("-menos")).toBe("'-menos");
    expect(saneado("@mencion")).toBe("'@mencion");
  });

  it("deja el texto normal sin tocar y los vacíos quedan vacíos", () => {
    expect(saneado("Bodega Ejemplo")).toBe("Bodega Ejemplo");
    expect(saneado("")).toBe("");
    expect(saneado(undefined)).toBe("");
  });
});

describe("serializarFila", () => {
  it("produce 35 celdas en orden, con id primero y auditoría al final", () => {
    const celdas = serializarFila(ficha());
    expect(celdas).toHaveLength(35);
    expect(celdas[0]).toBe(1728000000000);
    expect(celdas.at(-3)).toBe("dueno@ejemplo.test");
  });

  it("campos múltiples van separados por ';' legible", () => {
    const celdas = serializarFila(ficha());
    const idxComposicion = COLUMNAS.indexOf("composicion");
    const idxNotas = COLUMNAS.indexOf("notas_aromaticas");
    expect(celdas[idxComposicion]).toBe("Malbec:80; Cabernet Franc:20");
    expect(celdas[idxNotas]).toBe("cítricos; violeta");
  });

  it("la graduación va como número", () => {
    const celdas = serializarFila(ficha());
    expect(celdas[COLUMNAS.indexOf("graduacion")]).toBe(14);
  });

  it("todo texto de usuario queda saneado", () => {
    const celdas = serializarFila({ ...ficha(), bodega: "=hack" });
    expect(celdas[COLUMNAS.indexOf("bodega")]).toBe("'=hack");
  });

  it("campos vacíos quedan como celda vacía", () => {
    const celdas = serializarFila({
      ...ficha(),
      pais: "",
      notas_aromaticas: [],
    });
    expect(celdas[COLUMNAS.indexOf("pais")]).toBe("");
    expect(celdas[COLUMNAS.indexOf("notas_aromaticas")]).toBe("");
  });
});

describe("parsearFila", () => {
  it("devuelve la ficha con composición y notas como listas", () => {
    const celdas = serializarFila(ficha());
    const leida = parsearFila(celdas);
    expect(leida.bodega).toBe("Bodega Ejemplo");
    expect(leida.composicion).toEqual([
      { varietal: "Malbec", porcentaje: 80 },
      { varietal: "Cabernet Franc", porcentaje: 20 },
    ]);
    expect(leida.notas_aromaticas).toEqual(["cítricos", "violeta"]);
    expect(leida.graduacion).toBe(14);
    expect(leida.cosecha).toBe(2022);
  });

  it("round-trip: serializar y parsear devuelve la misma ficha", () => {
    const vacias = Object.fromEntries(COLUMNAS.map((c) => [c, ""]));
    expect(parsearFila(serializarFila(ficha()))).toEqual({
      ...vacias,
      ...ficha(),
    });
  });

  it("quita la comilla de escape que Sheets devuelve como texto", () => {
    const celdas = serializarFila({ ...ficha(), bodega: "=hack" });
    expect(parsearFila(celdas).bodega).toBe("=hack");
  });
});

describe("generarId", () => {
  it("devuelve timestamps únicos incluso consecutivos", () => {
    const a = generarId();
    const b = generarId();
    expect(typeof a).toBe("number");
    expect(b).toBeGreaterThan(a);
  });
});
