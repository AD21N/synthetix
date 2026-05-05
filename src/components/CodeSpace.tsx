import { motion } from 'motion/react';
import { Code2, Terminal, ScanLine, GitCompare } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism-tomorrow.css';
import { useState } from 'react';
import { DiffView } from './DiffView';

const highlightCode = (code: string) => {
  return Prism.highlight(code, Prism.languages.typescript, 'typescript');
};

interface CodeSpaceProps {
  code: string;
  setCode: (c: string) => void;
  isScanning: boolean;
  onScan: () => void;
  refactoredCode?: string;
  viewMode?: 'code' | 'diff';
  onViewModeChange?: (mode: 'code' | 'diff') => void;
}

export function CodeSpace({ code, setCode, isScanning, onScan, refactoredCode, viewMode = 'code', onViewModeChange }: CodeSpaceProps) {
  const isDiff = viewMode === 'diff' && !!refactoredCode;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col h-full glass-panel rounded-xl overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.8)]"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-glow/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex items-center justify-between px-6 py-3 border-b border-cyan-glow/20 bg-obsidian-light/80 relative z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Code2 className="w-4 h-4 text-cyan-glow" />
            <span className="font-mono text-[11px] text-glow-cyan tracking-[0.2em] uppercase font-bold">transaction_processor.ts</span>
          </div>
          
          {refactoredCode && onViewModeChange && (
            <div className="flex bg-black/40 p-1 rounded-md border border-cyan-glow/20">
              <button 
                onClick={() => onViewModeChange('code')}
                className={`px-3 py-1 text-[10px] uppercase font-mono tracking-widest rounded ${!isDiff ? 'bg-cyan-glow/20 text-cyan-glow shadow-[0_0_10px_rgba(0,255,255,0.2)]' : 'text-gray-500 hover:text-cyan-glow/70'}`}
              >
                Editor
              </button>
              <button 
                onClick={() => onViewModeChange('diff')}
                className={`flex gap-1.5 items-center px-3 py-1 text-[10px] uppercase font-mono tracking-widest rounded ${isDiff ? 'bg-violet-glow/20 text-violet-glow shadow-[0_0_10px_rgba(139,92,246,0.2)]' : 'text-gray-500 hover:text-violet-glow/70'}`}
              >
                <GitCompare className="w-3 h-3" />
                Diff View
              </button>
            </div>
          )}
        </div>
        
        <div className="flex gap-4 items-center">
          <button
            onClick={onScan}
            disabled={isScanning}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-sm border ${
              isScanning 
                ? 'border-cyan-glow bg-cyan-glow/20 text-cyan-glow shadow-[0_0_15px_rgba(0,255,255,0.4)]' 
                : 'border-cyan-glow/30 hover:border-cyan-glow/80 hover:bg-cyan-glow/10 text-cyan-glow/80 hover:text-cyan-glow'
            } transition-all font-display text-[10px] tracking-widest uppercase`}
          >
            {isScanning && <ScanLine className="w-3 h-3 animate-[spin_1.5s_linear_infinite]" />}
            {!isScanning && <ScanLine className="w-3 h-3" />}
            {isScanning ? 'Scanning...' : 'Scan Code'}
          </button>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
            <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar relative z-10 bg-transparent text-[13px] font-mono leading-relaxed group">
        {isDiff ? (
          <DiffView originalCode={code} refactoredCode={refactoredCode} />
        ) : (
          <div className="p-4 min-h-full">
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={highlightCode}
              padding={10}
              className="editor-override min-h-full"
              spellCheck={false}
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                backgroundColor: 'transparent',
                outline: 'none',
              }}
            />
          </div>
        )}
        {isScanning && !isDiff && (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            <div className="w-full h-1 bg-cyan-400/80 shadow-[0_0_20px_rgba(0,255,255,1)] animate-[scan_2s_ease-in-out_infinite]" />
             <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,255,255,0.05)_0%,rgba(0,255,255,0.1)_50%,rgba(0,255,255,0.05)_100%)] animate-[pulse_1.5s_infinite]" />
          </div>
        )}
      </div>
      
      <div className="px-6 py-3 border-t border-cyan-glow/20 bg-obsidian/80 flex items-center justify-between relative z-10">
         <div className="flex items-center gap-3 font-mono text-[11px] text-gray-400">
           <Terminal className="w-4 h-4 text-violet-glow" />
           <span className="uppercase tracking-widest text-violet-400">sys_ready <span className="text-gray-500">&gt;</span> {isScanning ? 'ANALYZING_AST...' : isDiff ? 'VIEWING_DIFF...' : 'awaiting manual override...'}</span>
         </div>
         <div className="font-mono text-[10px] text-gray-500 tracking-[0.2em] uppercase">UTF-8 • TSX</div>
      </div>
    </motion.div>
  );
}
