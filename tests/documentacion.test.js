import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { COLUMNAS } from "../js/serializacion.js";

// T17: las guías del Solicitante, verificadas como cualquier otro artefacto.
const RUTAS = {
  hoja: "docs/guia-configuracion-hoja.md",
  despliegue: "docs/guia-despliegue.md",
  uso: "docs/guia-uso.md",
  checklist: "docs/checklist-entrega.md",
};

const leer = (clave) => readFileSync(RUTAS[clave], "utf8");

describe("T17: guías del Solicitante", () => {
  it("la guía de hoja explica que la app busca o crea la planilla FichaCataWeb (T20)", () => {
    const hoja = leer("hoja");
    expect(hoja).toMatch(/FichaCataWeb/);
    expect(hoja).toMatch(/crea/);
    // Ya no se pide configurar el ID de la planilla ni el correo.
    expect(hoja).not.toMatch(/REEMPLAZAR_ID_PLANILLA/);
    expect(hoja).not.toMatch(/REEMPLAZAR_CORREO_DUENO/);
  });

  it("las guías y el checklist de entrega existen", () => {
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

  it("el checklist de entrega cubre los pendientes reales", () => {
    const checklist = leer("checklist");
    expect(checklist).toMatch(/Client ID público/);
    expect(checklist).toMatch(/js\/config\.js/);
    expect(checklist).toMatch(/guardado real/);
    expect(checklist).toMatch(/GitHub Pages/);
    expect(checklist).toMatch(/CA-17/);
    expect(checklist).toMatch(/Restringido/);
  });
});

// T21: la documentación del proyecto refleja el MVP terminado.
describe("T21: documentación del proyecto al día", () => {
  const agents = readFileSync("AGENTS.md", "utf8");
  const changelog = readFileSync("CHANGELOG.md", "utf8");
  const version = readFileSync("VERSION", "utf8").trim();
  const paquete = JSON.parse(readFileSync("package.json", "utf8"));

  it("AGENTS.md refleja la Etapa 6 y el código ya implementado", () => {
    expect(agents).toMatch(/Etapa 6/);
    expect(agents).not.toMatch(/aún no tiene código/);
    expect(agents).not.toMatch(/se crearán al implementar/);
  });

  it("CHANGELOG.md describe el MVP de FichaDeCataWeb", () => {
    expect(changelog).toMatch(/FichaDeCataWeb/);
    expect(changelog).toMatch(/## 1\.0/);
    expect(changelog).not.toMatch(/Django/);
  });

  it("la versión de package.json coincide con VERSION", () => {
    expect(paquete.version).toBe(`${version}.0`);
  });
});
