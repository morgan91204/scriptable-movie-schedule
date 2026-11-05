const { chromium, devices } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const css = fs.readFileSync('src/ui.ts', 'utf8').match(/export const CSS = `([\s\S]*?)`;/)[1];
  const files = ['01-首頁', '03-片單', '04-場次', '05-確認頁', '09-完成頁'];
  const browser = await chromium.launch();
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ ...devices['iPhone 13'], colorScheme: scheme });
    const page = await ctx.newPage();
    const imgs = [];
    for (const f of files) {
      const body = fs.readFileSync(`test/shots/${f}.html`, 'utf8');
      await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div id="root">${body}</div></body></html>`);
      const out = `test/shots/${scheme}-${f}.png`;
      await page.screenshot({ path: out, fullPage: false });
      imgs.push(out);
    }
    await ctx.close();
  }
  await browser.close();
})();
