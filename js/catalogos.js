// Catálogos cerrados de la spec (RF-9, RF-12, RF-13, RF-16).
// Los valores se respetan textualmente; son datos, no lógica.

export const TIPOS_VINO = [
  "Tinto",
  "Blanco",
  "Rosado",
  "Naranjo",
  "Espumante",
  "Dulce o de cosecha tardía",
  "Fortificado o generoso",
];

const ANIOS_HACIA_ATRAS = 50;

export function cosechas(anioActual) {
  const anios = [];
  for (let i = 0; i <= ANIOS_HACIA_ATRAS; i++) {
    anios.push(anioActual - i);
  }
  return [...anios, "Sin añada (NV)"];
}

export const INTENSIDAD_COLOR = ["Baja", "Media", "Alta"];

export const VIVACIDAD_BRILLO = [
  "Apagado",
  "Poco brillante",
  "Brillante",
  "Muy brillante",
];

const LIMPIEZA_BASE = ["Cristalino", "Limpio", "Velado", "Turbio"];
const LIMPIEZA_TINTOS = ["Transparente", "Translúcido", "Opaco", "Cubierto"];

export function limpiezaTransparencia(tipo) {
  return tipo === "Tinto"
    ? [...LIMPIEZA_BASE, ...LIMPIEZA_TINTOS]
    : [...LIMPIEZA_BASE];
}

export const EVOLUCION_COLOR = [
  "Joven",
  "En desarrollo",
  "Evolucionado",
  "Oxidado",
];

export const LIMPIEZA_FRANQUEZA = ["Franco", "Con defecto leve", "Defectuoso"];

export const DEFECTOS = [
  "TCA",
  "reducción",
  "acidez volátil",
  "oxidación",
  "Brett",
];

export const EXPRESION_INTENSIDAD = [
  "Baja",
  "Media-",
  "Media",
  "Media+",
  "Alta",
];

export const EQUILIBRIO = [
  "Desequilibrado",
  "Poco equilibrado",
  "Equilibrado",
  "Armónico",
];

export const DULZOR = ["seco", "semiseco", "semidulce", "dulce"];

export const ACIDEZ = ["baja", "media", "alta"];

export const TANINOS_CANTIDAD = ["bajos", "medios", "altos"];

export const TANINOS_CALIDAD = [
  "sedosos",
  "redondos",
  "firmes",
  "rugosos",
  "astringentes",
];

export const ALCOHOL_PERCEPCION = ["bajo", "medio", "alto"];

export const CUERPO = ["ligero", "medio", "pleno"];

export const ENTRADA = [
  "suave",
  "fresca",
  "ácida",
  "cálida",
  "astringente",
  "untuosa",
];

export const POSTGUSTO = ["Corto", "Medio", "Largo", "Muy largo"];

export const IMPRESION_FINAL = [
  "Defectuoso",
  "Pobre",
  "Aceptable",
  "Bueno",
  "Muy bueno",
  "Sobresaliente",
];

// RF-12: tono o matiz dependiente del tipo (y del color, para espumante: RF-16).
const TONO_BLANCO = ["limón-verdoso", "limón", "dorado", "ámbar"];
const TONO_ROSADO = ["rosa pálido", "salmón", "rosa", "frambuesa"];
const TONO_TINTO = ["púrpura", "rubí", "granate", "teja"];
const COBRE = "cobre";

export const COLOR_ESPUMANTE = ["Blanco", "Rosado"];
export const METODO_ESPUMANTE = ["tradicional", "Charmat", "ancestral"];

export function tonoPermitido(tipo, colorEspumante) {
  switch (tipo) {
    case "Blanco":
      return [...TONO_BLANCO];
    case "Rosado":
      return [...TONO_ROSADO];
    case "Tinto":
      return [...TONO_TINTO];
    case "Naranjo":
      return [...TONO_BLANCO, COBRE];
    case "Espumante":
      if (colorEspumante === "Blanco") {
        return [...TONO_BLANCO, COBRE];
      }
      if (colorEspumante === "Rosado") {
        return [...TONO_ROSADO];
      }
      return [];
    default:
      // La spec no define tono para Dulce ni Fortificado en la v1 (RF-4: opcional).
      return [];
  }
}

// RF-13: catálogo compartido de dos niveles (familia → descriptor).
const DESCRIPTORES = [
  {
    familia: "Frutales",
    descriptores: [
      "cítricos",
      "carozo",
      "tropicales",
      "frutas rojas",
      "frutas negras",
      "secas o confitadas",
    ],
  },
  {
    familia: "Florales",
    descriptores: [
      "rosa",
      "violeta",
      "azahar",
      "jazmín",
      "acacia",
      "saúco",
      "manzanilla",
    ],
  },
  {
    familia: "Vegetales y herbáceos",
    descriptores: [
      "pimiento",
      "hierba cortada",
      "menta",
      "hoja de tomate",
      "alcachofa",
      "tomillo",
      "laurel",
      "espárrago",
    ],
  },
  {
    familia: "Especiados",
    descriptores: [
      "pimienta",
      "clavo",
      "canela",
      "regaliz",
      "jengibre",
      "nuez moscada",
      "comino",
    ],
  },
  {
    familia: "Crianza (secundarios)",
    descriptores: [
      "vainilla",
      "coco",
      "tostado",
      "ahumado",
      "cacao",
      "café",
      "manteca",
    ],
  },
  {
    familia: "Terciarios",
    descriptores: [
      "cuero",
      "tabaco",
      "tierra",
      "hongos",
      "miel",
      "frutos secos",
    ],
  },
  {
    familia: "Minerales",
    descriptores: [
      "tiza",
      "piedra húmeda",
      "pizarra",
      "sílex",
      "tierra mojada",
      "grafito",
      "sal",
    ],
  },
];

export function catalogoDescriptores() {
  return DESCRIPTORES.map(({ familia, descriptores }) => ({
    familia,
    descriptores: [...descriptores],
  }));
}
