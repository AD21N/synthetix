import { Cpu, Network, Zap, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

interface HeaderProps {
  isScanning?: boolean;
}

export function Header({ isScanning = false }: HeaderProps) {
  const { user, signIn, logOut } = useAuth();
  
  const [latency, setLatency] = useState<number>(12);
  const [coreUsage, setCoreUsage] = useState<number>(18);
  
  // Latency ping
  useEffect(() => {
    const checkLatency = async () => {
      const start = performance.now();
      try {
        await fetch('https://dns.google/resolve?name=google.com', { mode: 'no-cors', cache: 'no-cache' });
        const end = performance.now();
        setLatency(Math.floor(end - start));
      } catch (e) {
        const end = performance.now();
        setLatency(Math.floor(end - start) || 24);
      }
    };
    
    checkLatency();
    const interval = setInterval(checkLatency, 5000);
    return () => clearInterval(interval);
  }, []);

  // Core Usage Simulation
  useEffect(() => {
    let interval: number;
    
    if (isScanning) {
      setCoreUsage(Math.floor(82 + Math.random() * 15));
      interval = window.setInterval(() => {
        setCoreUsage(Math.floor(82 + Math.random() * 15));
      }, 700);
    } else {
      setCoreUsage(Math.floor(14 + Math.random() * 9));
      interval = window.setInterval(() => {
        setCoreUsage(Math.floor(14 + Math.random() * 9));
      }, 1500);
    }
    
    return () => clearInterval(interval);
  }, [isScanning]);

  const userName = 'STAR BOY';

  return (
    <header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-cyan-glow/20 bg-obsidian-light/50 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-sm bg-obsidian neon-border-cyan group hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all cursor-pointer">
          <Zap className="w-5 h-5 text-glow-cyan group-hover:animate-pulse" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl tracking-widest text-white uppercase" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>Synthetix</h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-glow/70">Neural Code Analysis v2.4</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-6 font-mono text-[10px] sm:text-xs">
        <div className="hidden sm:flex items-center gap-2">
          <Cpu className="w-4 h-4 text-violet-glow" />
          <span className="text-gray-400 tracking-wider">CORE USAGE: <span className="text-white text-glow-violet transition-all duration-300">{coreUsage}%</span></span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-glow" />
          <span className="text-gray-400 tracking-wider">LATENCY: <span className="text-white text-glow-cyan transition-all duration-300">{latency}ms</span></span>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-cyan-glow/10 border border-cyan-glow/30">
          <div className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
          <span className="text-glow-cyan font-bold tracking-[0.15em] text-[10px]">ONLINE</span>
        </div>
        <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block"></div>
        {user ? (
          <div className="flex items-center gap-4">
             <span className="text-gray-400 text-[10px] tracking-widest uppercase hidden sm:inline">{userName}</span>
             <button onClick={logOut} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors uppercase tracking-[0.2em] text-[10px] border border-red-500/30 px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20">
               <LogOut className="w-3 h-3" />
               <span className="hidden sm:inline">Disconnect</span>
             </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-[10px] tracking-widest uppercase hidden sm:inline">{userName}</span>
            <button onClick={signIn} className="flex items-center gap-2 text-cyan-glow hover:text-white transition-colors uppercase tracking-[0.2em] text-[10px] border border-cyan-glow/30 px-3 py-1.5 rounded bg-cyan-glow/10 hover:bg-cyan-glow/20">
              <LogIn className="w-3 h-3" />
              <span className="hidden sm:inline">Connect Auth</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
