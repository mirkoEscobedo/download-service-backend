import axios from "axios";

export function transformLink(normalThreadUrl: string) {
  try {
    const url = new URL(normalThreadUrl);

    const board = url.pathname.split("/")[1];
    const threadId = url.pathname.split("/")[3];

    if (!board || !threadId) {
      throw new Error("Invalid or Expired thread url");
    }
    const cdnUrl: string = `https://a.4cdn.org/${board}/thread/${threadId}.json`;
    const finalUrl: string = addCors(cdnUrl);
    return { board, link: finalUrl };
  } catch (error) {
    console.log(error);
    throw new Error("Invalid or Expired thread url");
  }
}

function addCors(cdnUrl: string): string {
  const corsUrl: string = `https://corsproxy.io/?key=0676e644&url=${cdnUrl}`;
  return corsUrl;
}

export async function getBase64Thumbnail(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });
    const imageBuffer = Buffer.from(response.data, "binary");
    const mimeType = response.headers["content-type"];
    return `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
  } catch (error) {
    console.error(`Error fetching thumbnail from ${url}: `, error);
    return null;
  }
}
