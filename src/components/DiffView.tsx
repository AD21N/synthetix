import ReactDiffViewer from 'react-diff-viewer-next';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface DiffViewProps {
  originalCode: string;
  refactoredCode: string;
}

export function DiffView({ originalCode, refactoredCode }: DiffViewProps) {
  const highlightSyntax = (str: string) => (
    <SyntaxHighlighter
      language="typescript"
      style={vscDarkPlus}
      customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
      wrapLines={true}
    >
      {str}
    </SyntaxHighlighter>
  );

  const neonStyles = {
    variables: {
      dark: {
        diffViewerBackground: 'transparent',
        diffViewerColor: '#e2e8f0', // slate-200
        addedBackground: 'rgba(0, 229, 255, 0.1)', // neon cyan bg
        addedColor: '#67e8f9', // cyan-300
        removedBackground: 'rgba(139, 92, 246, 0.1)', // violet bg
        removedColor: '#c4b5fd', // violet-300
        wordAddedBackground: 'rgba(0, 229, 255, 0.3)',
        wordRemovedBackground: 'rgba(139, 92, 246, 0.3)',
        addedGutterBackground: 'rgba(0, 229, 255, 0.15)',
        removedGutterBackground: 'rgba(139, 92, 246, 0.15)',
        gutterBackground: 'transparent',
        gutterBackgroundDark: 'transparent',
        highlightBackground: 'rgba(255, 255, 255, 0.05)',
        highlightGutterBackground: 'rgba(255, 255, 255, 0.05)',
        codeFoldGutterBackground: 'rgba(0, 0, 0, 0.2)',
        codeFoldBackground: 'rgba(0, 0, 0, 0.2)',
        emptyLineBackground: 'transparent',
        gutterColor: '#64748b', // slate-500
        addedGutterColor: '#22d3ee', // cyan-400
        removedGutterColor: '#a78bfa', // violet-400
      }
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#121214] font-mono text-[12px] rounded-xl rounded-t-none border border-cyan-glow/20 border-t-0 p-4">
      <ReactDiffViewer
        oldValue={originalCode}
        newValue={refactoredCode}
        splitView={true}
        useDarkTheme={true}
        styles={neonStyles}
        renderContent={highlightSyntax}
        showDiffOnly={false}
      />
    </div>
  );
}
