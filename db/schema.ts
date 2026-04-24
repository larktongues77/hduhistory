import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  bigint,
} from "drizzle-orm/mysql-core";

// ─── Users (OAuth) ───
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Local Users (Username/Password) ───
export const localUsers = mysqlTable("local_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 100 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;

// ─── Questions (Game questions) ───
export const questions = mysqlTable("questions", {
  id: serial("id").primaryKey(),
  level: int("level").notNull(),
  chapter: int("chapter").notNull(),
  question: text("question").notNull(),
  optionA: varchar("option_a", { length: 255 }).notNull(),
  optionB: varchar("option_b", { length: 255 }).notNull(),
  optionC: varchar("option_c", { length: 255 }).notNull(),
  optionD: varchar("option_d", { length: 255 }).notNull(),
  correctAnswer: mysqlEnum("correct_answer", ["A", "B", "C", "D"]).notNull(),
  knowledgePoint: text("knowledge_point"),
  year: int("year"),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

// ─── Player Progress ───
export const playerProgress = mysqlTable("player_progress", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  userType: mysqlEnum("user_type", ["oauth", "local"]).notNull(),
  currentLevel: int("current_level").default(1).notNull(),
  totalStars: int("total_stars").default(0).notNull(),
  bestLevel: int("best_level").default(1).notNull(),
  totalScore: int("total_score").default(0).notNull(),
  unlockedTitle: varchar("unlocked_title", { length: 100 }),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type PlayerProgress = typeof playerProgress.$inferSelect;

// ─── Level Records ───
export const levelRecords = mysqlTable("level_records", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  userType: mysqlEnum("user_type", ["oauth", "local"]).notNull(),
  level: int("level").notNull(),
  stars: int("stars").notNull(),
  score: int("score").notNull(),
  timeLeft: int("time_left").notNull(),
  mistakes: int("mistakes").default(0).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export type LevelRecord = typeof levelRecords.$inferSelect;

// ─── Leaderboard ───
export const leaderboard = mysqlTable("leaderboard", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  userType: mysqlEnum("user_type", ["oauth", "local"]).notNull(),
  playerName: varchar("player_name", { length: 100 }).notNull(),
  totalScore: int("total_score").notNull(),
  totalStars: int("total_stars").notNull(),
  highestLevel: int("highest_level").notNull(),
  completionTime: int("completion_time"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type LeaderboardEntry = typeof leaderboard.$inferSelect;

// ─── Daily Challenges ───
export const dailyChallenges = mysqlTable("daily_challenges", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 10 }).notNull().unique(),
  questionIds: text("question_ids").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Daily Challenge Records ───
export const dailyChallengeRecords = mysqlTable("daily_challenge_records", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  userType: mysqlEnum("user_type", ["oauth", "local"]).notNull(),
  challengeDate: varchar("challenge_date", { length: 10 }).notNull(),
  score: int("score").notNull(),
  correctCount: int("correct_count").notNull(),
  totalCount: int("total_count").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});
