import fs from "node:fs";
import { tmpdir } from "node:os";
import path, { resolve } from "node:path";
import axios from "axios";

export async function downloadMediaFiles(mediaUrls: string[]): Promise<string[]> {
  console.log("starting download", mediaUrls);
  const downloadPromises = mediaUrls.map(async (url, index) => {
    const fileExtension = path.extname(url);
    const fileName = `media_${Date.now()}_${index}${fileExtension}`;
    console.log("setting up files in a temp path", fileName);
    const outputPath = path.join(tmpdir(), fileName);

    try {
      const response = await axios.get(url, { responseType: "stream" });
      await new Promise<void>((resolve, reject) => {
        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);
        writer.on("finish", () => {
          console.log(`Download complete: ${fileName}`);
          resolve();
        });
        writer.on("error", (err) => {
          console.error(`Error writing the file ${fileName}`, err);
          reject(err);
        });
      });
      delay(2000);
      return outputPath;
    } catch (error) {
      console.error(error);
      throw new Error("error while downloading");
    }
  });
  return Promise.all(downloadPromises);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
