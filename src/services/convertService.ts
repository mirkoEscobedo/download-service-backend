import { tmpdir } from "node:os";
import path from "node:path";
import ffmpeg from "fluent-ffmpeg";

export async function convertMedia(inputUrl: string, format: string) {
  return new Promise<string>((resolve, reject) => {
    const outputFilename = `${path.basename(inputUrl, path.extname(inputUrl))}.${format}`;
    const outputPath = path.join(tmpdir(), outputFilename);

    ffmpeg(inputUrl)
      .outputFormat(format)
      .on("end", () => {
        console.log(`Conversion successful: ${outputPath}`);
        resolve(outputPath);
      })
      .on("error", (error) => {
        console.error(`Error during conversion: ${error}`);
        reject(error);
      })
      .save(outputPath);
  });
}
