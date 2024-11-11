import axios from "axios";
import type { Request, Response } from "express";
import pino from "pino";

const logger = pino({ name: "image-proxy" });

export const imageProxyHandler = async (req: Request, res: Response) => {
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.sendStatus(204);
  }
  const { url } = req.query;
  if (!url || typeof url !== "string") {
    return res.status(400).send("invalid image URL");
  }

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });
    const imageBuffer = Buffer.from(response.data, "binary");
    const base64Image = imageBuffer.toString("base64");
    const mimeType = response.headers["content-type"];

    res.set({
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });

    console.log(`data:${mimeType};base64,${base64Image}`);
    res.send(`data:${mimeType};base64,${base64Image}`);
  } catch (error) {
    logger.error("Error fetching image from URL: ", error);
    res.status(500).send("Error fetching image");
  }
};
