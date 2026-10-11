// Normalización de texto para búsqueda (RF-7): sin mayúsculas ni acentos.
// La spec exige coincidencia parcial distinguiendo solo el texto (CA-19).

export function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function coincide(buscado, valor) {
  if (!buscado) {
    return false;
  }
  return normalizarTexto(valor).includes(normalizarTexto(buscado));
}
