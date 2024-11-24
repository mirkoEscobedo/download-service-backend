import { tmpdir } from "node:os";
import path from "node:path";
import { getBase64Thumbnail, transformLink } from "@/common/utils/chanUtils";
import { convertMedia } from "@/services/convertService";
import { downloadMediaFiles } from "@/services/downloadService";
import { fetchThreadData, fetchThreadMedia } from "@/services/puppeteerService";
import { createZipFromFiles } from "@/services/zipService";
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

  convertAndDownloadMedia: publicProcedure
    .input(
      z.object({
        mediaUrls: z.array(z.string()).nonempty(),
        format: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      console.log(input);
      const { mediaUrls, format } = input;

      try {
        const downloadedFiles = await downloadMediaFiles(mediaUrls);

        let processedFiles: string[] = [];
        if (format && format !== "default") {
          processedFiles = await Promise.all(downloadedFiles.map((filePath) => convertMedia(filePath, format)));
        } else {
          processedFiles = downloadedFiles;
        }

        if (processedFiles.length > 1) {
          const zipPath = path.join(tmpdir(), `download_${Date.now()}.zip`);
          await createZipFromFiles(processedFiles, zipPath);
          console.log(zipPath);
          return { filePath: zipPath };
        }

        const filePath = processedFiles[0];
        console.log(filePath);
        return { filePath };
      } catch (error) {
        console.error("Error in converting and downloading media: ", error);
        throw new Error("Failed to convert or download media");
      }
    }),
});
