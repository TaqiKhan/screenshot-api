const express = require("express");
const puppeteer = require("puppeteer");
const app = express();

app.use(express.json());

app.post("/screenshot", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send("Missing URL");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const screenshot = await page.screenshot({ fullPage: true });
  await browser.close();

  res.set("Content-Type", "image/png");
  res.send(screenshot);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
