import { test, expect } from "@playwright/test";

// Smoke flows: the pages a customer actually moves through. Selectors lean on
// roles and nav labels (stable) rather than marketing copy (still in flux).

test("home page loads with primary navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Beercade/i);
  await expect(
    page.getByRole("link", { name: "Beercade — home" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
});

test("the Book a function CTA reaches the functions page", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Book a function" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/functions/);
});

test("machines page renders", async ({ page }) => {
  await page.goto("/machines");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("privacy page renders the policy", async ({ page }) => {
  await page.goto("/privacy");
  await expect(
    page.getByRole("heading", { name: "What we collect" }),
  ).toBeVisible();
});
