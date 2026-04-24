import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GameScreen =
  | "home"
  | "levelMap"
  | "playing"
  | "paused"
  | "levelComplete"
  | "gameOver"
  | "victory"
  | "leaderboard"
  | "settings";

export interface LevelRecord {
  level: number;
  stars: number;
  score: number;
}

interface GameState {
  // Navigation
  screen: GameScreen;
  setScreen: (screen: GameScreen) => void;

  // Level progress
  currentLevel: number;
  setCurrentLevel: (level: number) => void;
  unlockedLevel: number;
  setUnlockedLevel: (level: number) => void;

  // Level records
  levelRecords: LevelRecord[];
  setLevelRecord: (record: LevelRecord) => void;
  getLevelRecord: (level: number) => LevelRecord | undefined;

  // Game state
  lives: number;
  maxLives: number;
  setLives: (lives: number) => void;
  score: number;
  setScore: (score: number) => void;
  addScore: (points: number) => void;

  // Timer
  timeLeft: number;
  setTimeLeft: (time: number) => void;

  // Stars for current level
  stars: number;
  setStars: (stars: number) => void;

  // Mistakes
  mistakes: number;
  setMistakes: (m: number) => void;

  // Titles
  unlockedTitles: string[];
  addTitle: (title: string) => void;

  // Sound
  soundEnabled: boolean;
  toggleSound: () => void;

  // Reset
  resetProgress: () => void;
  resetLevel: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: "home",
      setScreen: (screen) => set({ screen }),

      currentLevel: 1,
      setCurrentLevel: (level) => set({ currentLevel: level }),
      unlockedLevel: 1,
      setUnlockedLevel: (level) =>
        set((state) => ({
          unlockedLevel: Math.max(state.unlockedLevel, level),
        })),

      levelRecords: [],
      setLevelRecord: (record) =>
        set((state) => {
          const existing = state.levelRecords.find((r) => r.level === record.level);
          if (existing) {
            return {
              levelRecords: state.levelRecords.map((r) =>
                r.level === record.level
                  ? { ...r, stars: Math.max(r.stars, record.stars), score: Math.max(r.score, record.score) }
                  : r
              ),
            };
          }
          return { levelRecords: [...state.levelRecords, record] };
        }),
      getLevelRecord: (level) => get().levelRecords.find((r) => r.level === level),

      lives: 3,
      maxLives: 3,
      setLives: (lives) => set({ lives: Math.max(0, Math.min(lives, get().maxLives)) }),
      score: 0,
      setScore: (score) => set({ score }),
      addScore: (points) => set((state) => ({ score: state.score + points })),

      timeLeft: 60,
      setTimeLeft: (time) => set({ timeLeft: time }),

      stars: 0,
      setStars: (stars) => set({ stars }),

      mistakes: 0,
      setMistakes: (m) => set({ mistakes: m }),

      unlockedTitles: [],
      addTitle: (title) =>
        set((state) => ({
          unlockedTitles: state.unlockedTitles.includes(title)
            ? state.unlockedTitles
            : [...state.unlockedTitles, title],
        })),

      soundEnabled: true,
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      resetProgress: () =>
        set({
          currentLevel: 1,
          unlockedLevel: 1,
          levelRecords: [],
          unlockedTitles: [],
          score: 0,
        }),

      resetLevel: () =>
        set({
          lives: 3,
          score: 0,
          timeLeft: 60,
          stars: 0,
          mistakes: 0,
        }),
    }),
    {
      name: "hdu-game-store",
      partialize: (state) => ({
        unlockedLevel: state.unlockedLevel,
        levelRecords: state.levelRecords,
        unlockedTitles: state.unlockedTitles,
        soundEnabled: state.soundEnabled,
      }),
    }
  )
);
