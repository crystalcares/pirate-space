import { motion } from 'framer-motion';
import { useMemo } from 'react';

const ConfettiPiece = ({ x, y, rotate, color }: { x: number, y: number, rotate: number, color: string }) => {
  return (
    <motion.div
      className="absolute w-2 h-4"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        backgroundColor: color,
      }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: '120vh',
        opacity: 0,
        rotate: rotate,
      }}
      transition={{
        duration: Math.random() * 2 + 3,
        ease: 'linear',
      }}
    />
  );
};

export default function Confetti() {
  const colors = ['#00FFFF', '#00FF9C', '#FF00E6', '#FFFFFF'];
  const pieces = useMemo(() => Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * -50,
    rotate: Math.random() * 720 - 360,
    color: colors[Math.floor(Math.random() * colors.length)],
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map(piece => (
        <ConfettiPiece key={piece.id} {...piece} />
      ))}
    </div>
  );
}
