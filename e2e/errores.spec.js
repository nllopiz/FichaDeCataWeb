import { test, expect } from "@playwright/test";

// La validación ocurre antes de identificarse y de llamar a Sheets: este E2E no
// necesita dobles de GIS ni de la planilla (nunca toca datos reales).
async function prepararPagina(page) {
  await page.route("https://accounts.google.com/**", (ruta) => ruta.abort());
  await page.goto("/");
}

async function completarSinComposicion(page) {
  await page.getByLabel("Bodega", { exact: true }).fill("Bodega Ejemplo");
  await page.getByLabel("Tipo de vino").selectOption("Tinto");
  await page
    .getByLabel("Nombre de la línea de vino")
    .fill("Línea Prueba Malbec");
  await page.getByLabel("Cosecha").selectOption("2022");
  await page.getByLabel("Graduación alcohólica").fill("13.5");
}

test("RF-11/CA-2: el rechazo marca cada campo, muestra el resumen y enfoca el primero", async ({
  page,
}) => {
  await prepararPagina(page);

  await page.getByRole("button", { name: "Guardar" }).click();

  await expect(page.locator("#estado-guardado")).toContainText(
    "Faltan campos obligatorios",
  );
  for (const id of [
    "bodega",
    "tipo",
    "linea",
    "composicion",
    "cosecha",
    "graduacion",
  ]) {
    await expect(page.locator(`#${id}`)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page.locator(`#error-${id}`)).toBeVisible();
  }
  await expect(page.locator("#error-bodega")).toHaveText("Completá la bodega.");
  await expect(page.locator("#error-composicion")).toContainText(
    "Agregá al menos una cepa",
  );
  expect(await page.evaluate(() => document.activeElement.id)).toBe("bodega");

  // Al corregir un campo se limpia solo su error.
  await page.getByLabel("Bodega", { exact: true }).fill("Bodega Ejemplo");
  await expect(page.locator("#error-bodega")).toHaveCount(0);
  await expect(page.locator("#bodega")).not.toHaveAttribute(
    "aria-invalid",
    "true",
  );
});

test("CA-2: si solo falta la composición, el foco va a agregar una cepa", async ({
  page,
}) => {
  await prepararPagina(page);
  await completarSinComposicion(page);

  await page.getByRole("button", { name: "Guardar" }).click();

  await expect(page.locator("#composicion")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.locator("#error-composicion")).toContainText(
    "Agregá al menos una cepa",
  );
  expect(await page.evaluate(() => document.activeElement.id)).toBe(
    "agregar-cepa",
  );
});

test("RF-11: una composición que suma 95 marca la composición y enfoca el porcentaje", async ({
  page,
}) => {
  await prepararPagina(page);
  await completarSinComposicion(page);
  await page.getByLabel("Varietal").first().fill("Malbec");
  await page.getByLabel("Porcentaje").first().fill("95");

  await page.getByRole("button", { name: "Guardar" }).click();

  await expect(page.locator("#estado-guardado")).toContainText(
    "la suma actual es 95",
  );
  await expect(page.locator("#composicion")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.locator("#error-composicion")).toContainText("95");
  expect(
    await page.evaluate(() =>
      document.activeElement.classList.contains("porcentaje"),
    ),
  ).toBe(true);
});
