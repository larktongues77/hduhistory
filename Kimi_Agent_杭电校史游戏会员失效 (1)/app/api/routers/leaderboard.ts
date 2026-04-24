import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { leaderboard } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const leaderboardRouter = createRouter({
  getTop: publicQuery
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 50;
      const result = await db.select().from(leaderboard)
        .orderBy(desc(leaderboard.totalScore))
        .limit(limit);

      return result.map((r, index) => ({
        rank: index + 1,
        playerName: r.playerName,
        totalScore: r.totalScore,
        totalStars: r.totalStars,
        highestLevel: r.highestLevel,
        completionTime: r.completionTime,
      }));
    }),

  getMyRank: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;
    const userType = "oauth" as const;

    const myRecord = await db.select().from(leaderboard)
      .where(and(eq(leaderboard.userId, userId), eq(leaderboard.userType, userType)));

    if (myRecord.length === 0) {
      return { rank: null, record: null };
    }

    const allRecords = await db.select().from(leaderboard)
      .orderBy(desc(leaderboard.totalScore));

    const rank = allRecords.findIndex((r) => r.id === myRecord[0].id) + 1;

    return {
      rank,
      record: myRecord[0],
    };
  }),

  submit: authedQuery
    .input(z.object({
      playerName: z.string().min(1).max(20),
      totalScore: z.number(),
      totalStars: z.number(),
      highestLevel: z.number(),
      completionTime: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;
      const userType = "oauth" as const;

      const existing = await db.select().from(leaderboard)
        .where(and(eq(leaderboard.userId, userId), eq(leaderboard.userType, userType)));

      if (existing.length > 0) {
        if (input.totalScore > existing[0].totalScore) {
          await db.update(leaderboard).set({
            playerName: input.playerName,
            totalScore: input.totalScore,
            totalStars: input.totalStars,
            highestLevel: input.highestLevel,
            completionTime: input.completionTime,
          }).where(eq(leaderboard.id, existing[0].id));
        }
      } else {
        await db.insert(leaderboard).values({
          userId,
          userType,
          playerName: input.playerName,
          totalScore: input.totalScore,
          totalStars: input.totalStars,
          highestLevel: input.highestLevel,
          completionTime: input.completionTime,
        });
      }

      const allRecords = await db.select().from(leaderboard)
        .orderBy(desc(leaderboard.totalScore));
      const rank = allRecords.findIndex((r) => r.userId === userId && r.userType === userType) + 1;

      return { success: true, rank };
    }),
});
