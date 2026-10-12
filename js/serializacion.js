// Serialización de ficha ↔ fila de la hoja (plan §2: una fila por ficha, campos
// múltiples separados por ";"). Incluye el saneado anti-fórmula exigido por la skill
// seguridad-gis-sheets y el id único de creación (grill-me p. 2).

export const COLUMNAS = [
  "id",
  "bodega",
  "linea",
  "pais",
  "provincia",
  "zona",
  "tipo",
  "tono_matiz",
  "intensidad_color",
  "vivacidad_brillo",
  "limpieza_transparencia",
  "evolucion_color",
  "limpieza_franqueza",
  "defecto",
  "expresion_intensidad",
  "equilibrio",
  "notas_aromaticas",
  "dulzor",
  "acidez",
  "taninos_cantidad",
  "taninos_calidad",
  "alcohol_percepcion",
  "cuerpo",
  "entrada",
  "evolucion_boca",
  "aromas_boca",
  "impresion_final",
  "postgusto",
  "apreciacion",
  "composicion",
  "cosecha",
  "graduacion",
  "autor",
  "fecha_creacion",
  "fecha_modificacion",
];

export function saneado(valor) {
  const texto = String(valor ?? "").trim();
  if (texto === "") {
    return "";
  }
  return /^[=+\-@]/.test(texto) ? `'${texto}` : texto;
}

const CAMPOS_LISTA = {
  composicion: (cepas) =>
    cepas
      .map(({ varietal, porcentaje }) => `${varietal}:${porcentaje}`)
      .join("; "),
  notas_aromaticas: (descriptores) => descriptores.join("; "),
};

function aCelda(columna, ficha) {
  const valor = ficha[columna];

  if (columna in CAMPOS_LISTA) {
    const lista = Array.isArray(valor) ? valor : [];
    return lista.length > 0 ? CAMPOS_LISTA[columna](lista) : "";
  }
  if (columna === "id") {
    return valor ?? "";
  }
  if (columna === "graduacion") {
    const n = Number(
      String(valor ?? "")
        .trim()
        .replace(",", "."),
    );
    return Number.isFinite(n) ? n : saneado(valor);
  }
  if (columna === "cosecha" && typeof valor === "number") {
    return valor;
  }
  return saneado(valor);
}

export function serializarFila(ficha) {
  return COLUMNAS.map((columna) => aCelda(columna, ficha));
}

function aNumeroSiEsPosible(texto) {
  if (texto === "" || texto === null || texto === undefined) {
    return "";
  }
  const n = Number(texto);
  return Number.isFinite(n) ? n : "";
}

export function parsearFila(celdas) {
  const ficha = {};
  COLUMNAS.forEach((columna, i) => {
    const celda = String(celdas[i] ?? "");
    if (columna === "composicion") {
      ficha.composicion =
        celda.trim() === ""
          ? []
          : celda.split(";").map((parte) => {
              const [varietal, porcentaje] = parte.trim().split(":");
              return {
                varietal: varietal.trim(),
                porcentaje: Number(porcentaje),
              };
            });
    } else if (columna === "notas_aromaticas") {
      ficha.notas_aromaticas =
        celda.trim() === ""
          ? []
          : celda
              .split(";")
              .map((p) => p.trim())
              .filter(Boolean);
    } else if (columna === "id" || columna === "graduacion") {
      ficha[columna] = aNumeroSiEsPosible(celda);
    } else if (columna === "cosecha") {
      const n = aNumeroSiEsPosible(celda);
      ficha[columna] = n === "" ? celda : n;
    } else {
      // Sheets devuelve el texto sin la comilla de escape; en stubs la quitamos acá.
      ficha[columna] = celda.startsWith("'") ? celda.slice(1) : celda;
    }
  });
  return ficha;
}

let ultimoId = 0;

export function generarId() {
  const ahora = Date.now();
  ultimoId = ahora > ultimoId ? ahora : ultimoId + 1;
  return ultimoId;
}
