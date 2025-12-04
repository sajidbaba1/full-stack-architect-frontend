import React from 'react';
import { AppIdea, AppDifficulty } from '../types';
import { Server, Database, Code, ArrowRight } from 'lucide-react';

interface IdeaCardProps {
  idea: AppIdea;
  onSelect: (idea: AppIdea) => void;
  isSelected: boolean;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onSelect, isSelected }) => {
  const difficultyColors = {
    [AppDifficulty.BEGINNER]: "bg-green-500/20 text-green-400 border-green-500/30",
    [AppDifficulty.INTERMEDIATE]: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    [AppDifficulty.ADVANCED]: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    [AppDifficulty.EXPERT]: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div 
      onClick={() => onSelect(idea)}
      className={`relative group p-6 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full
        ${isSelected 
          ? 'bg-slate-800/80 border-indigo-500 shadow-xl shadow-indigo-500/10 scale-[1.02]' 
          : 'bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800/60'
        }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
            {idea.title}
          </h3>
          <p className="text-sm text-slate-400 mt-1 italic">{idea.tagline}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${difficultyColors[idea.difficulty]}`}>
          {idea.difficulty}
        </span>
      </div>

      <p className="text-slate-300 text-sm mb-6 leading-relaxed flex-grow">
        {idea.description}
      </p>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold">
          <Code className="w-3 h-3" /> Core Features
        </div>
        <div className="flex flex-wrap gap-2">
          {idea.coreFeatures.slice(0, 5).map((feature, i) => (
            <span key={i} className="bg-slate-700/50 px-2 py-1 rounded text-xs text-slate-300 border border-slate-600/50">
              {feature}
            </span>
          ))}
          {idea.coreFeatures.length > 5 && (
            <span className="bg-indigo-900/30 px-2 py-1 rounded text-xs text-indigo-300 border border-indigo-500/30">
              +{idea.coreFeatures.length - 5} more
            </span>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-slate-400 text-xs">
                <Server className="w-3 h-3" /> Spring Boot
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-xs">
                <Database className="w-3 h-3" /> JPA
            </div>
        </div>
        <button className="text-indigo-400 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
          View Blueprint <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};