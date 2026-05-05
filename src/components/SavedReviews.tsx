import { useEffect, useState } from 'react';
import { Clock, FileCode2 } from 'lucide-react';
import { AIReviewResult } from '../services/aiService';

export interface SavedReview {
  id: string;
  code: string;
  result: AIReviewResult;
  timestamp: number;
}

export function SavedReviews({ onSelect, refreshTrigger = 0 }: { onSelect: (code: string, result: AIReviewResult) => void, refreshTrigger?: number }) {
  const [reviews, setReviews] = useState<SavedReview[]>([]);

  useEffect(() => {
    const loadHistory = () => {
      const stored = localStorage.getItem('synthetix_history');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setReviews(parsed);
          }
        } catch (e) {
          console.error('Failed to parse local history', e);
        }
      }
    };
    loadHistory();
  }, [refreshTrigger]);

  if (reviews.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 font-mono text-xs text-center border-2 border-dashed border-white/10 rounded-md bg-white/5 space-y-3 p-4">
        <Clock className="w-8 h-8 opacity-50 text-cyan-glow mb-2" />
        <span>No History Found</span>
        <span className="text-[10px] text-gray-600">Scan code to save to local trajectory array.</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
      {reviews.map(review => (
        <div 
          key={review.id} 
          onClick={() => onSelect(review.code, review.result)}
          className="p-3 border border-white/5 rounded-md bg-white/5 hover:bg-white/10 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
               <FileCode2 className="w-4 h-4 text-violet-glow" />
               <span className="font-mono text-[10px] text-gray-400">
                 {new Date(review.timestamp).toLocaleDateString()} {new Date(review.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </span>
            </div>
            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${review.result?.performanceScore > 80 ? 'bg-green-500/20 text-green-400' : review.result?.performanceScore > 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
               SCORE: {review.result?.performanceScore || 0}
            </span>
          </div>
          <div className="font-mono text-[10px] text-gray-500 truncate group-hover:text-cyan-glow/80 transition-colors">
            {review.code.substring(0, 50)}...
          </div>
        </div>
      ))}
    </div>
  );
}
