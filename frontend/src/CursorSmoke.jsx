import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CursorSmoke() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const handleMove = (e) => {
      const colors = [
        "#8b5cf6",
        "#06b6d4",
        "#ec4899",
        "#22c55e",
        "#f97316",
      ];

      const newParticle = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        color: colors[Math.floor(Math.random() * colors.length)],
      };

      setParticles((prev) => [...prev.slice(-30), newParticle]);

      setTimeout(() => {
        setParticles((prev) =>
          prev.filter((p) => p.id !== newParticle.id)
        );
      }, 1200);
    };

    window.addEventListener("mousemove", handleMove);
    return () =>
      window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <AnimatePresence>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            opacity: 0.8,
            scale: 0.5,
            x: particle.x,
            y: particle.y,
          }}
          animate={{
            opacity: 0,
            scale: 4,
            y: particle.y - 100,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="fixed pointer-events-none z-[9999]"
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "999px",
            background: particle.color,
            filter: "blur(20px)",
          }}
        />
      ))}
    </AnimatePresence>
  );
}