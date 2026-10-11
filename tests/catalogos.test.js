import { describe, it, expect } from "vitest";
import {
  TIPOS_VINO,
  cosechas,
  INTENSIDAD_COLOR,
  VIVACIDAD_BRILLO,
  limpiezaTransparencia,
  EVOLUCION_COLOR,
  LIMPIEZA_FRANQUEZA,
  DEFECTOS,
  EXPRESION_INTENSIDAD,
  EQUILIBRIO,
  DULZOR,
  ACIDEZ,
  TANINOS_CANTIDAD,
  TANINOS_CALIDAD,
  ALCOHOL_PERCEPCION,
  CUERPO,
  ENTRADA,
  POSTGUSTO,
  IMPRESION_FINAL,
  tonoPermitido,
  COLOR_ESPUMANTE,
  METODO_ESPUMANTE,
  catalogoDescriptores,
} from "../js/catalogos.js";

describe("RF-9: campos de lista cerrada", () => {
  it("tipo de vino tiene exactamente los valores de la spec", () => {
    expect(TIPOS_VINO).toEqual([
      "Tinto",
      "Blanco",
      "Rosado",
      "Naranjo",
      "Espumante",
      "Dulce o de cosecha tardía",
      "Fortificado o generoso",
    ]);
  });

  it("cosecha: años desde el actual hacia atrás y 'Sin añada (NV)' al final", () => {
    const lista = cosechas(2026);
    expect(lista[0]).toBe(2026);
    expect(lista[1]).toBe(2025);
    expect(lista.at(-1)).toBe("Sin añada (NV)");
    expect(lista).toHaveLength(52); // año actual + 50 hacia atrás + NV
  });

  it("campos simples de RF-9 tienen los valores exactos", () => {
    expect(INTENSIDAD_COLOR).toEqual(["Baja", "Media", "Alta"]);
    expect(VIVACIDAD_BRILLO).toEqual([
      "Apagado",
      "Poco brillante",
      "Brillante",
      "Muy brillante",
    ]);
    expect(EVOLUCION_COLOR).toEqual([
      "Joven",
      "En desarrollo",
      "Evolucionado",
      "Oxidado",
    ]);
    expect(EXPRESION_INTENSIDAD).toEqual([
      "Baja",
      "Media-",
      "Media",
      "Media+",
      "Alta",
    ]);
    expect(EQUILIBRIO).toEqual([
      "Desequilibrado",
      "Poco equilibrado",
      "Equilibrado",
      "Armónico",
    ]);
    expect(DULZOR).toEqual(["seco", "semiseco", "semidulce", "dulce"]);
    expect(ACIDEZ).toEqual(["baja", "media", "alta"]);
    expect(TANINOS_CANTIDAD).toEqual(["bajos", "medios", "altos"]);
    expect(TANINOS_CALIDAD).toEqual([
      "sedosos",
      "redondos",
      "firmes",
      "rugosos",
      "astringentes",
    ]);
    expect(ALCOHOL_PERCEPCION).toEqual(["bajo", "medio", "alto"]);
    expect(CUERPO).toEqual(["ligero", "medio", "pleno"]);
    expect(ENTRADA).toEqual([
      "suave",
      "fresca",
      "ácida",
      "cálida",
      "astringente",
      "untuosa",
    ]);
    expect(POSTGUSTO).toEqual(["Corto", "Medio", "Largo", "Muy largo"]);
    expect(IMPRESION_FINAL).toEqual([
      "Defectuoso",
      "Pobre",
      "Aceptable",
      "Bueno",
      "Muy bueno",
      "Sobresaliente",
    ]);
  });

  it("limpieza o franqueza y lista de defectos", () => {
    expect(LIMPIEZA_FRANQUEZA).toEqual([
      "Franco",
      "Con defecto leve",
      "Defectuoso",
    ]);
    expect(DEFECTOS).toEqual([
      "TCA",
      "reducción",
      "acidez volátil",
      "oxidación",
      "Brett",
    ]);
  });

  it("limpieza y transparencia: base para todos y extra solo para tintos", () => {
    expect(limpiezaTransparencia("Blanco")).toEqual([
      "Cristalino",
      "Limpio",
      "Velado",
      "Turbio",
    ]);
    expect(limpiezaTransparencia("Tinto")).toEqual([
      "Cristalino",
      "Limpio",
      "Velado",
      "Turbio",
      "Transparente",
      "Translúcido",
      "Opaco",
      "Cubierto",
    ]);
  });
});

describe("RF-12 y RF-16: tono o matiz dependiente del tipo", () => {
  it("tono por tipo base", () => {
    expect(tonoPermitido("Blanco")).toEqual([
      "limón-verdoso",
      "limón",
      "dorado",
      "ámbar",
    ]);
    expect(tonoPermitido("Rosado")).toEqual([
      "rosa pálido",
      "salmón",
      "rosa",
      "frambuesa",
    ]);
    expect(tonoPermitido("Tinto")).toEqual([
      "púrpura",
      "rubí",
      "granate",
      "teja",
    ]);
  });

  it("naranjo: valores de blanco, más cobre (CA-12)", () => {
    expect(tonoPermitido("Naranjo")).toEqual([
      "limón-verdoso",
      "limón",
      "dorado",
      "ámbar",
      "cobre",
    ]);
  });

  it("espumante: el tono depende del color elegido (CA-15)", () => {
    expect(tonoPermitido("Espumante", "Blanco")).toEqual([
      "limón-verdoso",
      "limón",
      "dorado",
      "ámbar",
      "cobre",
    ]);
    expect(tonoPermitido("Espumante", "Rosado")).toEqual([
      "rosa pálido",
      "salmón",
      "rosa",
      "frambuesa",
    ]);
  });

  it("espumante sin color elegido, y tipos sin tono definido en la spec", () => {
    expect(tonoPermitido("Espumante")).toEqual([]);
    expect(tonoPermitido("Dulce o de cosecha tardía")).toEqual([]);
    expect(tonoPermitido("Fortificado o generoso")).toEqual([]);
  });

  it("color y método del espumante (RF-16)", () => {
    expect(COLOR_ESPUMANTE).toEqual(["Blanco", "Rosado"]);
    expect(METODO_ESPUMANTE).toEqual(["tradicional", "Charmat", "ancestral"]);
  });
});

describe("RF-13: descriptores en dos niveles", () => {
  it("tiene las 7 familias del catálogo", () => {
    const familias = catalogoDescriptores().map((f) => f.familia);
    expect(familias).toEqual([
      "Frutales",
      "Florales",
      "Vegetales y herbáceos",
      "Especiados",
      "Crianza (secundarios)",
      "Terciarios",
      "Minerales",
    ]);
  });

  it("cada familia tiene descriptores y Frutales arranca con cítricos y carozo", () => {
    for (const { familia, descriptores } of catalogoDescriptores()) {
      expect(descriptores.length, familia).toBeGreaterThan(0);
    }
    const frutales = catalogoDescriptores().find(
      (f) => f.familia === "Frutales",
    );
    expect(frutales.descriptores.slice(0, 2)).toEqual(["cítricos", "carozo"]);
  });

  it("Minerales incluye tiza, pizarra y sal", () => {
    const minerales = catalogoDescriptores().find(
      (f) => f.familia === "Minerales",
    );
    expect(minerales.descriptores).toContain("tiza");
    expect(minerales.descriptores).toContain("pizarra");
    expect(minerales.descriptores).toContain("sal");
  });
});
