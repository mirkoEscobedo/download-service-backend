import fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
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

      return outputPath;
    } catch (error) {
      console.error(error);
      throw new Error("error while downloading");
    }
  });
  return Promise.all(downloadPromises);
}
