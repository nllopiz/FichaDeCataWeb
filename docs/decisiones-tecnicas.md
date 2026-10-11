# Decisiones técnicas (Etapa 3)

Fecha de inicio: 2026-10-11
Spec de referencia: specs/001-mvp/spec.md

## Deducciones de la spec (a confirmar con el Solicitante)

- **Identidad / login**: SÍ. RNF-1 exige que solo el propietario identificado vea y
  edite; CL-7 pide pedir identificación. El mecanismo no está decidido (P-6 propuso
  cuenta Gmail; se evalúa acá).
- **Datos persistentes**: SÍ. RF-2 guarda fichas; RF-7 las busca después; RF-8 las
  edita. No es un sitio de solo lectura.
- **Datos no públicos**: SÍ. Las fichas son privadas (RNF-1), aunque el contenido es
  de vinos + apreciación personal del propio usuario, sin datos de terceros (RNF-7).
  Categoría de datos: "datos privados del usuario, sin datos sensibles de personas".
- **Integraciones**: NINGUNA en la v1 (el PDF quedó fuera).
- **Volumen esperado**: bajo. Etapa 1: 4-5 fichas quincenales durante el curso, luego
  mensual/bimestral; decenas hoy, cien o poco más a largo plazo. RNF-3 fija la
  referencia de rendimiento en 500 fichas.
- **Dispositivos**: teléfono y computadora (RNF-6); accesibilidad WCAG 2.1 AA (RNF-5).
- **Verificación obligatoria**: la spec exige login/zona privada y formularios que
  guardan datos → queda descartado un sitio estático con datos en archivos.

## Decisiones de stack

- **Identidad (2026-10-11, decisión del Solicitante)**: cuenta de Google, identificándose
  al guardar (RF-18). Justificación: es la cuenta que ya usa; sin registro propio que
  mantener. Alternativas descartadas: sin identificación (el cliente la descartó tras
  elegirla inicialmente), login con usuario y contraseña propio (más fricción y manejo
  de credenciales).
- **Avance ante corte de conexión (input del Solicitante, mecanismo)**: localStorage del
  navegador. La spec (RF-6) conserva el "qué"; el "cómo" queda registrado acá para el
  plan.

- **Almacenamiento (2026-10-11, decisión del Solicitante)**: las fichas se guardan en
  un **Google Sheets** de su cuenta, en estructura de **una fila por ficha**, con los
  campos de valores múltiples (aromas, cepas) en su celda separados por punto y coma.
  Justificación: el Solicitante quiere ver y leer sus fichas como filas de una planilla
  desde el celular o la compu. Alternativas descartadas: base de datos tradicional con
  exportación a planilla (no cumpliría el "verlas en planilla" de forma nativa); una
  fila por cepa (una ficha ocuparía varias filas y rompería la lectura).

- **Respaldo (2026-10-11, decisión del Solicitante)**: alcanza con la copia que Google
  mantiene en el Drive de su cuenta; no se pide respaldo periódico adicional.

- **Despliegue (2026-10-11, decisión del Solicitante)**: el propio Solicitante publicará
  la app siguiendo una guía paso a paso preparada por el agente (quedó descartada la
  figura de un tercero técnico). Consecuencia para el stack: la opción elegida debe ser
  publicable por una persona no técnica con instrucciones claras.

- **Conocimientos del Solicitante (2026-10-11)**: tiene conocimientos de programación;
  puede mantener el proyecto y seguir una guía de despliegue con comandos.

- **Perfil técnico del Solicitante (2026-10-11)**: HTML, CSS con Bootstrap y JavaScript
  puro. No menciona backend ni bases de datos → el stack debe apoyarse en lo que puede
  mantener: frontend con Bootstrap y JavaScript, y backend simple en JavaScript.

- **Zona horaria y formatos (2026-10-11, confirmado con el Solicitante)**: zona horaria
  America/Argentina/Buenos_Aires; fechas en formato día/mes/año; hora en formato 24
  horas; interfaz en español.
- **Lenguaje y framework (decisión del Solicitante, 2026-10-11)**: **HTML + CSS +
  Bootstrap + JavaScript puro, sin backend propio**. Justificación: es su perfil y la
  app se resuelve con la API de Google Sheets llamada desde el navegador. Alternativas
  descartadas: Node.js + Express con servidor propio (explicado con sus pros y contras;
  el Solicitante eligió solo frontend y asumió el matiz del token en el navegador),
  React/Vue (complejidad innecesaria), Python/Django o PHP/Laravel (fuera de su perfil).
- **Base de datos (decisión)**: **Google Sheets vía API v4 REST, llamada desde el
  navegador** con el token del usuario; estructura ya decidida (una fila por ficha,
  campos múltiples separados por ";"). Solo la cuenta del Solicitante tiene acceso a la
  hoja; la API rechaza a quien no presente un token válido.
- **Autenticación (decisión)**: **Google Identity Services (OAuth 2.0 para
  JavaScript)**, solicitado al guardar (RF-18); el token de acceso vive **solo en
  memoria del navegador** (no se persiste en localStorage ni en el código) y con
  alcance mínimo (acceso a hojas de cálculo). El client ID es público por diseño; no
  hay secretos en el frontend ni en el repositorio. Verificación obligatoria de la
  etapa: la spec exige login/zona privada y guardado → el caso descartado es "sitio
  estático con datos en archivos publicados"; acá los datos NO se publican con el sitio
  y el acceso lo valida Google del lado de sus servidores. Aprobación explícita del
  Responsable técnico requerida y registrada en MEMORY.md.
  Caveat operativo: en modo "Probando", Google caduca la autorización cada 7 días
  (re-autorización con un clic); queda documentado en la guía de uso.
- **Entornos y despliegue (decisión)**: desarrollo local con servidor estático; producción
  en **hosting estático gratuito (GitHub Pages, Netlify o Vercel)**, publicado por el
  Solicitante siguiendo la guía. El plan elige uno de los tres y justifica la elección.
- **Pruebas y lint (decisión)**: **Vitest** para lógica pura (validaciones RF-3/RF-14,
  catálogos RF-9/12/13, doble guardado RF-5, gana el último RF-15), **Playwright** para
  E2E del flujo principal (carga → login simulado → guardar → buscar; RNF-6, CA-7),
  **ESLint + Prettier**. Sin backend no hay Supertest.
- **Riesgos identificados (a verificar en implementación)**: (a) latencia de la API de
  Sheets con ~500 filas → caché de la hoja en memoria de la página y verificación con
  CA-10; (b) caducidad de la autorización OAuth cada 7 días en modo "Probando" →
  documentado en la guía; (c) token en el navegador → mitigado guardándolo solo en
  memoria y sin secretos en el código.

## Input del Solicitante (2026-10-11) — nuevo flujo de identificación

- El usuario quiere entrar directo al **formulario de carga de la ficha**, sin login previo.
- El **login con su cuenta de Google ocurre al momento de guardar**.
- Si no guarda (no inicia sesión / no quiere guardar), **pierde los datos cargados**.
- → Cambio de requisito pendiente de plasmar en la spec (flujo de RNF-1, CL-7, RF-6).

## Preguntas de la entrevista técnica

(pendientes, de a una)
