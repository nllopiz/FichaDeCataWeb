import { describe, it, expect, vi, afterEach } from "vitest";
import {
  filtrarFichas,
  mensajeSinResultados,
  conRetraso,
} from "../js/busqueda.js";

const fichas = () => [
  {
    id: 1,
    bodega: "Bodega Ejemplo",
    linea: "Línea Prueba Malbec",
    apreciacion: "",
  },
  {
    id: 2,
    bodega: "Bodega Distinta Test",
    linea: "Etiqueta Cabernet",
    apreciacion: "",
  },
  {
    id: 3,
    bodega: "Viña Acentuada",
    linea: "Crianza Reserva",
    apreciacion: "nota",
  },
];

describe("filtrarFichas (RF-7)", () => {
  it("CA-19: 'ejemp' encuentra 'Bodega Ejemplo' y 'prueba' encuentra la línea", () => {
    expect(filtrarFichas(fichas(), "ejemp").map((f) => f.id)).toEqual([1]);
    expect(filtrarFichas(fichas(), "prueba").map((f) => f.id)).toEqual([1]);
  });

  it("busca también por línea y en cualquier posición", () => {
    expect(filtrarFichas(fichas(), "cabernet").map((f) => f.id)).toEqual([2]);
    expect(filtrarFichas(fichas(), "reserva").map((f) => f.id)).toEqual([3]);
  });

  it("sin distinguir mayúsculas ni acentos", () => {
    expect(filtrarFichas(fichas(), "EJEMP").map((f) => f.id)).toEqual([1]);
    expect(filtrarFichas(fichas(), "VINA").map((f) => f.id)).toEqual([3]); // ñ → n
  });

  it("no busca en otros campos (solo bodega y línea)", () => {
    expect(filtrarFichas(fichas(), "nota")).toEqual([]);
  });

  it("el término vacío no lista nada (la vista limpia los resultados)", () => {
    expect(filtrarFichas(fichas(), "   ")).toEqual([]);
  });

  it("coincidencias parciales devuelven todas las fichas que coinciden", () => {
    const repetidas = [
      ...fichas(),
      {
        id: 4,
        bodega: "Otra Bodega Ejemplo",
        linea: "Solo Línea",
        apreciacion: "",
      },
    ];
    expect(filtrarFichas(repetidas, "ejemplo").map((f) => f.id)).toEqual([
      1, 4,
    ]);
  });
});

describe("mensajeSinResultados (RF-10, CA-16: texto exacto)", () => {
  it("produce el mensaje exacto de la spec con el término tal cual", () => {
    expect(mensajeSinResultados("zzz")).toBe("Sin resultados para zzz");
    expect(mensajeSinResultados("  Malbec Soltero  ")).toBe(
      "Sin resultados para Malbec Soltero",
    );
  });
});

describe("conRetraso (debounce)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("dispara una sola vez aunque lleguen varios toques seguidos", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const conDebounce = conRetraso(fn, 300);

    conDebounce("a");
    conDebounce("ab");
    conDebounce("abc");
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("pasa el último argumento", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const conDebounce = conRetraso(fn, 100);

    conDebounce("viejo");
    vi.advanceTimersByTime(50);
    conDebounce("nuevo");
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith("nuevo");
  });
});
