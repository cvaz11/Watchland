import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import watchIdentifyRoute from "./routes/identify/watch/route";
import qualityCheckRoute from "./routes/identify/quality/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  identify: createTRPCRouter({
    watch: watchIdentifyRoute,
    quality: qualityCheckRoute,
  }),
});

export type AppRouter = typeof appRouter;