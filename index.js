const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const os = require('os');

puppeteer.use(StealthPlugin());

const app = express();
const port = process.env.PORT || 3000;

// Detect if running on Render.com
const isRender = !!process.env.RENDER;

// Path to Chromium (used only on Render)
const CHROME_PATH = isRender
  ? '/opt/render/.cache/puppeteer/chrome/linux-138.0.7204.168/chrome-linux64/chrome'
  : undefined;

async function launchBrowser() {
  return await puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-quic',
    ],
  });
}

app.get('/', (req, res) => {
  res.send('Welcome to the Screenshot API! Use /screenshot?url=https://example.com');
});

app.get('/screenshot', async (req, res) => {
  let { url } = req.query;

  if (!url) {
    return res.status(400).send('Missing ?url= parameter');
  }

  // Auto prepend http:// if missing
  if (!/^https?:\/\//i.test(url)) {
    url = `http://${url}`;
  }

  try {
    const browser = await launchBrowser();
    const page = await browser.newPage();

    // Optional: spoof user agent and headers
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const screenshot = await page.screenshot({ fullPage: true });
    await browser.close();

    res.set('Content-Type', 'image/png');
    res.send(screenshot);
  } catch (err) {
    console.error('Screenshot Error:', err);
    res.status(500).send('Failed to capture screenshot');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
