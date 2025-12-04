import React, { useMemo } from 'react';
import { Maximize2, AlertCircle } from 'lucide-react';

interface DiagramViewProps {
  code: string;
  title: string;
}

export const DiagramView: React.FC<DiagramViewProps> = ({ code, title }) => {
  
  // Convert Mermaid code to base64 for mermaid.ink
  const diagramUrl = useMemo(() => {
    try {
      // Configuration for mermaid.ink
      const state = {
        code: code,
        mermaid: {
          theme: 'dark',
          themeVariables: {
            darkMode: true,
            background: '#1e293b',
            primaryColor: '#6366f1',
            lineColor: '#94a3b8'
          }
        }
      };
      const json = JSON.stringify(state);
      const encoded = btoa(unescape(encodeURIComponent(json)));
      return `https://mermaid.ink/img/${encoded}`;
    } catch (e) {
      return null;
    }
  }, [code]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <span className="font-semibold text-slate-200 text-sm flex items-center gap-2">
          {title}
        </span>
        <a 
            href={`https://mermaid.live/edit#base64:${btoa(unescape(encodeURIComponent(JSON.stringify({ code: code, mermaid: { theme: 'default' } }))))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          <Maximize2 className="w-3 h-3" /> Live Editor
        </a>
      </div>
      <div className="flex-1 bg-[#1e293b] p-4 flex items-center justify-center min-h-[300px] overflow-auto relative">
         <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>
         {diagramUrl ? (
             <img 
                src={diagramUrl} 
                alt={`${title} Diagram`} 
                className="max-w-full h-auto rounded shadow-lg"
                loading="lazy"
             />
         ) : (
             <div className="flex flex-col items-center gap-2 text-slate-500">
                <AlertCircle className="w-8 h-8" />
                <span className="text-sm">Could not render diagram. Check code.</span>
             </div>
         )}
      </div>
      <details className="bg-black/20 border-t border-slate-800">
        <summary className="px-4 py-2 text-xs text-slate-500 cursor-pointer hover:text-slate-300 select-none">
            View Mermaid Code
        </summary>
        <div className="p-4 bg-black/40">
            <pre className="text-[10px] font-mono text-slate-400 overflow-x-auto whitespace-pre-wrap">
                {code}
            </pre>
        </div>
      </details>
    </div>
  );
};