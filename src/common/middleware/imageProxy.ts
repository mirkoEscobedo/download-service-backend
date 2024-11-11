import axios from "axios";
import type { Request, Response } from "express";
import pino from "pino";

const logger = pino({ name: "image-proxy" });

export const imageProxyHandler = async (req: Request, res: Response) => {
  const { url } = req.query;
  if (!url || typeof url !== "string") {
    return res.status(400).send("invalid image URL");
  }

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    res.set("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (error) {
    logger.error("Error fetching image from URL: ", error);
    res.status(500).send("Error fetching image");
  }
};
