import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Pause, Heart, Clock, Star, ArrowRight, RotateCcw, Home, Lightbulb, X, Check, Volume2, VolumeX, Trophy } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AITutor from "@/components/AITutor";
import Confetti from "@/components/Confetti";
import { useAuth } from "@/hooks/useAuth";

const TIME_LIMITS: Record<number, number> = {
  1: 999, 2: 60, 3: 60, 4: 60, 5: 60, 6: 55, 7: 55, 8: 55, 9: 55, 10: 50,
  11: 50, 12: 50, 13: 50, 14: 45, 15: 45, 16: 45, 17: 45, 18: 40, 19: 40, 20: 40,
  21: 45, 22: 45, 23: 45, 24: 40, 25: 40, 26: 40, 27: 35, 28: 35, 29: 35, 30: 40,
};

const OPTION_LABELS = ["A", "B", "C", "D"];
const OPTION_COLORS = [
  "bg-red-500 hover:bg-red-600",
  "bg-blue-500 hover:bg-blue-600",
  "bg-yellow-500 hover:bg-yellow-600",
  "bg-green-500 hover:bg-green-600",
];

export default function GamePage() {
  const { level: levelParam } = useParams<{ level: string }>();
  const level = parseInt(levelParam || "1");
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    lives, setLives, score, addScore,
    setTimeLeft, stars, setStars,
    mistakes, setMistakes, unlockedLevel, setUnlockedLevel,
    setLevelRecord, addTitle, soundEnabled, toggleSound,
    resetLevel, levelRecords,
  } = useGameStore();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [knowledgeText, setKnowledgeText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const timeLimit = TIME_LIMITS[level] || 45;
  const [shakeScreen, setShakeScreen] = useState(false);
  const [localTimeLeft, setLocalTimeLeft] = useState(timeLimit);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const questionsQuery = trpc.question.getByLevel.useQuery({ level });
  const submitMutation = trpc.question.submitAnswer.useMutation();
  const leaderboardSubmit = trpc.leaderboard.submit.useMutation();
  const questionsList = questionsQuery.data || [];
  const currentQuestion = questionsList[0];

  useEffect(() => {
    resetLevel();
    setLocalTimeLeft(timeLimit);
    setTimeLeft(timeLimit);
  }, [level]);

  useEffect(() => {
    if (isPaused || showResult || showGameOver || showLevelComplete || showVictory || !currentQuestion) {
      return;
    }

    timerRef.current = setInterval(() => {
      setLocalTimeLeft((prev: number) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setShowGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, showResult, showGameOver, showLevelComplete, showVictory, currentQuestion]);

  const handleAnswer = useCallback(async (answer: string) => {
    if (selectedAnswer || !currentQuestion) return;
    setSelectedAnswer(answer);

    const result = await submitMutation.mutateAsync({
      questionId: currentQuestion.id,
      answer: answer as "A" | "B" | "C" | "D",
    });

    setIsCorrect(result.correct);
    setCorrectAnswer(result.correctAnswer);
    setShowResult(true);

    if (result.correct) {
      addScore(100);
      setKnowledgeText(result.knowledgePoint || "");
    } else {
      setLives(lives - 1);
      setMistakes(mistakes + 1);
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 300);

      if (lives <= 1) {
        setTimeout(() => setShowGameOver(true), 1500);
        return;
      }
    }

    setTimeout(() => {
      if (result.correct) {
        setShowKnowledge(true);
      }
    }, 1000);
  }, [selectedAnswer, currentQuestion, lives, mistakes, submitMutation]);

  const handleContinue = () => {
    setShowKnowledge(false);
    const timePercent = localTimeLeft / timeLimit;
    const newMistakes = mistakes;
    const earnedStars = newMistakes === 0 && timePercent > 0.5 ? 3 : timePercent > 0.2 ? 2 : 1;
    setStars(earnedStars);

    setLevelRecord({ level, stars: earnedStars, score: score + 100 });

    if (level >= 30) {
      setShowVictory(true);
      addTitle("杭电校史达人");
      // Submit to leaderboard
      if (user) {
        const totalStars = levelRecords.reduce((sum, r) => sum + r.stars, 0) + earnedStars;
        leaderboardSubmit.mutate({
          playerName: user.name || "玩家",
          totalScore: score + 100,
          totalStars,
          highestLevel: 30,
          completionTime: timeLimit - localTimeLeft,
        });
      }
    } else {
      setShowLevelComplete(true);
      setUnlockedLevel(Math.max(unlockedLevel, level + 1));
    }
  };

  const handleNextLevel = () => {
    navigate(`/game/${level + 1}`);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowLevelComplete(false);
    setShowKnowledge(false);
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setShowGameOver(false);
    setShowLevelComplete(false);
    setShowVictory(false);
    setShowKnowledge(false);
    resetLevel();
    setTimeLeft(timeLimit);
  };

  const getTimerColor = () => {
    const pct = localTimeLeft / timeLimit;
    if (pct > 0.5) return "bg-blue-500";
    if (pct > 0.2) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (questionsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载题目中...</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">题目加载失败</div>
      </div>
    );
  }

  const options = [
    currentQuestion.optionA,
    currentQuestion.optionB,
    currentQuestion.optionC,
    currentQuestion.optionD,
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col ${shakeScreen ? "animate-shake" : ""}`}>
      {/* HUD */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => setIsPaused(true)}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <Pause className="w-5 h-5" />
          </button>

          <div className="text-white font-bold text-lg">
            第 {level} 关
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 transition-all ${
                    i <= lives
                      ? "text-red-500 fill-red-500"
                      : "text-slate-600"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={toggleSound}
              className="p-1 rounded text-white/60 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="max-w-lg mx-auto mt-2">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-white/60" />
            <span className="text-white/60 text-sm">{localTimeLeft}秒</span>
            <span className="text-white/40 text-sm ml-auto">得分: {score}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${getTimerColor()} rounded-full`}
              animate={{ width: `${(localTimeLeft / timeLimit) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-lg mx-auto w-full">
        {/* Question Card */}
        <motion.div
          key={currentQuestion.id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="text-slate-500 text-sm mb-2 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {currentQuestion.year ? `${currentQuestion.year}年` : "校史知识"}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              currentQuestion.difficulty === "easy" ? "bg-green-100 text-green-700" :
              currentQuestion.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            }`}>
              {currentQuestion.difficulty === "easy" ? "简单" :
               currentQuestion.difficulty === "medium" ? "中等" : "困难"}
            </span>
          </div>
          <h2 className="text-slate-800 text-xl font-bold leading-relaxed">
            {currentQuestion.question}
          </h2>
        </motion.div>

        {/* Options */}
        <div className="w-full space-y-3">
          {options.map((option, idx) => {
            const label = OPTION_LABELS[idx];
            const isSelected = selectedAnswer === label;
            const isCorrectOption = showResult && label === correctAnswer;
            const isWrongOption = showResult && isSelected && !isCorrect;

            let buttonClass = OPTION_COLORS[idx];
            if (showResult) {
              if (isCorrectOption) buttonClass = "bg-green-500";
              else if (isWrongOption) buttonClass = "bg-red-500";
              else buttonClass = "bg-slate-400";
            }

            return (
              <motion.button
                key={idx}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={!showResult ? { scale: 1.02 } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
                onClick={() => handleAnswer(label)}
                disabled={showResult}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-xl text-white font-semibold
                  shadow-md transition-all ${buttonClass}
                  ${showResult ? "cursor-default" : "cursor-pointer active:translate-y-0.5"}
                `}
              >
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold shrink-0">
                  {showResult && isCorrectOption ? (
                    <Check className="w-5 h-5" />
                  ) : showResult && isWrongOption ? (
                    <X className="w-5 h-5" />
                  ) : (
                    label
                  )}
                </span>
                <span className="text-left text-base">{option}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Pause Dialog */}
      <Dialog open={isPaused} onOpenChange={setIsPaused}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">游戏暂停</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => setIsPaused(false)}
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl"
            >
              继续游戏
            </Button>
            <Button
              onClick={handleRetry}
              variant="outline"
              className="w-full h-12 border-slate-600 text-white hover:bg-slate-700 rounded-xl"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              重新开始
            </Button>
            <Button
              onClick={() => navigate("/levels")}
              variant="outline"
              className="w-full h-12 border-slate-600 text-white hover:bg-slate-700 rounded-xl"
            >
              <Home className="w-4 h-4 mr-2" />
              返回关卡地图
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Knowledge Point Dialog */}
      <Dialog open={showKnowledge} onOpenChange={setShowKnowledge}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2 text-green-700">
              <Lightbulb className="w-5 h-5" />
              知识点
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <p className="text-slate-700 text-base leading-relaxed">{knowledgeText}</p>
            <Button
              onClick={handleContinue}
              className="w-full mt-4 h-12 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl"
            >
              继续
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Level Complete Dialog */}
      <Dialog open={showLevelComplete} onOpenChange={setShowLevelComplete}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-green-700">
              关卡通过！
            </DialogTitle>
          </DialogHeader>
          <div className="text-center pt-2">
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map((s) => (
                <motion.div
                  key={s}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: s * 0.2, type: "spring" }}
                >
                  <Star
                    className={`w-10 h-10 ${
                      s <= stars
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-300"
                    }`}
                  />
                </motion.div>
              ))}
            </div>
            <p className="text-slate-600 mb-4">
              得分: <span className="font-bold text-slate-800">{score}</span>
              {" "}&middot;{" "}
              剩余时间: <span className="font-bold text-slate-800">{localTimeLeft}秒</span>
            </p>
            <div className="space-y-2">
              <Button
                onClick={handleNextLevel}
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl"
              >
                下一关
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={() => navigate("/levels")}
                variant="outline"
                className="w-full h-12 rounded-xl"
              >
                <Home className="w-4 h-4 mr-2" />
                返回关卡地图
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Game Over Dialog */}
      <Dialog open={showGameOver} onOpenChange={setShowGameOver}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-red-400">
              {localTimeLeft <= 0 ? "时间到！" : "生命耗尽！"}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center pt-2">
            <p className="text-slate-400 mb-4">
              得分: <span className="font-bold text-white">{score}</span>
            </p>
            <div className="space-y-2">
              <Button
                onClick={handleRetry}
                className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                重新挑战
              </Button>
              <Button
                onClick={() => navigate("/levels")}
                variant="outline"
                className="w-full h-12 border-slate-600 text-white hover:bg-slate-700 rounded-xl"
              >
                <Home className="w-4 h-4 mr-2" />
                返回关卡地图
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Victory Dialog */}
      <Dialog open={showVictory} onOpenChange={setShowVictory}>
        <DialogContent className="bg-gradient-to-b from-amber-50 to-yellow-100 max-w-sm border-yellow-300">
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-amber-800">
              恭喜通关！
            </DialogTitle>
          </DialogHeader>
          <div className="text-center pt-2">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="mb-4"
            >
              <img src="/trophy.png" alt="trophy" className="w-24 h-24 mx-auto" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900 px-4 py-2 rounded-full font-bold text-sm inline-block mb-4">
                获得称号：杭电校史达人
              </div>
              <p className="text-slate-600 mb-2">
                总得分: <span className="font-bold text-slate-800 text-lg">{score}</span>
              </p>
              <p className="text-slate-500 text-sm mb-4">
                你已完整通关30关校史挑战！
              </p>
            </motion.div>

            <div className="space-y-2">
              <Button
                onClick={() => navigate("/leaderboard")}
                className="w-full h-12 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold rounded-xl"
              >
                <Trophy className="w-4 h-4 mr-2" />
                查看排行榜
              </Button>
              <Button
                onClick={() => navigate("/levels")}
                variant="outline"
                className="w-full h-12 rounded-xl"
              >
                <Home className="w-4 h-4 mr-2" />
                返回关卡地图
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confetti */}
      <Confetti active={showVictory} />

      {/* AI Tutor */}
      <AITutor
        question={currentQuestion?.question}
        options={[
          currentQuestion?.optionA || "",
          currentQuestion?.optionB || "",
          currentQuestion?.optionC || "",
          currentQuestion?.optionD || "",
        ]}
        level={level}
      />

      {/* Shake animation CSS */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
