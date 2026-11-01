import { test, expect } from "@playwright/test";

test("el formulario de carga está disponible sin identificarse", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Nueva ficha" }),
  ).toBeVisible();
  await expect(page.locator("#vista-carga")).toBeVisible();
  await expect(page.locator("#vista-busqueda")).toBeHidden();
  await expect(page.getByLabel("Bodega", { exact: true })).toBeVisible();
});
