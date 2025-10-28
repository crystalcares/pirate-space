import { motion } from 'framer-motion';

const Star = ({ size, x, y, duration }: { size: number; x: string; y: string; duration: number }) => (
  <motion.div
    className="absolute rounded-full bg-white"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
    }}
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0.5, 1, 0.5],
    }}
    transition={{
      duration,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'easeInOut',
    }}
  />
);

export default function StarfieldBackground() {
  const stars = Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    size: Math.random() * 1.5 + 0.5,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden">
      {stars.map(star => (
        <Star key={star.id} {...star} />
      ))}
    </div>
  );
}
