import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { playerProgress, levelRecords } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const progressRouter = createRouter({
  get: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;
    const userType = "oauth" as const;

    let progress = await db.select().from(playerProgress)
      .where(and(eq(playerProgress.userId, userId), eq(playerProgress.userType, userType)));

    if (progress.length === 0) {
      await db.insert(playerProgress).values({
        userId,
        userType,
        currentLevel: 1,
        totalStars: 0,
        bestLevel: 1,
        totalScore: 0,
      });
      progress = await db.select().from(playerProgress)
        .where(and(eq(playerProgress.userId, userId), eq(playerProgress.userType, userType)));
    }

    const records = await db.select().from(levelRecords)
      .where(and(eq(levelRecords.userId, userId), eq(levelRecords.userType, userType)))
      .orderBy(levelRecords.level);

    return {
      ...progress[0],
      levelRecords: records.map((r) => ({
        level: r.level,
        stars: r.stars,
        score: r.score,
      })),
    };
  }),

  completeLevel: authedQuery
    .input(z.object({
      level: z.number().min(1).max(30),
      stars: z.number().min(1).max(3),
      score: z.number(),
      timeLeft: z.number(),
      mistakes: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;
      const userType = "oauth" as const;

      // Upsert level record
      const existing = await db.select().from(levelRecords)
        .where(and(
          eq(levelRecords.userId, userId),
          eq(levelRecords.userType, userType),
          eq(levelRecords.level, input.level)
        ));

      if (existing.length > 0) {
        if (input.stars > existing[0].stars || input.score > existing[0].score) {
          await db.update(levelRecords).set({
            stars: Math.max(input.stars, existing[0].stars),
            score: Math.max(input.score, existing[0].score),
            timeLeft: input.timeLeft,
            mistakes: input.mistakes,
          }).where(eq(levelRecords.id, existing[0].id));
        }
      } else {
        await db.insert(levelRecords).values({
          userId,
          userType,
          level: input.level,
          stars: input.stars,
          score: input.score,
          timeLeft: input.timeLeft,
          mistakes: input.mistakes,
        });
      }

      // Recalculate total stats
      const allRecords = await db.select().from(levelRecords)
        .where(and(eq(levelRecords.userId, userId), eq(levelRecords.userType, userType)));

      const totalStars = allRecords.reduce((sum, r) => sum + r.stars, 0);
      const totalScore = allRecords.reduce((sum, r) => sum + r.score, 0);
      const bestLevel = Math.max(...allRecords.map((r) => r.level));
      const currentLevel = Math.min(bestLevel + 1, 30);

      // Check title unlock
      let unlockedTitle: string | null = null;
      const existingProgress = await db.select().from(playerProgress)
        .where(and(eq(playerProgress.userId, userId), eq(playerProgress.userType, userType)));

      if (bestLevel >= 30 && (!existingProgress[0]?.unlockedTitle)) {
        unlockedTitle = "杭电校史达人";
      }

      if (existingProgress.length > 0) {
        await db.update(playerProgress).set({
          currentLevel,
          totalStars,
          bestLevel,
          totalScore,
          unlockedTitle: unlockedTitle || existingProgress[0].unlockedTitle,
        }).where(eq(playerProgress.id, existingProgress[0].id));
      } else {
        await db.insert(playerProgress).values({
          userId,
          userType,
          currentLevel,
          totalStars,
          bestLevel,
          totalScore,
          unlockedTitle,
        });
      }

      return {
        success: true,
        newUnlocks: unlockedTitle ? [unlockedTitle] : [],
        totalStars,
        bestLevel,
        currentLevel,
      };
    }),

  reset: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;
    const userType = "oauth" as const;

    await db.delete(levelRecords).where(
      and(eq(levelRecords.userId, userId), eq(levelRecords.userType, userType))
    );
    await db.delete(playerProgress).where(
      and(eq(playerProgress.userId, userId), eq(playerProgress.userType, userType))
    );

    return { success: true };
  }),
});
