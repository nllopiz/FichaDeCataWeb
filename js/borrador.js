// Borrador del usuario en localStorage (RF-6): conserva el avance ante corte de
// conexión o fallo de guardado. Regla de la skill seguridad-gis-sheets: aquí solo
// viven datos del vino, jamás tokens ni datos de sesión.

const PREFIJO = "ficha-borrador:";
const CLAVES_SESION = new Set(["token", "accessToken"]);

export const CLAVE_NUEVA = "nueva";

export function guardarBorrador(clave, contenido) {
  try {
    const limpio = {};
    for (const [campo, valor] of Object.entries(contenido)) {
      if (!CLAVES_SESION.has(campo)) {
        limpio[campo] = valor;
      }
    }
    localStorage.setItem(PREFIJO + clave, JSON.stringify(limpio));
    return true;
  } catch {
    return false;
  }
}

export function recuperarBorrador(clave) {
  try {
    const crudo = localStorage.getItem(PREFIJO + clave);
    return crudo ? JSON.parse(crudo) : null;
  } catch {
    return null;
  }
}

export function borrarBorrador(clave) {
  try {
    localStorage.removeItem(PREFIJO + clave);
  } catch {
    // Nada que hacer: el borrador caducará por sí solo.
  }
}
