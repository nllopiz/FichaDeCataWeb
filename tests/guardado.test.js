// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

const AUTOR = "dueno@ejemplo.test";

const datosValidos = () => ({
  bodega: "Bodega Ejemplo",
  linea: "Línea Prueba Malbec",
  tipo: "Tinto",
  composicion: [{ varietal: "Malbec", porcentaje: "100" }],
  cosecha: "2022",
  graduacion: "13.5",
});

function doblesPropios(overrides = {}) {
  return {
    obtenerToken: vi.fn(async () => "TOKEN_FALSO"),
    // T19: el autor viene de la cuenta elegida (id_token), no de la config.
    obtenerCorreo: vi.fn(() => AUTOR),
    descartarToken: vi.fn(),
    append: vi.fn(async () => {}),
    batchUpdate: vi.fn(async () => {}),
    ...overrides,
  };
}

async function nuevoGuardado(overrides = {}) {
  const modulo = await import("../js/guardado.js");
  return { modulo, deps: doblesPropios(overrides) };
}

function conGuardado(g, extra = {}) {
  return g.modulo.guardarFicha({
    datos: datosValidos(),
    generar: () => 1728000000000,
    ahora: () => new Date("2026-10-11T22:00:00Z"), // 19:00 en Buenos Aires
    ...g.deps,
    ...extra,
  });
}

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

describe("esDobleToque (RF-5, CA-3)", () => {
  it("dos toques dentro de los 2 s son doble toque", async () => {
    const { modulo } = await nuevoGuardado();
    expect(modulo.esDobleToque(1000, 1500)).toBe(true);
    expect(modulo.esDobleToque(1000, 2999)).toBe(true);
  });

  it("a los 2 s o más ya no lo es", async () => {
    const { modulo } = await nuevoGuardado();
    expect(modulo.esDobleToque(1000, 3000)).toBe(false);
    expect(modulo.esDobleToque(1000, 9000)).toBe(false);
  });
});

describe("fechaHoraBuenosAires (RNF-2, fechas dd/mm/aaaa 24 h)", () => {
  it("formatea en la zona horaria del proyecto", async () => {
    const { modulo } = await nuevoGuardado();
    expect(modulo.fechaHoraBuenosAires(new Date("2026-10-11T22:00:00Z"))).toBe(
      "11/10/2026 19:00",
    );
  });

  it("cruza la medianoche correctamente y usa 24 h", async () => {
    const { modulo } = await nuevoGuardado();
    expect(modulo.fechaHoraBuenosAires(new Date("2026-10-12T02:30:00Z"))).toBe(
      "11/10/2026 23:30",
    );
    expect(modulo.fechaHoraBuenosAires(new Date("2026-10-12T03:05:00Z"))).toBe(
      "12/10/2026 00:05",
    );
  });
});

describe("guardarFicha: registro completo (RF-2, RNF-2)", () => {
  it("registrando una ficha nueva agrega UNA fila con id, autor y auditoría (CA-9)", async () => {
    const g = await nuevoGuardado();

    const resultado = await conGuardado(g);

    expect(resultado.estado).toBe("ok");
    expect(g.deps.append).toHaveBeenCalledOnce();
    expect(g.deps.batchUpdate).not.toHaveBeenCalled();

    const celdas = g.deps.append.mock.calls[0][0];
    expect(celdas[0]).toBe(1728000000000);
    expect(typeof celdas[0]).toBe("number");
    expect(celdas).toContain(AUTOR);
    expect(celdas).toContain("11/10/2026 19:00");
  });

  it("si la identificación no está pedida, la pide al guardar (RF-18)", async () => {
    const g = await nuevoGuardado();

    await conGuardado(g);

    expect(g.deps.obtenerToken).toHaveBeenCalledOnce();
  });

  it("con obligatorios completos y el resto vacío también registra (RF-4)", async () => {
    const g = await nuevoGuardado();

    const resultado = await conGuardado(g);

    expect(resultado.estado).toBe("ok");
  });
});

describe("guardarFicha: rechazos (RF-11, RF-19)", () => {
  it("faltan obligatorios → estado 'invalida', sin registrar y con el motivo (CA-2)", async () => {
    const g = await nuevoGuardado();

    const resultado = await conGuardado(g, {
      datos: { ...datosValidos(), bodega: "" },
    });

    expect(resultado.estado).toBe("invalida");
    expect(resultado.faltantes).toEqual(["bodega"]);
    expect(resultado.motivo).toContain("Bodega");
    expect(g.deps.append).not.toHaveBeenCalled();
  });

  it("suma de composición distinta de 100 → 'invalida' informando la suma (CA-13)", async () => {
    const g = await nuevoGuardado();

    const resultado = await conGuardado(g, {
      datos: {
        ...datosValidos(),
        composicion: [
          { varietal: "Malbec", porcentaje: "75" },
          { varietal: "Cabernet", porcentaje: "20" },
        ],
      },
    });

    expect(resultado.estado).toBe("invalida");
    expect(resultado.motivo).toContain("95");
    expect(g.deps.append).not.toHaveBeenCalled();
  });

  it("cancelar la identificación no registra nada (RF-19, CA-21)", async () => {
    const g = await nuevoGuardado({ obtenerToken: vi.fn(async () => null) });

    const resultado = await conGuardado(g);

    expect(resultado.estado).toBe("cancelado");
    expect(g.deps.append).not.toHaveBeenCalled();
    expect(g.deps.batchUpdate).not.toHaveBeenCalled();
  });

  it("con identificación pero sin correo de la cuenta → 'sin-correo' y no registra (T19)", async () => {
    const g = await nuevoGuardado({ obtenerCorreo: vi.fn(() => null) });

    const resultado = await conGuardado(g);

    expect(resultado.estado).toBe("sin-correo");
    expect(g.deps.append).not.toHaveBeenCalled();
    expect(g.deps.batchUpdate).not.toHaveBeenCalled();
  });

  it("tras el reintento de 401, si la re-identificación no da correo tampoco registra (T19)", async () => {
    const vencido = Object.assign(new Error("Tu identificación venció."), {
      codigo: "no-autenticado",
    });
    let primero = true;
    const append = vi.fn(async () => {
      if (primero) {
        primero = false;
        throw vencido;
      }
    });
    const obtenerCorreo = vi
      .fn()
      .mockReturnValueOnce(AUTOR)
      .mockReturnValueOnce(null);
    const g = await nuevoGuardado({ append, obtenerCorreo });

    const resultado = await conGuardado(g);

    expect(resultado.estado).toBe("sin-correo");
    expect(append).toHaveBeenCalledOnce();
  });
});

