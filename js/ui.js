// UI de vistas y resultados (RF-7, RF-8). Regla de la skill seguridad-gis-sheets §6:
// el contenido del usuario NUNCA entra por innerHTML, solo por textContent (XSS).

const VISTAS = ["carga", "busqueda", "edicion"];

export function mostrarVista(nombre) {
  for (const vista of VISTAS) {
    const seccion = document.querySelector(`#vista-${vista}`);
    if (seccion) {
      seccion.hidden = vista !== nombre;
    }
  }
}

export function renderResultados(contenedor, fichas, alAbrir) {
  contenedor.textContent = "";
  const lista = document.createElement("ul");
  lista.className = "list-group";
  for (const ficha of fichas) {
    const item = document.createElement("li");
    item.className = "list-group-item p-0";
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className =
      "list-group-item-action btn btn-link text-start text-decoration-none";
    const cosecha = ficha.cosecha ? ` · ${ficha.cosecha}` : "";
    boton.textContent = `${ficha.bodega || "Sin bodega"} — ${ficha.linea || "Sin línea"}${cosecha}`;
    boton.addEventListener("click", () => alAbrir(ficha));
    item.append(boton);
    lista.append(item);
  }
  contenedor.append(lista);
}
