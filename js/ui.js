// UI de vistas y resultados (RF-7, RF-8). Regla de la skill seguridad-gis-sheets §6:
// el contenido del usuario NUNCA entra por innerHTML, solo por textContent (XSS).

const VISTAS = ["carga", "busqueda", "edicion"];

export function mostrarVista(nombre) {
  let vistaNueva = null;
  for (const vista of VISTAS) {
    const seccion = document.querySelector(`#vista-${vista}`);
    if (seccion) {
      seccion.hidden = vista !== nombre;
      if (vista === nombre) {
        vistaNueva = seccion;
      }
    }
  }

  // La pestaña activa y la tira de fases solo acompañan la vista de carga.
  for (const boton of document.querySelectorAll("[data-ir]")) {
    const activo = boton.dataset.ir === nombre;
    boton.classList.toggle("is-active", activo);
    if (activo) {
      boton.setAttribute("aria-current", "page");
    } else {
      boton.removeAttribute("aria-current");
    }
  }
  const fasesMoviles = document.querySelector("#fases-movil");
  if (fasesMoviles) {
    fasesMoviles.hidden = nombre !== "carga";
  }

  // WCAG 2.4.3: el foco pasa al título de la vista nueva, para que el lector
  // de pantalla anuncie el cambio y el Tab siga un orden lógico.
  const titulo = vistaNueva?.querySelector("h1, h2");
  if (titulo) {
    if (!titulo.hasAttribute("tabindex")) {
      titulo.setAttribute("tabindex", "-1");
    }
    titulo.focus();
  }

  // Las fases se recalculan cuando se vuelve a la vista de carga.
  document.dispatchEvent(
    new CustomEvent("ficha:vista", { detail: { nombre } }),
  );
}

export function renderResultados(contenedor, fichas, alAbrir) {
  contenedor.textContent = "";
  const lista = document.createElement("ul");
  lista.className = "results";

  for (const ficha of fichas) {
    const item = document.createElement("li");
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "result";

    const cosecha = document.createElement("span");
    cosecha.className = "vintage";
    cosecha.textContent = ficha.cosecha || "—";

    const principal = document.createElement("span");
    principal.className = "result-main";
    const bodega = document.createElement("strong");
    bodega.textContent = ficha.bodega || "Sin bodega";
    const linea = document.createElement("span");
    linea.textContent = ficha.linea || "Sin línea";
    principal.append(bodega, linea);

    const meta = document.createElement("span");
    meta.className = "result-meta";
    const tipo = document.createElement("span");
    tipo.className = "pill";
    tipo.textContent = ficha.tipo || "Sin tipo";
    const accion = document.createElement("span");
    accion.className = "result-action";
    accion.textContent = "Abrir ficha";
    meta.append(tipo, accion);

    boton.append(cosecha, principal, meta);
    boton.addEventListener("click", () => alAbrir(ficha));
    item.append(boton);
    lista.append(item);
  }

  contenedor.append(lista);
}
