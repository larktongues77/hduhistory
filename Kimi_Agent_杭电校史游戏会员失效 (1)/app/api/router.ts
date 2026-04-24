import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { questionRouter } from "./routers/question";
import { progressRouter } from "./routers/progress";
import { leaderboardRouter } from "./routers/leaderboard";
import { aiRouter } from "./routers/ai";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  question: questionRouter,
  progress: progressRouter,
  leaderboard: leaderboardRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
