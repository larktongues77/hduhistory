import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <h1 className="text-8xl font-black text-white/10 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-2">页面未找到</h2>
        <p className="text-slate-400 mb-6">这个关卡似乎不存在...</p>
        <Button
          onClick={() => navigate("/")}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl"
        >
          <Home className="w-4 h-4 mr-2" />
          返回首页
        </Button>
      </motion.div>
    </div>
  );
}
