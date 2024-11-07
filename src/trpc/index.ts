import { mediaRouter } from "./mediaRouter";
import { router } from "./trpc";

export const appRouter = router({
  media: mediaRouter,
});

export type AppRouter = typeof appRouter;
