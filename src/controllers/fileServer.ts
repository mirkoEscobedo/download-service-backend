import path from "node:path";
import type { Request, Response } from "express";

export function fileServer(req: Request, res: Response) {
  const filePath = req.query.path as string;

  if (!filePath) {
    return res.status(400).send("File path required");
  }

  const decodedFilePath = decodeURIComponent(filePath);
  res.download(decodedFilePath, (err) => {
    if (err) {
      console.error("Error while sending file: ", err);
      res.status(500).send("Failed to download file");
    }
  });
}
