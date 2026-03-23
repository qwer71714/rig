import { chromium, Browser, BrowserContext, Page } from 'playwright';

let browserInstance: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browserInstance;
}

export async function createPage(): Promise<{ context: BrowserContext; page: Page }> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    locale: 'ko-KR',
  });
  const page = await context.newPage();
  return { context, page };
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance && browserInstance.isConnected()) {
    await browserInstance.close();
    browserInstance = null;
  }
}

export async function autoScroll(page: Page, maxScrolls: number = 10): Promise<void> {
  await page.evaluate((max: number) => {
    return new Promise<void>((resolve) => {
      let totalHeight = 0;
      let scrollCount = 0;
      const distance = 400;
      const timer = setInterval(() => {
        scrollBy(0, distance);
        totalHeight += distance;
        scrollCount++;

        if (scrollCount >= max || totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 300);
    });
  }, maxScrolls);
}
