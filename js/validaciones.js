// Validaciones de guardado (RF-3, RF-4, RF-11, RF-14).
// La spec manda: obligatorios = bodega, tipo, línea, composición (≥1 cepa), cosecha y
// graduación; el resto puede quedar incompleto (RF-4). La suma de composición debe ser
// 100 exacto (RF-14) y el motivo del rechazo nombra lo que falta (RF-11, CA-2, CL-8).

const OBLIGATORIOS = [
  { clave: "bodega", etiqueta: "Bodega" },
  { clave: "tipo", etiqueta: "Tipo de vino" },
  { clave: "linea", etiqueta: "Nombre de la línea de vino" },
  { clave: "composicion", etiqueta: "Composición (al menos una cepa)" },
  { clave: "cosecha", etiqueta: "Cosecha" },
  { clave: "graduacion", etiqueta: "Graduación alcohólica" },
];

export function camposObligatorios() {
  return OBLIGATORIOS.map((c) => ({ ...c }));
}

function textoVacio(valor) {
  return String(valor ?? "").trim() === "";
}

export function aNumero(valor) {
  const texto = String(valor ?? "")
    .trim()
    .replace(",", ".");
  if (texto === "") {
    return NaN;
  }
  return Number(texto);
}

export function sumarComposicion(cepas = []) {
  return cepas.reduce((total, { porcentaje }) => {
    const n = aNumero(porcentaje);
    return Number.isFinite(n) ? total + n : total;
  }, 0);
}

export function validarFicha(ficha) {
  const faltantes = [];

  if (textoVacio(ficha.bodega)) {
    faltantes.push("bodega");
  }
  if (textoVacio(ficha.tipo)) {
    faltantes.push("tipo");
  }
  if (textoVacio(ficha.linea)) {
    faltantes.push("linea");
  }
  if (!Array.isArray(ficha.composicion) || ficha.composicion.length === 0) {
    faltantes.push("composicion");
  }
  if (textoVacio(ficha.cosecha)) {
    faltantes.push("cosecha");
  }
  if (!Number.isFinite(aNumero(ficha.graduacion))) {
    faltantes.push("graduacion");
  }

  const sumaComposicion = sumarComposicion(ficha.composicion);

  let motivo = "";
  if (faltantes.length > 0) {
    const etiquetas = OBLIGATORIOS.filter((o) =>
      faltantes.includes(o.clave),
    ).map((o) => o.etiqueta);
    motivo = `Faltan campos obligatorios: ${etiquetas.join(", ")}.`;
  } else if (sumaComposicion !== 100) {
    motivo = `La suma de la composición debe ser 100; la suma actual es ${sumaComposicion}.`;
  }

  return {
    valido: faltantes.length === 0 && sumaComposicion === 100,
    faltantes,
    sumaComposicion,
    motivo,
  };
}
