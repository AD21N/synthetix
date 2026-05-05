import { useState, lazy, Suspense, useCallback } from 'react';
import { Header } from './components/Header';
import { AIPanel } from './components/AIPanel';
import { AIReviewResult, analyzeCode } from './services/aiService';
import { useAuth } from './contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { SavedReviews } from './components/SavedReviews';
import { useToast } from './contexts/ToastContext';

const CodeSpace = lazy(() => import('./components/CodeSpace').then(m => ({ default: m.CodeSpace })));

const DEFAULT_CODE = `import { SecureNeuralNet } from '@synthetix/core';
import { analyzeAST, executeSafely } from './utils';

export class TransactionProcessor {
    private validator: SecureNeuralNet;
    
    constructor() {
        // Initialize with deep-learning threat model
        this.validator = new SecureNeuralNet({
            mode: 'PARANOID',
            heuristicLevels: 5
        });
    }
    
    async process(payload: Buffer): Promise<Result> {
        try {
            // WARNING: Potential race condition detected in AST bypass
            const tree = analyzeAST(payload);
            const isSafe = await this.validator.verify(tree);
            
            if (!isSafe) {
                throw new SecurityError('Neural block triggered.');
            }
            
            return executeSafely(payload);
        } catch (err) {
            this.logMaliciousActivity(err);
            return Result.DENY;
        }
    }
}`;

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [isScanning, setIsScanning] = useState(false);
  const [aiResult, setAiResult] = useState<AIReviewResult | null>(null);
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'code' | 'diff'>('code');

  const handleScan = useCallback(async () => {
    setIsScanning(true);
    let successToastRef = null;
    try {
      const result = await analyzeCode(code);
      setAiResult(result);
      setViewMode('diff'); // Automatically switch to diff view when scan finishes with a refactored code
      showToast('Core analysis complete.', 'success');
      
      // Save logic to LocalStorage (as requested)
      const newReview = { id: Date.now().toString(), code, result, timestamp: Date.now() };
      const stored = localStorage.getItem('synthetix_history');
      let history = stored ? JSON.parse(stored) : [];
      history = [newReview, ...history].slice(0, 50);
      localStorage.setItem('synthetix_history', JSON.stringify(history));
      setRefreshTrigger(prev => prev + 1);
      
      // Also save to Firebase if authenticated
      if (user) {
        try {
          const docRef = doc(collection(db, 'reviews'));
          await setDoc(docRef, {
            userId: user.uid,
            code,
            bugs: result.bugs,
            performanceScore: result.performanceScore,
            styleSuggestions: result.styleSuggestions,
            refactoredCode: result.refactoredCode,
            createdAt: serverTimestamp()
          });
        } catch (dbError) {
          console.error(dbError);
          // showToast('Failed to save telemetry to neural net.', 'error');
        }
      }
      
    } catch (error) {
      console.error('Failed to analyze code:', error);
      showToast(error instanceof Error ? error.message : 'Analysis failed. API connection interrupted.', 'error');
    } finally {
      setIsScanning(false);
    }
  }, [code, user, showToast]);

  return (
    <div className="h-screen bg-circuitry relative text-white selection:bg-cyan-glow/30 selection:text-white flex flex-col overflow-hidden">
      {/* Vignette Overlay Layer */}
      <div className="absolute inset-0 bg-obsidian-light/40 mix-blend-multiply z-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
      
      <Header isScanning={isScanning} />
      
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-8 relative z-10 h-full max-h-[calc(100vh-73px)] overflow-hidden">
        {/* Left Column: History/Dashboard (Collapsible) */}
        {isSidebarOpen && (
          <div className="lg:w-80 flex-none h-[300px] lg:h-full glass-panel rounded-xl flex flex-col p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-cyan-glow uppercase tracking-widest text-xs font-bold select-none">Saved Reviews</h3>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <SavedReviews 
              refreshTrigger={refreshTrigger} 
              onSelect={(c, r) => { setCode(c); setAiResult(r); }} 
            />
          </div>
        )}
        
        {!isSidebarOpen && (
           <div className="absolute top-4 left-4 z-50 lg:static lg:flex-none">
             <button onClick={() => setIsSidebarOpen(true)} className="glass-panel p-2 rounded text-cyan-glow hover:text-white border border-cyan-glow/20 bg-black/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
             </button>
           </div>
        )}

        {/* Center Column: Heavy Code Editor (Lazy Loaded) */}
        <div className="flex-1 h-[500px] lg:h-full min-h-0 flex flex-col min-w-0">
          <Suspense fallback={
            <div className="h-full flex items-center justify-center font-mono text-cyan-glow text-sm animate-pulse glass-panel rounded-xl tracking-widest uppercase">
              Initializing Neural Editor...
            </div>
          }>
            <CodeSpace code={code} setCode={setCode} isScanning={isScanning} onScan={handleScan} refactoredCode={aiResult?.refactoredCode} viewMode={viewMode} onViewModeChange={setViewMode} />
          </Suspense>
        </div>

        {/* Right Column: AI Insights */}
        <div className="lg:w-96 flex-none h-[600px] lg:h-full min-h-0">
          <AIPanel aiResult={aiResult} isScanning={isScanning} onRefactor={() => {
            if (aiResult?.refactoredCode) {
              setCode(aiResult.refactoredCode);
              setAiResult(null); // Optional: clear result after apply? Or just switch view mode.
              setViewMode('code');
              showToast('Refactored code applied successfully.', 'success');
            }
          }} />
        </div>
      </main>

      {/* Cyberpunk Decorator Lines */}
      <div className="hidden lg:block fixed top-0 bottom-0 left-8 w-px bg-gradient-to-b from-cyan-glow/0 via-cyan-glow/20 to-cyan-glow/0 pointer-events-none z-0" />
      <div className="hidden lg:block fixed top-0 bottom-0 right-8 w-px bg-gradient-to-b from-violet-glow/0 via-violet-glow/20 to-violet-glow/0 pointer-events-none z-0" />
    </div>
  );
}

