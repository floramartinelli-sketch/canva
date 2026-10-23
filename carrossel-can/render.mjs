// Exporta os 8 cards do carrossel como PNG 1080x1350.
// Uso: node carrossel-can/render.mjs   (requer playwright)
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const outDir = join(dir, 'png');
mkdirSync(outDir, { recursive: true });

// index.html é um fragmento (formato do Artifact); embrulha com doctype para renderizar em modo padrão
const page_html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"></head><body>${readFileSync(join(dir, 'index.html'), 'utf8')}</body></html>`;
const tmp = join(dir, '.render.html');
writeFileSync(tmp, page_html);

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await page.goto(pathToFileURL(tmp).href + '#raw', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const cards = await page.$$('.card');
for (const [i, card] of cards.entries()) {
  const file = join(outDir, `card-${String(i + 1).padStart(2, '0')}.png`);
  await card.screenshot({ path: file });
  console.log(file);
}
await browser.close();
