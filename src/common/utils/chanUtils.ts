export function transformLink(normalThreadUrl: string): string {
  try {
    const url = new URL(normalThreadUrl);

    const board = url.pathname.split("/")[1];
    const threadId = url.pathname.split("/")[3];

    if (!board || !threadId) {
      throw new Error("Invalid or Expired thread url");
    }
    const cdnUrl: string = `https://a.4cdn.org/${board}/thread/${threadId}.json`;
    const finalUrl: string = addCors(cdnUrl);
    return finalUrl;
  } catch (error) {
    console.log(error);
    throw new Error("Invalid or Expired thread url");
  }
}

function addCors(cdnUrl: string): string {
  const corsUrl: string = `https://corsproxy.io/?${encodeURIComponent(cdnUrl)}`;
  return corsUrl;
}
