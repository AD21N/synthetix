import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SynthetixGuard extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SynthetixGuard caught an error:', error, errorInfo);
  }

  private handleReboot = () => {
    // Clear application cache/storage and forcefully reload the interface
    localStorage.removeItem('synthetix_history');
    sessionStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-obsidian flex flex-col items-center justify-center p-6 text-white font-mono selection:bg-red-500/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,0,0,0.05)_0%,rgba(255,0,0,0.1)_50%,rgba(255,0,0,0.05)_100%)] pointer-events-none animate-[pulse_2s_infinite]" />
          
          {/* Glitch Overlay Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-20 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />

          <div className="z-10 bg-black/60 border border-red-500/40 p-8 rounded-lg max-w-2xl w-full shadow-[0_0_60px_rgba(239,68,68,0.25)] backdrop-blur-xl flex flex-col items-center text-center">
            
            <div className="relative">
              <AlertTriangle className="w-16 h-16 text-red-500 mb-6 animate-[pulse_1.5s_infinite]" />
              <AlertTriangle className="w-16 h-16 text-red-400 absolute top-0 left-0 blur-md opacity-50" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-display font-black text-red-500 tracking-[0.2em] mb-4 uppercase relative">
              <span className="drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">Critical System Failure</span>
            </h1>
            
            <div className="w-full bg-red-950/30 border border-red-500/30 p-5 rounded-md text-left mb-8 overflow-auto max-h-48 custom-scrollbar shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]">
              <p className="text-red-400 font-bold mb-3 text-[10px] tracking-widest uppercase">/// Error Trace Segment</p>
              <pre className="text-red-300 text-[11px] whitespace-pre-wrap font-mono leading-relaxed">
                {this.state.error?.message || 'Unknown catastrophic anomaly detected in neural routing.'}
              </pre>
            </div>
            
            <button 
              onClick={this.handleReboot}
              className="group relative px-8 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500 text-red-400 hover:text-red-300 font-display font-bold tracking-[0.3em] uppercase text-xs rounded transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] overflow-hidden flex items-center gap-3"
            >
              <div className="absolute inset-0 w-full h-full bg-[linear-gradient(90deg,transparent,rgba(239,68,68,0.2),transparent)] -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />
              <RotateCcw className="w-4 h-4 relative z-10 group-hover:-rotate-180 transition-transform duration-700" />
              <span className="relative z-10">Reboot Interface</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
