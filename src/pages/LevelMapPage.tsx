import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Star, Trophy } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/button";
const CHAPTERS = [
  { id: 1, title: "筚路蓝缕", range: "1956-1980", color: "from-amber-600 to-orange-700", bgColor: "bg-amber-50", levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { id: 2, title: "茁壮成长", range: "1980-2004", color: "from-green-600 to-emerald-700", bgColor: "bg-green-50", levels: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
  { id: 3, title: "腾飞时代", range: "2004-至今", color: "from-blue-600 to-indigo-700", bgColor: "bg-blue-50", levels: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30] },
];

export default function LevelMapPage() {
  const navigate = useNavigate();
  const { unlockedLevel, levelRecords, setCurrentLevel } = useGameStore();

  const getStarsForLevel = (level: number) => {
    const record = levelRecords.find((r) => r.level === level);
    return record?.stars ?? 0;
  };

  const handleLevelClick = (level: number) => {
    if (level > unlockedLevel) return;
    setCurrentLevel(level);
    navigate(`/game/${level}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            返回
          </Button>
          <h1 className="text-white font-bold text-lg">选择关卡</h1>
          <div className="flex items-center gap-1 text-yellow-400">
            <Star className="w-5 h-5 fill-yellow-400" />
            <span className="font-bold text-sm">
              {levelRecords.reduce((sum, r) => sum + r.stars, 0)}/90
            </span>
          </div>
        </div>
      </div>

      {/* Level Map */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {CHAPTERS.map((chapter, chapterIdx) => (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: chapterIdx * 0.15 }}
          >
            {/* Chapter Header */}
            <div className={`bg-gradient-to-r ${chapter.color} rounded-t-xl px-4 py-3`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-bold text-lg">
                    篇章{chapter.id}：{chapter.title}
                  </h2>
                  <p className="text-white/70 text-sm">{chapter.range}</p>
                </div>
                <Trophy className="w-6 h-6 text-white/50" />
              </div>
            </div>

            {/* Level Grid */}
            <div className={`${chapter.bgColor} rounded-b-xl p-4`}>
              <div className="grid grid-cols-5 gap-3">
                {chapter.levels.map((level, idx) => {
                  const isLocked = level > unlockedLevel;
                  const stars = getStarsForLevel(level);
                  const isCompleted = stars > 0;

                  return (
                    <motion.button
                      key={level}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: chapterIdx * 0.15 + idx * 0.05, type: "spring" }}
                      whileHover={!isLocked ? { scale: 1.1 } : {}}
                      whileTap={!isLocked ? { scale: 0.95 } : {}}
                      onClick={() => handleLevelClick(level)}
                      disabled={isLocked}
                      className={`
                        relative aspect-square rounded-xl flex flex-col items-center justify-center
                        font-bold text-lg transition-all shadow-md
                        ${isLocked
                          ? "bg-slate-300 text-slate-400 cursor-not-allowed"
                          : isCompleted
                            ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white hover:shadow-lg"
                            : "bg-gradient-to-br from-blue-400 to-indigo-500 text-white hover:shadow-lg"
                        }
                      `}
                    >
                      {isLocked ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <>
                          <span>{level}</span>
                          {stars > 0 && (
                            <div className="absolute -bottom-1 flex gap-px">
                              {[1, 2, 3].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${
                                    s <= stars ? "fill-yellow-300 text-yellow-300" : "text-white/30"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Quick Play Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center pb-8"
        >
          <Button
            onClick={() => {
              setCurrentLevel(unlockedLevel);
              navigate(`/game/${unlockedLevel}`);
            }}
            className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg"
          >
            继续第 {unlockedLevel} 关
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
