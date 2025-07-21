import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import watchIdentifyRoute from "./routes/identify/watch/route";
import qualityCheckRoute from "./routes/identify/quality/route";
import intelligentSearchRoute from "./routes/search/intelligent/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  identify: createTRPCRouter({
    watch: watchIdentifyRoute,
    quality: qualityCheckRoute,
  }),
  search: createTRPCRouter({
    intelligent: intelligentSearchRoute,
  }),
});

export type AppRouter = typeof appRouter;