import puppeteer from "puppeteer";

export async function fetchThumbnails(thumbnailUrls: string[]): Promise<(Buffer | null)[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  );

  const thumbnails: (Buffer | null)[] = [];

  try {
    for (let i = 0; i < thumbnailUrls.length; i++) {
      const thumbnailUrl: string = thumbnailUrls[i];
      try {
        await page.goto(thumbnailUrl, { waitUntil: "networkidle2" });
        const imageBuffer = await page.screenshot({ type: "jpeg" });

        if (imageBuffer instanceof Uint8Array) {
          thumbnails.push(Buffer.from(imageBuffer));
        } else {
          thumbnails.push(null);
        }
      } catch (error) {
        console.error(`Failed to fetch thumbnail for ${thumbnailUrl}`, error);
        thumbnails.push(null);
      }
    }
  } catch (error) {
    console.error("Error processing thumbnails: ", error);
  } finally {
    await browser.close();
  }

  return thumbnails;
}
