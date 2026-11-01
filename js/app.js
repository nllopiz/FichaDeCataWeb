import { CONFIG } from "./config.js";
import { montarFormulario, leerFicha, cargarFicha } from "./formulario.js";
import { guardarFicha } from "./guardado.js";
import {
  configurarAuth,
  obtenerToken,
  obtenerCorreo,
  descartarToken,
  hayToken,
} from "./auth.js";
import { filtrarFichas, mensajeSinResultados, conRetraso } from "./busqueda.js";
import { mostrarVista, renderResultados } from "./ui.js";
import { configurarFases } from "./fases.js";
import {
  guardarBorrador,
  borrarBorrador,
  recuperarBorrador,
  CLAVE_NUEVA,
} from "./borrador.js";
import * as sheets from "./sheets.js";
import * as planilla from "./planilla.js";

const form = document.querySelector("#form-ficha");
const botonGuardar = document.querySelector("#guardar");
const estadoGuardado = document.querySelector("#estado-guardado");
const tituloCarga = document.querySelector("#titulo-carga");
const entradaBusqueda = document.querySelector("#busqueda");
const contenedorResultados = document.querySelector("#resultados-busqueda");
const estadoBusqueda = document.querySelector("#estado-busqueda");

// Estado de edición (RF-8): la ficha abierta se corrige por id, nunca se duplica.
let idEnEdicion = null;
let fechaCreacionPrevia = null;

if (form) {
  montarFormulario(form);
  configurarFases();
  // T20: la planilla FichaCataWeb se busca o crea sola desde la cuenta del dueño;
  // el ID queda en el navegador. Guardar crea si no existe; buscar solo localiza.
  sheets.configurarSheets({
    obtenerIdPlanilla: () => planilla.asegurarPlanilla({ obtenerToken }),
    buscarIdPlanilla: () =>
      planilla.asegurarPlanilla({ obtenerToken, crear: false }),
    obtenerToken,
  });

  // Navegación entre vistas.
  for (const boton of document.querySelectorAll("[data-ir]")) {
    boton.addEventListener("click", () => mostrarVista(boton.dataset.ir));
  }

  // RF-6: el avance se persiste en cada cambio (cableo fino en T12).
  form.addEventListener("input", () => {
    guardarBorrador(CLAVE_NUEVA, leerFicha(form));
  });

  function asegurarIdentificacion() {
    try {
      // RF-18: el token se pide solo con acción del usuario (guardar o buscar),
      // nunca al cargar la página (RF-17).
      configurarAuth({ clientId: CONFIG.clientIdGoogle });
    } catch {
      // GIS puede no haber cargado todavía: la operación avisa con mensaje claro.
    }
  }

  document.querySelector("#nueva-ficha").addEventListener("click", () => {
    reiniciarFormulario();
    mostrarVista("carga");
  });

  function reiniciarFormulario() {
    idEnEdicion = null;
    fechaCreacionPrevia = null;
    cargarFicha(form, {});
    borrarBorrador(CLAVE_NUEVA); // grill-me p. 1: "Nueva ficha" borra el borrador
    tituloCarga.textContent = "Nueva ficha";
    estadoGuardado.textContent = "";
  }

  // RF-8 / CA-5: abrir una ficha desde los resultados para corregirla.
  function alAbrirParaEditar(ficha) {
    idEnEdicion = ficha.id;
    fechaCreacionPrevia = ficha.fecha_creacion || null;
    cargarFicha(form, ficha);
    tituloCarga.textContent = "Editar ficha";
    estadoGuardado.textContent = "";
    mostrarVista("carga");
  }

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    // RF-5: además del flag interno, el botón queda inerte durante el guardado.
    botonGuardar.disabled = true;
    estadoGuardado.textContent = "";
    try {
      asegurarIdentificacion();
      if (!planilla.hayIdEnNavegador()) {
        // T20: la primera vez la app prepara la planilla FichaCataWeb en segundos.
        estadoGuardado.textContent = "Preparando tu planilla…";
      }
      const resultado = await guardarFicha({
        datos: leerFicha(form),
        idExistente: idEnEdicion,
        fechaCreacionPrevia,
        // T19: el autor es la cuenta elegida en el selector de Google (id_token).
        obtenerCorreo,
        obtenerToken,
        descartarToken,
        append: sheets.append,
        batchUpdate: sheets.batchUpdate,
      });
      estadoGuardado.textContent = mensajeDe(resultado);
      if (resultado.estado === "ok") {
        idEnEdicion = null;
        fechaCreacionPrevia = null;
        sheets.invalidarCache();
        // Precarga en segundo plano: la próxima búsqueda responde con caché (RNF-3).
        sheets.precargar().catch(() => {
          // Si falla, la búsqueda informa y reintenta (skill sheets-api-navegador §6).
        });
        // CA-5: la búsqueda vuelve a consultarse y muestra la versión vigente.
        mostrarVista("busqueda");
        await buscar();
      }
    } finally {
      botonGuardar.disabled = false;
    }
  });

  async function buscar() {
    const termino = entradaBusqueda.value;
    if (!termino.trim()) {
      contenedorResultados.textContent = "";
      estadoBusqueda.textContent = "";
      estadoBusqueda.classList.remove("is-empty");
      return;
    }
    estadoBusqueda.classList.remove("is-empty");
    if (!sheets.hayCache()) {
      // CL-7: ver las fichas guardadas exige identificarse; sin token no se
      // muestra contenido guardado.
      estadoBusqueda.textContent = "Cargando…";
      try {
        asegurarIdentificacion();
        if (!hayToken()) {
          const token = await obtenerToken();
          if (!token) {
            estadoBusqueda.textContent =
              "Para buscar tus fichas necesitás identificarte con tu cuenta de Google.";
            return;
          }
        }
        await sheets.precargar();
      } catch (error) {
        estadoBusqueda.textContent = error.message;
        return;
      }
    }
    const encontradas = filtrarFichas(sheets.fichas() ?? [], termino);
    if (encontradas.length === 0) {
      contenedorResultados.textContent = "";
      estadoBusqueda.textContent = mensajeSinResultados(termino);
      estadoBusqueda.classList.add("is-empty");
      return;
    }
    estadoBusqueda.textContent = "";
    estadoBusqueda.classList.remove("is-empty");
    renderResultados(contenedorResultados, encontradas, alAbrirParaEditar);
  }

  entradaBusqueda.addEventListener("input", conRetraso(buscar));

  // Restaurar borrador si existe (RF-6, CA-4): la recarga no pierde el avance.
  const borrador = recuperarBorrador(CLAVE_NUEVA);
  if (borrador) {
    cargarFicha(form, borrador);
    estadoGuardado.textContent = "Recuperamos lo que habías cargado.";
  }
}

function mensajeDe({ estado, motivo }) {
  if (estado === "ok") {
    return "Ficha guardada.";
  }
  if (estado === "invalida") {
    return motivo;
  }
  if (estado === "cancelado") {
    // RF-19: no se registra nada y lo escrito sigue en el formulario.
    return "Identificación cancelada: no se registró ninguna ficha. Podés intentar de nuevo.";
  }
  if (estado === "sin-correo") {
    // T19: sin la cuenta elegida no hay autor para la fila (CA-9); no se registra.
    return "No pudimos identificar tu cuenta de Google. Intentá de nuevo.";
  }
  if (estado === "duplicado") {
    return "";
  }
  return motivo ?? "No se pudo guardar la ficha.";
}
