import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Star, Medal, Crown } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const leaderboardQuery = trpc.leaderboard.getTop.useQuery({ limit: 50 });
  const myRankQuery = trpc.leaderboard.getMyRank.useQuery(undefined, {
    enabled: !!user,
  });

  const entries = leaderboardQuery.data || [];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-slate-500 font-bold text-sm">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200";
    if (rank === 2) return "bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200";
    if (rank === 3) return "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200";
    return "bg-white border-slate-100";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            返回
          </Button>
          <h1 className="text-white font-bold text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            排行榜
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* My Rank Card */}
        {user && myRankQuery.data?.rank && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 mb-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">我的排名</p>
                <p className="text-3xl font-black">第 {myRankQuery.data.rank} 名</p>
              </div>
              <div className="text-right">
                <p className="text-blue-200 text-sm">总分</p>
                <p className="text-2xl font-bold">{myRankQuery.data.record?.totalScore || 0}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Top 3 Podium */}
        {entries.length >= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-end justify-center gap-4 mb-8"
          >
            {/* 2nd */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-slate-300 to-slate-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-2">
                2
              </div>
              <div className="text-center">
                <p className="text-white text-sm font-medium truncate max-w-[100px]">{entries[1].playerName}</p>
                <p className="text-slate-400 text-xs">{entries[1].totalScore}分</p>
              </div>
              <div className="w-20 h-24 bg-gradient-to-b from-slate-600 to-slate-700 rounded-t-lg mt-2" />
            </div>

            {/* 1st */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-500 flex items-center justify-center text-3xl font-bold text-yellow-900 shadow-xl mb-2">
                <Crown className="w-10 h-10" />
              </div>
              <div className="text-center">
                <p className="text-yellow-300 text-sm font-bold truncate max-w-[100px]">{entries[0].playerName}</p>
                <p className="text-yellow-400/70 text-xs">{entries[0].totalScore}分</p>
              </div>
              <div className="w-24 h-32 bg-gradient-to-b from-yellow-600 to-yellow-700 rounded-t-lg mt-2" />
            </div>

            {/* 3rd */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-orange-400 to-amber-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-2">
                3
              </div>
              <div className="text-center">
                <p className="text-white text-sm font-medium truncate max-w-[100px]">{entries[2].playerName}</p>
                <p className="text-slate-400 text-xs">{entries[2].totalScore}分</p>
              </div>
              <div className="w-20 h-16 bg-gradient-to-b from-amber-700 to-amber-800 rounded-t-lg mt-2" />
            </div>
          </motion.div>
        )}

        {/* List */}
        <div className="space-y-2">
          {entries.map((entry, idx) => (
            <motion.div
              key={idx}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl border ${getRankBg(entry.rank)}`}
            >
              <div className="shrink-0">{getRankIcon(entry.rank)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">
                  {entry.playerName}
                </p>
                <p className="text-slate-500 text-xs">
                  最高第{entry.highestLevel}关
                </p>
              </div>
              <div className="flex items-center gap-1 text-yellow-500 shrink-0">
                <Star className="w-4 h-4 fill-yellow-400" />
                <span className="text-sm font-bold">{entry.totalStars}</span>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-slate-800">{entry.totalScore}</p>
                <p className="text-slate-400 text-xs">分</p>
              </div>
            </motion.div>
          ))}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">暂无排行榜数据</p>
            <p className="text-slate-500 text-sm mt-2">成为第一个上榜的人吧！</p>
          </div>
        )}
      </div>
    </div>
  );
}
