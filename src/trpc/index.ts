import dotenv from "dotenv";
import { mediaRouter } from "./mediaRouter";
import { router } from "./trpc";

dotenv.config();

export const appRouter = router({
  media: mediaRouter,
});

export type AppRouter = typeof appRouter;
