import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test.beforeEach(({}, testInfo) => {
    if (!process.env.PLAYWRIGHT_BASE_URL) {
      testInfo.skip(true, "Defina PLAYWRIGHT_BASE_URL (ex.: http://localhost:3002) com web-jogador a correr.");
    }
  });

  test("jogador — página inicial responde", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Peladas/i);
  });
});
