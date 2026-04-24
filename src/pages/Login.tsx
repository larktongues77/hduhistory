import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { LogIn, ArrowLeft, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="text-white hover:bg-white/10 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回首页
        </Button>

        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            <CardTitle className="text-xl text-slate-800">
              登录杭电校史大闯关
            </CardTitle>
            <p className="text-slate-500 text-sm mt-1">
              登录后可保存游戏进度并参与排行榜
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-xl"
              size="lg"
              onClick={() => {
                window.location.href = getOAuthUrl();
              }}
            >
              <LogIn className="w-5 h-5 mr-2" />
              使用 Kimi 账号登录
            </Button>

            <div className="text-center">
              <button
                onClick={() => navigate("/")}
                className="text-slate-400 text-sm hover:text-slate-600 transition-colors"
              >
                先不登录，直接游玩
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
