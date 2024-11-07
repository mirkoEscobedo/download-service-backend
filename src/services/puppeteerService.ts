import puppeteer from "puppeteer";

export async function fetchThreadData(url: string): Promise<any> {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    );

    await page.goto(url, { waitUntil: "networkidle2" });
    const pageContent = await page.evaluate(() => document.body.innerText);
    await browser.close();

    return JSON.parse(pageContent);
  } catch (error) {
    console.error("Error fetching threadData: ", error);
    return null;
  }
}

export async function fetchThreadMedia(mediaUrls: string[]): Promise<string[]> {
  try {
    return mediaUrls;
  } catch (error) {
    console.error("Error fetching thread media: ", error);
    return [];
  }
}
