import { tmpdir } from "node:os";
import path from "node:path";
import { getBase64Thumbnail, transformLink } from "@/common/utils/chanUtils";
import { convertMedia } from "@/services/convertService";
import { downloadMediaFiles } from "@/services/downloadService";
import { fetchThreadData, fetchThreadMedia } from "@/services/puppeteerService";
import { createZipFromFiles } from "@/services/zipService";
import { z } from "zod";
import { publicProcedure, router } from "./trpc";

export const progressMap: Record<string, any> = {};

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
        taskId: z.string(),
        mediaUrls: z.array(z.string()).nonempty(),
        format: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { taskId, mediaUrls, format } = input;
      progressMap[taskId] = {
        status: "Initializing",
        progress: 0,
      };

      console.log(`Task ID; ${taskId}`, input);
      try {
        progressMap[taskId].status = "Downloading";
        console.log(progressMap[taskId]);
        const downloadedFiles = await downloadMediaFiles(mediaUrls, taskId);

        let processedFiles: string[] = [];
        if (format && format !== "default") {
          progressMap[taskId].status = "Converting";
          progressMap[taskId].progress = 50;

          processedFiles = await Promise.all(
            downloadedFiles.map((filePath, index) => {
              progressMap[taskId].progress += Math.round(40 / downloadedFiles.length);
              console.log(progressMap[taskId]);
              return convertMedia(filePath, format);
            }),
          );
        } else {
          processedFiles = downloadedFiles;
          progressMap[taskId].progress = 90;
        }

        if (processedFiles.length > 1) {
          progressMap[taskId].status = "Zipping";
          progressMap[taskId].progress = 95;
          console.log(progressMap[taskId]);
          const zipPath = path.join(tmpdir(), `download_${Date.now()}.zip`);
          await createZipFromFiles(processedFiles, zipPath);
          console.log(zipPath);
          progressMap[taskId].progress = 100;
          progressMap[taskId].status = "Done";
          console.log(progressMap[taskId]);
          return { filePath: zipPath };
        }

        const filePath = processedFiles[0];
        console.log(filePath);
        progressMap[taskId].progress = 100;
        progressMap[taskId].status = "Done";
        console.log(progressMap[taskId]);
        return { filePath };
      } catch (error) {
        console.error("Error in converting and downloading media: ", error);
        throw new Error("Failed to convert or download media");
      }
    }),
});
