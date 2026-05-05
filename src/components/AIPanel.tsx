import { motion } from 'motion/react';
import { AlertTriangle, Activity, ShieldAlert, Fingerprint, Info, CheckCircle2, ClipboardCopy } from 'lucide-react';
import { GlitchedVisualizer } from './GlitchedVisualizer';
import { AIReviewResult } from '../services/aiService';
import { useToast } from '../contexts/ToastContext';

interface AIPanelProps {
  aiResult: AIReviewResult | null;
  isScanning: boolean;
  onRefactor: () => void;
}

export function AIPanel({ aiResult, isScanning, onRefactor }: AIPanelProps) {
  const { showToast } = useToast();
  const score = aiResult?.performanceScore || 0;
  const scoreColor = score > 80 ? 'text-green-400' : score > 50 ? 'text-yellow-400' : 'text-red-400';
  const riskLevel = score > 80 ? 'Optimal' : score > 50 ? 'Elevated Risk' : 'Critical Level';
  
  // Defensive extraction of bugs to prevent render crashes
  const safeBugs = Array.isArray(aiResult?.bugs) ? aiResult.bugs : [];

  const copyRefactor = async () => {
    if (!aiResult?.refactoredCode) return;
    try {
      await navigator.clipboard.writeText(aiResult.refactoredCode);
      showToast('Refactored code copied to clipboard.', 'success');
    } catch (err) {
      showToast('Failed to copy to clipboard.', 'error');
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
      className="flex flex-col gap-6 h-full"
    >
      {/* Main Info Card */}
      <div className="glass-panel rounded-xl p-6 neon-border-violet relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-violet-glow/20 rounded-full blur-[50px] pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-6">
          <Activity className={`w-5 h-5 text-glow-violet ${isScanning ? 'animate-spin' : 'animate-pulse'}`} />
          <h2 className="font-display font-bold text-sm tracking-[0.25em] text-white uppercase">Live Assessment</h2>
        </div>
        
        <div className="flex items-end gap-5 mb-4 relative z-10">
          {isScanning ? (
            <>
              <div className="relative">
                <div className="w-20 h-20 rounded-full skeleton-block" />
              </div>
              <div className="pb-1.5 flex flex-col gap-1 flex-1 max-w-[150px]">
                <div className="h-4 w-20 skeleton-block rounded-sm mb-1" />
                <div className="h-5 w-full skeleton-block rounded-sm" />
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                {/* SVG Circular Gauge */}
                <svg viewBox="0 0 100 100" className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(139, 92, 246, 0.2)"
                    strokeWidth="6"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={aiResult ? (score > 80 ? '#4ade80' : score > 50 ? '#facc15' : '#f87171') : '#8b5cf6'}
                    strokeWidth="6"
                    strokeDasharray="283"
                    initial={{ strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 283 - (283 * score) / 100 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className={`font-mono text-2xl font-bold ${scoreColor} drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]`}>
                    {aiResult ? score : 100}
                  </span>
                </div>
              </div>
              <div className="pb-1.5 flex flex-col gap-1">
                <div className="font-mono text-[10px] text-gray-400 tracking-[0.15em] uppercase border border-gray-700/50 bg-black/30 px-2 py-0.5 rounded-sm w-fit">Risk Score</div>
                <div className="font-display text-sm text-violet-glow uppercase font-bold glitch-hover tracking-widest text-shadow-sm">
                  {aiResult ? riskLevel : 'Awaiting Input'}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="hidden md:block">
          <GlitchedVisualizer isScanning={isScanning} />
        </div>
      </div>

      {/* Issue Stack Card */}
      <div className="flex-1 glass-panel rounded-xl p-6 overflow-hidden flex flex-col relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-glow/5 inline-block blur-[80px] pointer-events-none" />
        
        <div className="flex items-center justify-between mb-5 border-b border-cyan-glow/20 pb-4 relative z-10">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-[18px] h-[18px] text-cyan-glow" />
            <h3 className="font-display font-bold text-[13px] tracking-[0.2em] text-cyan-glow shadow-cyan-glow uppercase text-glow-cyan">Anomaly Stack</h3>
          </div>
          <span className="font-mono text-[10px] tracking-widest text-cyan-400 bg-cyan-glow/10 border border-cyan-glow/20 px-2.5 py-1 rounded-sm shadow-[0_0_10px_rgba(0,229,255,0.2)]">
            {isScanning ? 'SCANNING' : (aiResult ? `${safeBugs.length} DETECTED` : '0 DETECTED')}
          </span>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 pr-2 relative z-10">
          {isScanning ? (
            <div className="flex flex-col gap-4 w-full">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 rounded-md border border-cyan-glow/10 bg-black/40 backdrop-blur-md">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                       <div className="w-[14px] h-[14px] skeleton-block rounded-sm" />
                       <div className="h-4 w-24 skeleton-block rounded-sm" />
                    </div>
                    <div className="h-4 w-12 skeleton-block rounded-sm" />
                  </div>
                  <div className="h-6 w-3/4 skeleton-block rounded-sm mb-3 border border-white/5" />
                  <div className="space-y-2">
                    <div className="h-3 w-full skeleton-block rounded-sm" />
                    <div className="h-3 w-5/6 skeleton-block rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : !aiResult ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
               <ShieldAlert className="w-8 h-8 opacity-50" />
               <div className="font-mono text-xs tracking-widest uppercase">System idle. Ready for code scan.</div>
            </div>
          ) : safeBugs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-green-400 space-y-4">
               <CheckCircle2 className="w-8 h-8 opacity-80 shadow-[0_0_15px_rgba(74,222,128,0.5)] rounded-full" />
               <div className="font-mono text-xs tracking-widest uppercase">No critical anomalies found.</div>
            </div>
          ) : (
            safeBugs.map((bug, i) => {
              // Defensive property extraction in case AI output structure is weird
              const severity = (typeof bug === 'object' && bug !== null ? (bug as any).severity : 'LOW') as string;
              const title = typeof bug === 'object' && bug !== null ? (bug as any).title : 'Unknown Issue';
              const trigger = typeof bug === 'object' && bug !== null ? (bug as any).trigger : 'Unknown';
              const desc = typeof bug === 'object' && bug !== null ? (bug as any).desc : String(bug);
              
              return (
                <IssueCard 
                  key={i}
                  icon={severity === 'CRITICAL' ? <ShieldAlert className="w-[14px] h-[14px]" /> : severity === 'HIGH' ? <AlertTriangle className="w-[14px] h-[14px]" /> : <Fingerprint className="w-[14px] h-[14px]" />}
                  title={title}
                  trigger={trigger}
                  severity={severity}
                  desc={desc}
                />
              )
            })
          )}
          
          {!isScanning && aiResult && Array.isArray(aiResult.styleSuggestions) && aiResult.styleSuggestions.length > 0 && (
            <div className="mt-4 p-4 border border-blue-500/30 bg-blue-900/10 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="font-display text-[11px] text-blue-400 uppercase tracking-widest font-bold">Style Suggestions</span>
              </div>
              <ul className="list-disc pl-5 font-sans text-xs text-blue-200/80 space-y-1">
                {aiResult.styleSuggestions.map((s, i) => (
                  <li key={i}>{String(s)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="mt-5 flex gap-3 relative z-10">
          <button 
            onClick={copyRefactor}
            disabled={isScanning || !aiResult?.refactoredCode}
            className={`flex-none px-4 flex items-center justify-center font-display uppercase tracking-widest text-[10px] rounded-sm transition-all duration-300 relative group overflow-hidden ${
               isScanning || !aiResult?.refactoredCode 
               ? 'bg-gray-800/50 text-gray-500 border border-gray-700 cursor-not-allowed hidden'
               : 'bg-violet-glow/10 hover:bg-violet-glow/20 border border-violet-glow text-violet-300 hover:text-white shadow-[inset_0_0_10px_rgba(139,92,246,0.15)]'
            }`}>
            <ClipboardCopy className="w-4 h-4" />
          </button>
          
          <button 
            onClick={onRefactor}
            disabled={isScanning || !aiResult?.refactoredCode}
            className={`flex-1 font-display uppercase tracking-[0.25em] text-xs py-4 rounded-sm transition-all duration-300 relative group overflow-hidden ${
               isScanning || !aiResult?.refactoredCode 
               ? 'bg-gray-800/50 text-gray-500 border border-gray-700 cursor-not-allowed'
               : 'bg-cyan-glow/10 hover:bg-cyan-glow/20 border border-cyan-glow text-glow-cyan hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] shadow-[inset_0_0_10px_rgba(0,229,255,0.15)]'
            }`}>
            {!isScanning && aiResult?.refactoredCode && (
              <div className="absolute inset-0 w-full h-full bg-[linear-gradient(90deg,transparent,rgba(0,229,255,0.2),transparent)] -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />
            )}
            <span className="relative">Apply AI Refactor</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function IssueCard({ icon, title, trigger, severity, desc }: any) {
  const isCritical = severity === 'CRITICAL';
  const isHigh = severity === 'HIGH';
  
  return (
    <div className={`p-4 rounded-md border backdrop-blur-md transition-all hover:bg-opacity-80
      ${isCritical 
        ? 'border-red-500/40 bg-red-950/20 border-l-[3px] border-l-red-500 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)] hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
        : isHigh ? 'border-yellow-500/40 bg-yellow-950/20 border-l-[3px] border-l-yellow-500 shadow-[inset_0_0_20px_rgba(234,179,8,0.05)] hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]'
        : 'border-violet-glow/40 bg-violet-950/20 border-l-[3px] border-l-violet-glow shadow-[inset_0_0_20px_rgba(139,92,246,0.05)] hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]'}`}>
      
      <div className="flex justify-between items-start mb-3">
        <div className={`flex items-center gap-2 ${isCritical ? 'text-red-400' : isHigh ? 'text-yellow-400' : 'text-violet-400'}`}>
          {icon}
          <span className="font-display text-[11px] uppercase font-bold tracking-[0.15em]">{title}</span>
        </div>
        <span className={`font-mono text-[9px] px-2 py-0.5 rounded-sm tracking-widest border
          ${isCritical ? 'bg-red-500/10 text-red-400 border-red-500/30' : isHigh ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-violet-500/10 text-violet-400 border-violet-500/30'}`}>
          {severity}
        </span>
      </div>
      
      <div className="font-mono text-[10px] text-gray-300 bg-obsidian/80 px-2.5 py-1.5 rounded inline-block mb-3 border border-white/5 shadow-inner">
        <span className="text-gray-600 mr-2">&gt;</span>
        {trigger}
      </div>
      
      <p className="font-sans text-[11px] text-gray-400 leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  );
}
