import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface GlitchedVisualizerProps {
  isScanning?: boolean;
}

export function GlitchedVisualizer({ isScanning = false }: GlitchedVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(32).fill(20));

  useEffect(() => {
    // High frequency update for glitch aesthetic
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => 
        isScanning 
          ? 20 + Math.random() * 80  // more aggressive when scanning
          : 5 + Math.random() * 60   // calmer when idle
      ));
    }, isScanning ? 80 : 200);
    return () => clearInterval(interval);
  }, [isScanning]);

  return (
    <div className="h-16 flex items-end gap-[2px] opacity-90 mix-blend-screen mt-4 relative">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className={`flex-1 rounded-t-[1px] ${
            isScanning ? 'bg-cyan-glow/80 neon-border-cyan' : 'bg-violet-glow/70 neon-border-violet'
          }`}
          animate={{ height: `${height}%` }}
          transition={{ type: 'tween', duration: isScanning ? 0.08 : 0.2 }}
        />
      ))}
      {/* Overlay CRT scanline */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.6)_50%)] bg-[length:100%_4px] pointer-events-none" />
      {/* Glow gradient overlay */}
      <div className={`absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t ${isScanning ? 'from-cyan-glow/20' : 'from-violet-glow/20'} to-transparent pointer-events-none transition-colors duration-500`} />
    </div>
  );
}
