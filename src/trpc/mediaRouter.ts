import { getBase64Thumbnail, transformLink } from "@/common/utils/chanUtils";
import { fetchThreadData, fetchThreadMedia } from "@/services/puppeteerService";
import { z } from "zod";
import { publicProcedure, router } from "./trpc";

export const mediaRouter = router({
  getChanMediaList: publicProcedure.input(z.object({ link: z.string() })).query(async ({ input }) => {
    const { board, link: modifiedLink } = transformLink(input.link);

    const threadData = await fetchThreadData(modifiedLink);
    if (!threadData || !Array.isArray(threadData.posts)) {
      throw new Error("Failed to fetch thread data");
    }

    const mediaPosts = threadData.posts.filter((post: any) => post.ext?.match(/\.(webm|jpg|jpeg|png|gif)$/));

    const chanMediaList = await Promise.all(
      mediaPosts.map(async (post: any) => {
        let thumbnail = null;
        const thumbnailUrl = `https://i.4cdn.org/${board}/${post.tim}s.jpg`;

        try {
          thumbnail = await getBase64Thumbnail(thumbnailUrl);
        } catch (error) {
          console.error(`Failed to fetch thumbnail for ${thumbnailUrl}`);
        }
        return {
          filename: post.filename,
          url: `https://i.4cdn.org/${board}/${post.tim}${post.ext}`,
          thumbnail: thumbnail,
          board: board,
          tim: post.tim,
        };
      }),
    );

    return chanMediaList;
  }),

  downloadMedia: publicProcedure.input(z.object({ mediaUrls: z.array(z.string()) })).mutation(async ({ input }) => {
    const downloadFiles = await fetchThreadMedia(input.mediaUrls);
    return { succes: true, files: downloadFiles };
  }),
});
