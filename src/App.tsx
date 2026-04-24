import { Routes, Route } from "react-router";
import HomePage from "@/pages/HomePage";
import LevelMapPage from "@/pages/LevelMapPage";
import GamePage from "@/pages/GamePage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import LoginPage from "@/pages/Login";
import NotFoundPage from "@/pages/NotFound";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/levels" element={<LevelMapPage />} />
        <Route path="/game/:level" element={<GamePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </>
  );
}
