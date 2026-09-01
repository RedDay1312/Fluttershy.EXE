import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { join } from "node:path";

const root = "/workspace/.grok";

const browser = await chromium.launch({ args: ["--disable-web-security"] });

async function shot(file, w, h, out) {
  const page = await browser.newPage({
    viewport: { width: w, height: h },
    deviceScaleFactor: 2,
  });
  await page.goto(pathToFileURL(join(root, file)).href, { waitUntil: "networkidle" });
  await page.screenshot({ path: join(root, out), type: "png" });
  await page.close();
  console.log("wrote", out);
}

await shot("og-card.html", 1200, 630, "og-raw.png");
await shot("x-banner.html", 1200, 264, "x-banner-raw.png");
await browser.close();
