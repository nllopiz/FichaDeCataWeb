import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { COLUMNAS } from "../js/serializacion.js";

// T17: las guías del Solicitante, verificadas como cualquier otro artefacto.
const RUTAS = {
  hoja: "docs/guia-configuracion-hoja.md",
  despliegue: "docs/guia-despliegue.md",
  uso: "docs/guia-uso.md",
};

const leer = (clave) => readFileSync(RUTAS[clave], "utf8");

describe("T17: guías del Solicitante", () => {
  it("las tres guías existen", () => {
    for (const ruta of Object.values(RUTAS)) {
      expect(existsSync(ruta), `falta ${ruta}`).toBe(true);
    }
  });

  it("la guía de hoja lista los encabezados en el orden exacto (plan §2)", () => {
    const linea = leer("hoja")
      .split("\n")
      .find((fila) => fila.startsWith("id, bodega"));
    expect(linea, "falta la línea de encabezados").toBeDefined();
    expect(linea.split(", ")).toEqual(COLUMNAS);
  });

  it("usan solo datos ficticios (skill datos-sensibles)", () => {
    const textos = Object.keys(RUTAS).map(leer).join("\n");
    const correos = textos.match(/[\w.+-]+@[\w.-]+\.\w+/g) ?? [];
    for (const correo of correos) {
      expect(correo, `correo no ficticio: ${correo}`).toMatch(
        /@ejemplo\.test$/,
      );
    }
    // Nada de IDs reales de planilla (44 caracteres).
    expect(textos).not.toMatch(/\b\d{30,}\b/);
  });

  it("la guía de uso documenta la re-autorización de cada 7 días y el borrador", () => {
    const uso = leer("uso");
    expect(uso).toMatch(/Probando/);
    expect(uso).toMatch(/7 días/);
    expect(uso).toMatch(/borrador/);
    expect(uso).toMatch(/Nueva ficha/);
  });

  it("la guía de despliegue cubre GitHub Pages", () => {
    expect(leer("despliegue")).toMatch(/GitHub Pages/);
  });
});
