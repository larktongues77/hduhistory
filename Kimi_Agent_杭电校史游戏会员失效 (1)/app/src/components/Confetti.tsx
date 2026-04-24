import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  size: number;
  speed: number;
}

const COLORS = ["#E74C3C", "#3498DB", "#F1C40F", "#2ECC71", "#9B59B6", "#FF6B6B", "#4ECDC4"];

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

export default function Confetti({ active, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = [];
    for (let i = 0; i < 80; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        size: 6 + Math.random() * 8,
        speed: 2 + Math.random() * 4,
      });
    }
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), duration + 2000);
    return () => clearTimeout(timer);
  }, [active, duration]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            rotate: p.rotation,
            opacity: 1,
          }}
          animate={{
            top: "110%",
            rotate: p.rotation + 720,
            opacity: 0,
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            ease: "easeIn",
            delay: Math.random() * 0.5,
          }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}
