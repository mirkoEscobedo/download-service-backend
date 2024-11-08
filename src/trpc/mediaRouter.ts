import { fetchThreadData, fetchThreadMedia } from "@/services/puppeteerService";
import { z } from "zod";
import { publicProcedure, router } from "./trpc";

export const mediaRouter = router({
  getChanMediaList: publicProcedure.input(z.object({ link: z.string() })).query(async ({ input }) => {
    const modifiedLink = input.link.includes("4cdn")
      ? `https://corsproxy.io/?${encodeURIComponent(input.link)}`
      : input.link;

    const threadData = await fetchThreadData(modifiedLink);
    if (!threadData || !Array.isArray(threadData.posts)) {
      throw new Error("Failed to fetch thread data");
    }

    const chanMediaList = threadData.posts
      .filter((post: any) => post.ext?.match(/\.(webm|jpg|jpeg|png|gif)$/))
      .map((post: any) => ({
        filename: post.filename,
        url: `https://i.4cdn.org/${threadData.board}/${post.tim}${post.ext}`,
      }));

    return chanMediaList;
  }),

  downloadMedia: publicProcedure.input(z.object({ mediaUrls: z.array(z.string()) })).mutation(async ({ input }) => {
    const downloadFiles = await fetchThreadMedia(input.mediaUrls);
    return { succes: true, files: downloadFiles };
  }),
});
