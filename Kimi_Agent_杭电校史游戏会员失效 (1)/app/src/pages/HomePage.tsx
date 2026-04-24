import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Play, Trophy, BookOpen, Settings, HelpCircle, Sparkles } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const navigate = useNavigate();
  const { unlockedTitles } = useGameStore();
  const { user, logout } = useAuth();

  const hasMasterTitle = unlockedTitles.includes("杭电校史达人");

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/campus-gate.jpg)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-blue-800/50 to-blue-900/80" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Title */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <span className="text-yellow-300 text-lg font-medium tracking-wider">
              杭州电子科技大学
            </span>
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-3 drop-shadow-lg">
            校史大闯关
          </h1>
          <p className="text-blue-200 text-lg md:text-xl">
            从一砖一瓦到数字未来 · 探寻70年辉煌历程
          </p>
        </motion.div>

        {/* Master Title Badge */}
        {hasMasterTitle && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
            className="mb-6 bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900 px-6 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            已获得称号：杭电校史达人
          </motion.div>
        )}

        {/* Menu Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-sm space-y-3"
        >
          <Button
            onClick={() => navigate("/levels")}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg shadow-green-500/30 transition-all hover:scale-105"
          >
            <Play className="w-6 h-6 mr-2" />
            开始闯关
          </Button>

          <Button
            onClick={() => navigate("/leaderboard")}
            variant="outline"
            className="w-full h-12 text-base font-semibold bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white rounded-xl transition-all hover:scale-105"
          >
            <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
            排行榜
          </Button>

          <Button
            onClick={() => {}}
            variant="outline"
            className="w-full h-12 text-base font-semibold bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white rounded-xl transition-all hover:scale-105"
          >
            <BookOpen className="w-5 h-5 mr-2 text-blue-300" />
            校史知识库
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={() => {}}
              variant="outline"
              className="flex-1 h-11 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white rounded-xl"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              玩法说明
            </Button>
            <Button
              onClick={() => {}}
              variant="outline"
              className="flex-1 h-11 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white rounded-xl"
            >
              <Settings className="w-4 h-4 mr-1" />
              设置
            </Button>
          </div>
        </motion.div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center gap-3"
        >
          {user ? (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              {user.avatar && (
                <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
              )}
              <span className="text-white text-sm">{user.name}</span>
              <button
                onClick={logout}
                className="text-blue-300 text-xs hover:text-white transition-colors"
              >
                退出
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="text-blue-300 text-sm hover:text-white transition-colors underline"
            >
              登录以保存进度
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