describe("guardarFicha: doble toque (RF-5, CA-3)", () => {
  it("el segundo toque mientras se registra no produce otra fila", async () => {
    let resolverAppend;
    const g = await nuevoGuardado({
      append: vi.fn(
        () => new Promise((resolver) => (resolverAppend = resolver)),
      ),
    });

    const primera = conGuardado(g);
    const segunda = conGuardado(g);

    await expect(segunda).resolves.toMatchObject({ estado: "duplicado" });
    resolverAppend();
    await expect(primera).resolves.toMatchObject({ estado: "ok" });
    expect(g.deps.append).toHaveBeenCalledOnce();
  });

  it("tras un guardado completo, el siguiente toque vuelve a poder registrar", async () => {
    const g = await nuevoGuardado();

    await conGuardado(g);
    const segunda = await conGuardado(g);

    expect(segunda.estado).toBe("ok");
    expect(g.deps.append).toHaveBeenCalledTimes(2);
  });
});

describe("guardarFicha: edición conserva una única ficha (RF-8, CA-5)", () => {
  it("con id existente usa batchUpdate por id y no agrega filas", async () => {
    const g = await nuevoGuardado();

    const resultado = await conGuardado(g, { idExistente: 1728000000000 });

    expect(resultado.estado).toBe("ok");
    expect(g.deps.batchUpdate).toHaveBeenCalledOnce();
    expect(g.deps.batchUpdate.mock.calls[0][0]).toBe(1728000000000);
    expect(g.deps.append).not.toHaveBeenCalled();
  });

  it("la fecha de creación se conserva y la de modificación se actualiza (RNF-2)", async () => {
    const g = await nuevoGuardado();

    await conGuardado(g, {
      idExistente: 1728000000000,
      fechaCreacionPrevia: "01/10/2026 10:00",
    });

    const celdas = g.deps.batchUpdate.mock.calls[0][1];
    expect(celdas).toContain("01/10/2026 10:00");
    expect(celdas).toContain("11/10/2026 19:00");
  });
});

describe("guardarFicha: borrador solo se borra en éxito (RF-6)", () => {
  it("al registrar con éxito se borra el borrador de la ficha nueva", async () => {
    const g = await nuevoGuardado();
    const { guardarBorrador, recuperarBorrador, CLAVE_NUEVA } =
      await import("../js/borrador.js");
    guardarBorrador(CLAVE_NUEVA, { bodega: "Bodega Ejemplo" });

    await conGuardado(g);

    expect(recuperarBorrador(CLAVE_NUEVA)).toBeNull();
  });

  it("si el registro falla, el borrador se conserva (skill sheets-api-navegador §6)", async () => {
    const error = Object.assign(new Error("No tenés acceso a esta planilla."), {
      codigo: "sin-acceso",
    });
    const g = await nuevoGuardado({
      append: vi.fn(async () => {
        throw error;
      }),
    });
    const { guardarBorrador, recuperarBorrador, CLAVE_NUEVA } =
      await import("../js/borrador.js");
    guardarBorrador(CLAVE_NUEVA, { bodega: "Bodega Ejemplo" });

    const resultado = await conGuardado(g);

    expect(resultado.estado).toBe("error");
    expect(resultado.codigo).toBe("sin-acceso");
    expect(resultado.motivo).toBe("No tenés acceso a esta planilla.");
    expect(recuperarBorrador(CLAVE_NUEVA)).toEqual({
      bodega: "Bodega Ejemplo",
    });
  });
});

describe("guardarFicha: 401 reintenta una vez con identificación nueva", () => {
  it("token vencido → descarta, re-identifica y reintenta una vez (skill §6)", async () => {
    const vencido = Object.assign(new Error("Tu identificación venció."), {
      codigo: "no-autenticado",
    });
    let primero = true;
    const append = vi.fn(async () => {
      if (primero) {
        primero = false;
        throw vencido;
      }
    });
    const obtenerToken = vi.fn(async () => "TOKEN_NUEVO");
    const g = await nuevoGuardado({ append, obtenerToken });

    const resultado = await conGuardado(g);

    expect(resultado.estado).toBe("ok");
    expect(g.deps.descartarToken).toHaveBeenCalledOnce();
    expect(obtenerToken).toHaveBeenCalledTimes(2);
    expect(append).toHaveBeenCalledTimes(2);
  });
});
