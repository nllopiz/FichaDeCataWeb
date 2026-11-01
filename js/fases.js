// Navegación por las fases de la cata: riel vertical en escritorio y tira
// horizontal en móvil. El estado activo se calcula por scroll y se fija al
// hacer clic para que el enlace no “salte” a otra fase durante el desplazamiento.

const FASES = [
  { id: "seccion-datos", nombre: "Datos del vino" },
  { id: "seccion-vista", nombre: "Vista" },
  { id: "seccion-nariz", nombre: "Nariz" },
  { id: "seccion-boca", nombre: "Boca" },
  { id: "seccion-cierre", nombre: "Cierre" },
];

export function configurarFases() {
  const fasesEscritorio = [...document.querySelectorAll(".rail .phase")];
  const enlacesEscritorio = [...document.querySelectorAll(".rail .phase-link")];
  const fasesMoviles = [...document.querySelectorAll(".mobile-phase")];
  const nombreFase = document.querySelector(".mobile-phase-name");

  if (fasesEscritorio.length === 0 && fasesMoviles.length === 0) {
    return;
  }

  let fijadaHasta = 0;
  let cuadro = 0;

  function activar(id) {
    for (const fase of fasesEscritorio) {
      fase.classList.toggle("is-active", fase.dataset.fase === id);
    }
    for (const enlace of enlacesEscritorio) {
      if (enlace.getAttribute("href") === `#${id}`) {
        enlace.setAttribute("aria-current", "step");
      } else {
        enlace.removeAttribute("aria-current");
      }
    }
    for (const fase of fasesMoviles) {
      const activa = fase.getAttribute("href") === `#${id}`;
      fase.classList.toggle("is-active", activa);
      if (activa) {
        fase.setAttribute("aria-current", "step");
      } else {
        fase.removeAttribute("aria-current");
      }
    }
    if (nombreFase) {
      nombreFase.textContent =
        FASES.find((fase) => fase.id === id)?.nombre ?? FASES[0].nombre;
    }
  }

  function actualizar() {
    cuadro = 0;
    const vistaCarga = document.querySelector("#vista-carga");
    if (vistaCarga?.hidden) {
      return;
    }
    if (performance.now() < fijadaHasta) {
      return;
    }

    let activa = FASES[0].id;
    for (const fase of FASES) {
      const seccion = document.querySelector(`#${fase.id}`);
      if (seccion && seccion.getBoundingClientRect().top <= 140) {
        activa = fase.id;
      }
    }

    // Al llegar al final, la última fase es la que corresponde aunque su
    // sección no pueda subir hasta el umbral por falta de contenido debajo.
    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4
    ) {
      activa = FASES[FASES.length - 1].id;
    }

    activar(activa);
  }

  function alDesplazar() {
    if (cuadro !== 0) {
      return;
    }
    cuadro = window.requestAnimationFrame(actualizar);
  }

  for (const enlace of [...enlacesEscritorio, ...fasesMoviles]) {
    enlace.addEventListener("click", () => {
      const id = enlace.getAttribute("href").slice(1);
      fijadaHasta = performance.now() + 700;
      activar(id);
    });
  }

  document.addEventListener("ficha:vista", (evento) => {
    if (evento.detail?.nombre === "carga") {
      fijadaHasta = 0;
      window.requestAnimationFrame(actualizar);
    }
  });

  window.addEventListener("scroll", alDesplazar, { passive: true });
  window.addEventListener("resize", alDesplazar);
  actualizar();
}
