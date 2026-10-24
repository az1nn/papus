import { test, expect } from '@playwright/test';

test('HTML example opens, finds text, renders OpenUI and persists locally', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Explorar documento de exemplo/ }).click();
  await expect(page.locator('iframe.document-frame')).toBeVisible();
  await expect(page.locator('.reader-metric')).toHaveCount(3);
  await page.getByRole('textbox', { name: 'Pesquisar no documento' }).fill('Logs');
  await expect(page.locator('.search-result-panel')).toContainText('ocorrência(s)');
  await page.reload();
  await expect(page.locator('.sidebar-body')).toContainText('Guia de Observabilidade.html');
  await page.locator('.file-select').first().click();
  await expect(page.locator('iframe.document-frame')).toBeVisible();
});

test('unsafe OpenUI component is blocked before rendering', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Explorar documento de exemplo/ }).click();
  await page.getByRole('button', { name: /Importar OpenUI Lang/ }).click();
  await page.locator('#lang-input').fill('root = Stack([img])\nimg = Image("https://example.com/tracker.png")');
  await page.getByRole('button', { name: 'Renderizar interface' }).click();
  await expect(page.getByRole('alert')).toContainText('Componente não permitido: Image');
});

test('PWA keeps main shell available without network after installation', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) throw new Error('Service worker unsupported');
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Universal', { exact: false }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Explorar documento de exemplo/ })).toBeVisible();
});
