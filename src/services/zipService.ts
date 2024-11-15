import fs from "node:fs";
import path from "node:path";
import archiver from "archiver";

export async function createZipFromFiles(filePaths: string[], outputFilePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(`${archive.pointer()} total bytes`);
      console.log("Zip archive created successfully.");
      resolve(outputFilePath);
    });

    archive.on("error", (err) => {
      console.error("Error creating ZIP archive", err);
      reject(err);
    });

    archive.pipe(output);

    filePaths.forEach((filePath) => {
      archive.file(filePath, { name: path.basename(filePath) });
    });
    console.log("finilizing archive...");
    archive.finalize();
    console.log("Archive finalized successfully.");
  });
}
