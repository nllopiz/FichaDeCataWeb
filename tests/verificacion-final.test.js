// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  guardarBorrador,
  recuperarBorrador,
  CLAVE_NUEVA,
} from "../js/borrador.js";

// T18: verificación final del MVP. Revisiones automáticas que la spec pide como
// checklist de cierre (RNF-1, RNF-7 y datos ficticios de la skill datos-sensibles).

const leer = (ruta) => readFileSync(ruta, "utf8");
const html = leer("index.html");

describe("T18: verificación final del MVP", () => {
  it("CA-6: cada campo de la lista de RF-9 es un <select> en el formulario", () => {
    const camposRf9 = [
      "tipo",
      "cosecha",
      "intensidad_color",
      "vivacidad_brillo",
      "limpieza_transparencia",
      "evolucion_color",
      "limpieza_franqueza",
      "expresion_intensidad",
      "equilibrio",
      "dulzor",
      "acidez",
      "taninos_cantidad",
      "taninos_calidad",
      "alcohol_percepcion",
      "cuerpo",
      "entrada",
      "postgusto",
      "impresion_final",
    ];
    const idsDeSelect = new Set(
      [...html.matchAll(/<select[^>]*\bid="([^"]+)"/g)].map((m) => m[1]),
    );
    for (const campo of camposRf9) {
      expect(idsDeSelect.has(campo), `RF-9 "${campo}" debe ser <select>`).toBe(
        true,
      );
    }
  });

  it("CA-18: el formulario no solicita datos personales de terceros (RNF-7)", () => {
    const controles = [
      ...html.matchAll(
        /<(?:input|select|textarea)\b[^>]*\b(?:id|name)="([^"]+)"/g,
      ),
    ].map((m) => m[1]);
    const personales = [
      "nombre",
      "apellido",
      "dni",
      "telefono",
      "mail",
      "correo",
      "email",
      "direccion",
      "domicilio",
      "nacimiento",
      "cuil",
      "cuit",
    ];
    for (const control of controles) {
      for (const palabra of personales) {
        expect(
          control.includes(palabra),
          `campo "${control}" parece dato personal`,
        ).toBe(false);
      }
    }
    // Ni inputs de tipo correo/teléfono.
    expect(html).not.toMatch(/type="(email|tel)"/);
  });

  it("el token de acceso no se persiste en ningún lado (RNF-1)", () => {
    // El token vive solo en la variable de módulo de auth.js (skill
    // seguridad-gis-sheets §2): ninguna API de persistencia en auth/app.
    // Se ignoran comentarios: auth.js justamente explica que NO usa localStorage.
    const sinComentarios = (texto) =>
      texto.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const ruta of ["js/auth.js", "js/app.js"]) {
      expect(sinComentarios(leer(ruta)), ruta).not.toMatch(
        /localStorage|sessionStorage|document\.cookie|indexedDB|URLSearchParams|location\.hash/,
      );
    }
  });

  it("el borrador guarda solo datos del vino: descarta claves de sesión", () => {
    // Comportamiento sobre el módulo real (RF-6 + skill seguridad-gis-sheets):
    // localStorage solo recibe campos de ficha, jamás tokens.
    guardarBorrador(CLAVE_NUEVA, {
      bodega: "Bodega Ejemplo",
      token: "NO_DEBE_PERSISTIR",
      accessToken: "TAMPOCO",
    });
    expect(recuperarBorrador(CLAVE_NUEVA)).toEqual({
      bodega: "Bodega Ejemplo",
    });
    expect(localStorage.getItem("ficha-borrador:nueva")).not.toContain(
      "NO_DEBE_PERSISTIR",
    );
  });

  it("no hay secretos ni credenciales en el código del producto", () => {
    const rutas = [
      ...readdirSync("js").map((archivo) => join("js", archivo)),
      "index.html",
    ];
    const prohibido =
      /client_secret|-----BEGIN|AIza[0-9A-Za-z_-]{35}|\d+-[\w]+\.apps\.googleusercontent\.com/;
    for (const ruta of rutas) {
      expect(leer(ruta).match(prohibido), `posible secreto en ${ruta}`).toBe(
        null,
      );
    }
  });

  it("los tests usan solo datos ficticios (skill datos-sensibles)", () => {
    const fuentes = ["tests", "e2e"]
      .flatMap((carpeta) =>
        readdirSync(carpeta)
          .filter((archivo) => archivo.endsWith(".js"))
          .map((archivo) => join(carpeta, archivo)),
      )
      .map(leer)
      .join("\n");
    const correos = fuentes.match(/[\w.+-]+@[\w.-]+\.\w+/g) ?? [];
    for (const correo of correos) {
      expect(correo, `correo no ficticio: ${correo}`).toMatch(
        /@ejemplo\.test$/,
      );
    }
  });
});
