// Búsqueda sobre la caché (RF-7, RF-10): parcial, sin mayúsculas ni acentos
// (normalización en js/normalizacion.js) y mensaje exacto de la spec.

import { normalizarTexto, coincide } from "./normalizacion.js";

// Solo bodega y línea (RF-7): otros campos no participan de la búsqueda.
export function filtrarFichas(fichas, termino) {
  const buscado = normalizarTexto(termino);
  if (buscado === "") {
    // Sin término la vista limpia: no se listan 500 fichas sin pedido.
    return [];
  }
  return fichas.filter(
    (ficha) =>
      coincide(buscado, ficha.bodega) || coincide(buscado, ficha.linea),
  );
}

// RF-10 / CA-16: el mensaje es exacto y lleva el término tal cual lo escribió el usuario.
export function mensajeSinResultados(termino) {
  return `Sin resultados para ${termino.trim()}`;
}

export function conRetraso(fn, milisegundos = 300) {
  let temporizador = null;
  return (...argumentos) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn(...argumentos), milisegundos);
  };
}
