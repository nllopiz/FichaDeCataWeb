// Dobles de GIS compartidos por los specs E2E (T19): Google devuelve, junto al
// access_token, un id_token ficticio con el correo de la cuenta "del dueño" —
// así la columna `autor` (CA-9) se estampa con la cuenta elegida en el selector.
// Datos ficticios obligatorios (skill datos-sensibles).

function idTokenDe(correo) {
  const payload = Buffer.from(JSON.stringify({ email: correo })).toString(
    "base64url",
  );
  return `cabecera-ficticia.${payload}.firma-ficticia`;
}

export const ID_TOKEN_E2E = idTokenDe("dueno@ejemplo.test");
export const ID_TOKEN_INTRUSO = idTokenDe("intruso@ejemplo.test");
