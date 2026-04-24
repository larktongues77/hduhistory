import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Bot, User } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";

interface AITutorProps {
  question?: string;
  options?: string[];
  level?: number;
}

export default function AITutor({ question, options, level }: AITutorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const chatMode = false;
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "你好！我是杭电校史AI导师，有任何校史问题都可以问我哦！" },
  ]);
  const [input, setInput] = useState("");

  const askMutation = trpc.ai.askTutor.useMutation();
  const chatMutation = trpc.ai.chat.useMutation();

  const handleAskHint = async () => {
    if (!question) return;
    const userMsg = { role: "user" as const, content: `这道题的提示是什么？"${question}"` };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const result = await askMutation.mutateAsync({
        question,
        options: options || [],
        level: level || 1,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: result.hint }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "抱歉，暂时无法获取提示。建议你回忆一下杭电校史的相关知识。" }]);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const result = await chatMutation.mutateAsync({ message: userMsg.content });
      setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "抱歉，服务暂时不可用。" }]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center text-white"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-80 max-h-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-sm">杭电校史AI导师</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            {question && !chatMode && (
              <div className="px-4 py-2 bg-purple-50 border-b border-purple-100">
                <Button
                  size="sm"
                  onClick={handleAskHint}
                  disabled={askMutation.isPending}
                  className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {askMutation.isPending ? "思考中..." : "给我这道题的提示"}
                </Button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[300px]">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-blue-100" : "bg-purple-100"
                  }`}>
                    {msg.role === "user" ? (
                      <User className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Bot className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div className={`rounded-xl px-3 py-2 text-sm max-w-[200px] ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {(askMutation.isPending || chatMutation.isPending) && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="bg-slate-100 rounded-xl px-3 py-2 text-sm text-slate-400">
                    思考中...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="问我关于杭电的问题..."
                  className="flex-1 px-3 py-2 bg-slate-50 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-purple-400"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || chatMutation.isPending}
                  className="w-9 h-9 bg-purple-500 rounded-lg flex items-center justify-center text-white disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
